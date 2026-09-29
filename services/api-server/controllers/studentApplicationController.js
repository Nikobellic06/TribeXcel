const Application = require('../models/Application');
const ApplicationDraft = require('../models/ApplicationDraft');
const Document = require('../models/Document');
const { logAuditEvent } = require('../services/auditService');
const { evaluate } = require('../services/ruleEngine');
const aiAnalysis = require('../services/aiAnalysis');
const review = require('../services/review');
const { processApplicationDocumentAnalysis } = require('../services/documentAnalysisEngine');
const { parseFlexibleDate } = require('../utils/date');

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SUPPORTED_SCHEMES = ['NFST', 'NOS', 'PRE_MATRIC', 'POST_MATRIC', 'TOP_CLASS'];
const CURRENT_SESSION = '2026-27';

function generateApplicationCode(scheme, session = CURRENT_SESSION) {
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TX-${session}-${scheme}-${rand}`;
}

function sanitizeSections(sections) {
  if (!sections || typeof sections !== 'object' || Array.isArray(sections)) return null;
  const out = {};
  ['identity', 'personal', 'category', 'academic', 'programme', 'foreign_university', 'employment_gap', 'family_income', 'bank', 'declarations'].forEach((key) => {
    const value = sections[key];
    out[key] = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : (Array.isArray(value) ? [...value] : {});
  });
  if (out.bank && out.bank.confirmAccountNumber) {
    delete out.bank.confirmAccountNumber;
  }
  return out;
}

/**
 * POST /api/student/applications
 * Server-side authoritative validation and submission
 */
const submitApplication = async (req, res) => {
  try {
    const body = req.body || {};
    const { scheme, name, email, phone, dob, gender, state, district, course, institution } = body;

    // Check scheme validity
    if (!SUPPORTED_SCHEMES.includes(scheme)) {
      return res.status(400).json({
        success: false,
        message: `Invalid scheme: ${scheme}. Supported schemes are NFST, NOS, PRE_MATRIC, POST_MATRIC, and TOP_CLASS.`,
      });
    }

    const requiredFields = { name, email, phone, dob, gender, state, district };
    for (const [key, val] of Object.entries(requiredFields)) {
      if (!val) {
        return res.status(400).json({ success: false, message: `Applicant ${key} is required` });
      }
    }

    const parsedDob = parseFlexibleDate(dob);
    if (!parsedDob || isNaN(new Date(parsedDob).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid Date of Birth provided' });
    }

    const sections = sanitizeSections(body.sections) || {};
    const declarations = sections.declarations || {};
    if (!declarations.truthful || !declarations.consent) {
      return res.status(400).json({
        success: false,
        message: 'Please review and accept the official statutory declarations before submitting.',
      });
    }

    const session = typeof body.session === 'string' && /^\d{4}-\d{2}$/.test(body.session) ? body.session : CURRENT_SESSION;
    const studentId = req.student._id;

    // Check for existing application
    const existingApp = await Application.findOne({
      student: studentId,
      scheme,
      session,
    }).sort({ createdAt: -1 });

    // Locked application: only an application with status 'Deficient' can be modified/resubmitted
    if (existingApp && existingApp.status !== 'Deficient' && existingApp.status !== 'Resubmission Required') {
      return res.status(409).json({
        success: false,
        message: `An application has already been submitted for ${scheme} in session ${session}. Applications are locked once submitted.`,
        applicationCode: existingApp.applicationCode,
        status: existingApp.status,
      });
    }

    // Authoritative Document Cross-Verification:
    // Never trust frontend verification flags or frontend source=digilocker directly!
    // Every attached document must be validated against the Document database collection.
    const rawDocs = Array.isArray(body.documents) ? body.documents : [];
    const verifiedDocumentsList = [];

    for (const d of rawDocs) {
      if (!d || !d.name) continue;
      const docType = d.docType || d.name;

      // Look up authoritative document record for this student
      const dbDoc = await Document.findOne({
        studentId,
        documentType: docType,
      }).sort({ updatedAt: -1 });

      if (dbDoc && dbDoc.source === 'digilocker' && (dbDoc.verificationStatus === 'VERIFIED' || dbDoc.verificationStatus === 'SANDBOX_SOURCE_CONFIRMED')) {
        // Authenticated DigiLocker document verified server-side
        verifiedDocumentsList.push({
          documentId: dbDoc.documentId,
          name: d.name,
          docType,
          source: 'digilocker',
          verified: true,
          verificationStatus: 'VERIFIED',
          verificationMethod: 'DIGILOCKER_TRUSTED_API',
          fileUrl: dbDoc.fileUrl,
          fileName: dbDoc.fileName,
          mimeType: dbDoc.mimeType,
          size: dbDoc.fileSize,
          digilockerUri: dbDoc.digilocker?.documentUri || '',
          issuer: dbDoc.digilocker?.issuerName || '',
          certificateNo: dbDoc.digilocker?.certificateNo || '',
          extractedData: dbDoc.extractedData || {},
          crossCheckStatus: dbDoc.crossCheckStatus || 'PASSED',
        });
      } else if (dbDoc && dbDoc.source === 'manual') {
        // Manual document uploaded to backend
        verifiedDocumentsList.push({
          documentId: dbDoc.documentId,
          name: d.name,
          docType,
          source: 'manual',
          verified: false, // Manual uploads require AI/Officer verification
          verificationStatus: 'PENDING',
          verificationMethod: 'AI_ASSISTED_OFFICER_VERIFIED',
          fileUrl: dbDoc.fileUrl,
          fileName: dbDoc.fileName,
          mimeType: dbDoc.mimeType,
          size: dbDoc.fileSize,
          extractedData: dbDoc.extractedData || {},
          crossCheckStatus: 'NOT_CHECKED',
        });
      } else {
        // Document not found in backend or untrusted source
        verifiedDocumentsList.push({
          name: d.name,
          docType,
          source: 'manual',
          verified: false,
          verificationStatus: 'PENDING',
          fileUrl: d.fileUrl && d.fileUrl.startsWith(`/uploads/${studentId}/`) ? d.fileUrl : '',
          fileName: d.fileName ? String(d.fileName).slice(0, 120) : '',
          mimeType: d.mimeType || 'application/pdf',
          size: Number(d.size) || 0,
        });
      }
    }

    const declaredIncome = body.declared_income !== undefined && body.declared_income !== null && body.declared_income !== '' ? Number(body.declared_income) : null;
    const declaredMarks = body.declared_marks !== undefined && body.declared_marks !== null && body.declared_marks !== '' ? Number(body.declared_marks) : null;
    const now = new Date();

    let application;
    const isResubmission = Boolean(existingApp);

    if (isResubmission) {
      application = existingApp;
      // Archive current version snapshot
      const currentSnapshot = application.toObject();
      application.versionHistory.push({
        version: application.version,
        snapshot: currentSnapshot,
        submittedAt: application.updatedAt || now,
        resubmissionReason: body.resubmissionNotes || 'Correction submitted in response to deficiency notice',
      });

      application.version += 1;
      application.resubmissionCount = (application.resubmissionCount || 0) + 1;
      application.lastResubmittedAt = now;
      application.name = name;
      application.email = email;
      application.phone = phone;
      application.dob = parsedDob;
      application.gender = gender;
      application.state = state;
      application.district = district;
      application.course = course;
      application.institution = institution;
      application.schemeData = { sections, source: 'student-portal' };
      application.documents = verifiedDocumentsList;
      application.declaredIncome = declaredIncome;
      application.declaredMarks = declaredMarks;
      application.status = 'Under Scrutiny';
      application.currentStage = 'DOCUMENT_SCRUTINY';

      // Mark open deficiencies resolved by resubmission
      if (Array.isArray(application.deficiencies)) {
        application.deficiencies.forEach((def) => {
          if (def.status === 'OPEN') {
            def.status = 'RESOLVED';
            def.resolvedAt = now;
            def.resolutionNotes = 'Updated documentation provided by applicant.';
          }
        });
      }
    } else {
      application = new Application({
        applicationCode: generateApplicationCode(scheme, session),
        student: studentId,
        scheme,
        applicationType: body.applicationType === 'RENEWAL' ? 'RENEWAL' : 'FRESH',
        session,
        schemeVersion: '2026.1',
        ruleVersion: '2026.1',
        formVersion: '2026.1',
        documentVersion: '2026.1',
        name,
        email,
        phone,
        dob: parsedDob,
        gender,
        category: 'Scheduled Tribe',
        subTribe: sections.category?.tribeName || '',
        state,
        district,
        course,
        institution,
        status: 'Submitted',
        currentStage: 'APPLICATION_SUBMITTED',
        version: 1,
        schemeData: { sections, source: 'student-portal' },
        documents: verifiedDocumentsList,
        declaredIncome,
        declaredMarks,
        submittedAt: now,
        lastActionAt: now,
      });
    }

    // Link uploaded Document records to this application
    await Document.updateMany(
      { studentId, documentType: { $in: verifiedDocumentsList.map((d) => d.docType) } },
      { applicationId: application._id }
    );

    // Run authoritative Rule Engine
    const ruleEvaluation = evaluate(application.toObject(), req.student);
    application.eligibilitySnapshot = {
      calculatedAt: now,
      ruleVersion: '2026.1',
      status: ruleEvaluation.preliminaryResult || 'REQUIRES_HUMAN_REVIEW',
      preliminaryResult: ruleEvaluation.preliminaryResult || 'REQUIRES_HUMAN_REVIEW',
      checks: (ruleEvaluation.results || []).map((r) => ({
        code: r.id,
        title: r.label,
        passed: r.status === 'PASS',
        details: `${r.status}: ${r.detail || ''}`,
      })),
      remarks: 'Automated preliminary rule evaluation completed. Official scrutiny required.',
    };

    // Save initial state so document analysis engine has persistent application context
    await application.save();

    // Authoritative Post-Submission Document Analysis & Cross-Validation Engine
    let analysisResult = null;
    try {
      analysisResult = await processApplicationDocumentAnalysis(application, req.student);
    } catch (analysisErr) {
      console.error('[DocumentAnalysisEngine] Error processing application documents:', analysisErr);
    }

    // Secondary AI Analysis telemetry if available
    try {
      const { analysis, raw } = await aiAnalysis.run({ ...application.toObject(), documents: verifiedDocumentsList });
      if (application.aiVerification && raw?.aiVerification?.checks) {
        application.aiVerification.checks = raw.aiVerification.checks;
      }
    } catch (_) {}

    await application.save();

    // Remove draft from MongoDB
    ApplicationDraft.deleteOne({ student: studentId, scheme }).catch(() => {});

    // Log immutable audit event
    await logAuditEvent({
      userId: studentId,
      userName: name,
      userRole: 'Applicant',
      action: isResubmission ? 'APPLICATION_RESUBMITTED' : 'APPLICATION_SUBMITTED',
      entityType: 'Application',
      entityId: application._id,
      newValue: {
        applicationCode: application.applicationCode,
        scheme,
        session,
        version: application.version,
        status: application.status,
      },
      ipAddress: req.ip || '',
      reason: isResubmission ? 'Resubmission with resolved deficiencies' : 'Direct scheme application submission',
    });

    res.status(201).json({
      success: true,
      message: analysisResult?.message || (isResubmission ? 'Application successfully resubmitted' : 'Application submitted successfully'),
      application,
      analysis: analysisResult,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate application detected, please retry.' });
    }
    res.status(500).json({ success: false, message: 'Application processing error: ' + err.message });
  }
};

/**
 * GET /api/student/applications
 */
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.student._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      applications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve applications' });
  }
};

/**
 * GET /api/student/applications/:id
 */
const getMyApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.student._id,
    });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({
      success: true,
      application,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve application details' });
  }
};

/**
 * POST /api/student/applications/:id/resolve-deficiency
 * Targeted correction submission for an open deficiency
 */
const resolveDeficiency = async (req, res) => {
  try {
    const { deficiencyId, updatedValue, documentData, remarks } = req.body || {};
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.student._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const deficiency = application.deficiencies.find((d) => d.deficiencyId === deficiencyId);
    if (!deficiency) {
      return res.status(404).json({ success: false, message: 'Deficiency record not found' });
    }

    const now = new Date();
    deficiency.status = 'RESOLVED';
    deficiency.resolvedAt = now;
    deficiency.resolutionNotes = remarks || 'Applicant uploaded updated document';

    // Check if all deficiencies are resolved
    const hasRemainingOpen = application.deficiencies.some((d) => d.status === 'OPEN');
    if (!hasRemainingOpen) {
      application.status = 'Under Scrutiny';
      application.currentStage = 'DOCUMENT_SCRUTINY';
    }

    application.reviewHistory.push({
      action: 'Deficiency Resolved by Student',
      fromStatus: 'Deficient',
      toStatus: application.status,
      byId: req.student._id,
      byName: req.student.name,
      byRole: 'Applicant',
      remarks: `Resolved deficiency: ${deficiency.targetLabel}`,
      at: now,
    });

    await application.save();

    await logAuditEvent({
      userId: req.student._id,
      userName: req.student.name,
      userRole: 'Applicant',
      action: 'DEFICIENCY_RESOLVED',
      entityType: 'Application',
      entityId: application._id,
      newValue: { deficiencyId, targetLabel: deficiency.targetLabel },
      ipAddress: req.ip || '',
      reason: 'Applicant submitted resolution for deficiency',
    });

    res.json({
      success: true,
      message: 'Deficiency correction recorded successfully',
      application,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/student/applications/:id/documents/:documentId
 * Secure streaming of application document with student ownership check (no IDOR)
 */
const streamStudentApplicationDocument = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.student._id,
    });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
    }

    const docParam = req.params.documentId;
    const docItem = (application.documents || []).find(
      (d) => d.documentId === docParam || d.docType === docParam || d.name === docParam
    );
    if (!docItem) {
      return res.status(404).json({ success: false, message: 'Document not found in application' });
    }

    let dbDoc = null;
    if (docItem.documentId) {
      dbDoc = await Document.findOne({ documentId: docItem.documentId, studentId: req.student._id });
    }
    if (!dbDoc) {
      dbDoc = await Document.findOne({ studentId: req.student._id, documentType: docItem.docType });
    }

    let filePath = dbDoc?.storagePath;
    if (!filePath && docItem.fileUrl) {
      const safeBase = path.join(__dirname, '..', 'uploads', String(req.student._id));
      const relative = path.basename(docItem.fileUrl);
      const candidate = path.join(safeBase, relative);
      if (fs.existsSync(candidate)) filePath = candidate;
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Physical document file not found on server' });
    }

    const mime = docItem.mimeType || dbDoc?.mimeType || 'application/pdf';
    res.setHeader('Content-Type', mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename="${docItem.fileName || 'document'}"`);
    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error streaming document: ' + err.message });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getMyApplicationById,
  resolveDeficiency,
  streamStudentApplicationDocument,
};
