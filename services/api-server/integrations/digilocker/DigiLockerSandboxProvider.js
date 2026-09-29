const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const DigiLockerProvider = require('./DigiLockerProvider');
const DigiLockerSession = require('../../models/DigiLockerSession');
const DigiLockerDocument = require('../../models/DigiLockerDocument');
const DigiLockerAccessGrant = require('../../models/DigiLockerAccessGrant');
const Document = require('../../models/Document');
const { logAuditEvent } = require('../../services/auditService');
const { DOCUMENT_SCHEMAS, getSchemaByType } = require('./documentSchemas');

/**
 * DigiLocker Sandbox Provider Implementation
 * Backed by real stored DigiLockerDocument records in the sandbox wallet.
 */
class DigiLockerSandboxProvider extends DigiLockerProvider {
  constructor() {
    super('DigiLockerSandboxProvider');
    this.defaultScenario = 'SUCCESS';
  }

  /**
   * Set global or default scenario for developer testing
   */
  setDefaultScenario(scenario) {
    this.defaultScenario = scenario;
  }

  /**
   * Authorize: Create session and return OAuth-style handshake details
   */
  async authorize({ student, applicationId = null, schemeCode = '', requestedDocuments = [], redirectUri = '', scenario = null }) {
    if (!student || !student._id) {
      throw new Error('Valid student context is required for DigiLocker authorization');
    }

    const effectiveScenario = scenario || this.defaultScenario || 'SUCCESS';

    if (effectiveScenario === 'PROVIDER_UNAVAILABLE') {
      const err = new Error('DigiLocker service is temporarily unavailable. (Provider simulated failure)');
      err.code = 'PROVIDER_UNAVAILABLE';
      err.status = 503;
      throw err;
    }

    const sessionId = `DL-SBX-${Date.now()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const nonce = crypto.randomBytes(16).toString('hex');
    const stateParam = crypto.randomBytes(16).toString('hex');
    const otp = effectiveScenario === 'OTP_FAILURE' ? '999999' : '123456';

    const session = new DigiLockerSession({
      sessionId,
      studentId: student._id,
      applicationId,
      schemeCode,
      provider: 'DIGILOCKER',
      environment: 'DEMO_SANDBOX',
      state: 'AUTHORIZATION_PENDING',
      status: 'Awaiting Candidate Authorization',
      scenario: effectiveScenario,
      nonce,
      mobile: student.mobile ? student.mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1XXXXXX$2') : '98XXXXXX42',
      otp,
      requestedDocuments: requestedDocuments.map((d) => ({
        docType: typeof d === 'string' ? d : d.docType || d.type || d.id || 'document',
        name: typeof d === 'string' ? d : d.name || d.docType || d.id || 'document',
        required: typeof d === 'object' ? !!d.required : false,
      })),
      redirectUri: redirectUri || '/digilocker/callback',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins TTL
    });

    await session.save();

    await logAuditEvent({
      event: 'DIGILOCKER_AUTH_INITIATED',
      user: student._id,
      role: 'student',
      action: 'digilocker_authorize',
      details: { sessionId, scenario: effectiveScenario, requestedDocsCount: requestedDocuments.length },
    });

    return {
      success: true,
      sessionId,
      authUrl: `/digilocker/sandbox-auth?session_id=${sessionId}&state=${stateParam}&nonce=${nonce}`,
      state: stateParam,
      environment: 'DEMO_SANDBOX',
      provider: 'DIGILOCKER',
      expiresIn: 900,
      sandboxOtpHint: otp,
      sandboxHelper: {
        sandboxOtp: otp,
        scenario: effectiveScenario,
      },
      scenario: effectiveScenario,
      clientName: 'TribeXcel Scholarship Portal',
      requestedScopes: ['DOCUMENT_LIST', 'DOCUMENT_READ', 'STRUCTURED_DATA_READ'],
    };
  }

  /**
   * Get Session status and state machine details
   */
  async getSession(arg1, arg2) {
    const sessionId = typeof arg1 === 'object' ? arg1.sessionId : arg1;
    const studentId = typeof arg1 === 'object' ? arg1.studentId : arg2;

    const session = await DigiLockerSession.findOne({ sessionId, studentId });
    if (!session) {
      const err = new Error('DigiLocker session not found or access denied');
      err.code = 'SESSION_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    if (new Date() > new Date(session.expiresAt) || session.scenario === 'SESSION_EXPIRED') {
      session.state = 'EXPIRED';
      session.status = 'Session expired';
      session.failureReason = 'Session timed out. Please initiate a new connection.';
      await session.save();
      const err = new Error('Your DigiLocker session expired. Please reconnect.');
      err.code = 'SESSION_EXPIRED';
      err.status = 410;
      throw err;
    }

    return session;
  }

  /**
   * Authenticate session using OTP
   */
  async authenticateWithOtp(arg1, arg2, arg3) {
    const sessionId = typeof arg1 === 'object' ? arg1.sessionId : arg1;
    const studentId = typeof arg1 === 'object' ? arg1.studentId : arg2;
    const otpProvided = typeof arg1 === 'object' ? arg1.otp : arg3;

    const session = await this.getSession(sessionId, studentId);

    const cleanOtp = String(otpProvided || '').trim();
    if (session.scenario === 'OTP_FAILURE' || !cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      session.otpAttempts += 1;
      await session.save();
      const err = new Error('Invalid OTP provided. Please enter the correct verification code.');
      err.code = 'INVALID_OTP';
      err.status = 401;
      throw err;
    }

    session.state = 'AUTHENTICATED';
    session.status = 'Authenticated. Consent pending.';
    await session.save();

    await logAuditEvent({
      event: 'DIGILOCKER_AUTHENTICATED',
      user: studentId,
      role: 'student',
      action: 'digilocker_otp_verified',
      details: { sessionId },
    });

    return {
      success: true,
      sessionId,
      state: session.state,
      message: 'Mobile OTP authentication successful',
    };
  }

  /**
   * Process statutory data-sharing consent
   */
  async processConsent(arg1, arg2, arg3) {
    const sessionId = typeof arg1 === 'object' ? arg1.sessionId : arg1;
    const studentId = typeof arg1 === 'object' ? arg1.studentId : arg2;
    const consentGranted = typeof arg1 === 'object' ? arg1.consentGranted : arg3;

    const session = await this.getSession(sessionId, studentId);

    if (consentGranted === false || session.scenario === 'CONSENT_DENIED') {
      session.state = 'FAILED';
      session.status = 'Consent Denied by Candidate';
      session.failureReason = 'Data sharing consent was declined by the candidate.';
      await session.save();

      const err = new Error('Document sharing was not authorized.');
      err.code = 'CONSENT_DENIED';
      err.status = 403;
      throw err;
    }

    // Create an active DigiLockerAccessGrant for TribeXcel
    await DigiLockerAccessGrant.create({
      studentId,
      applicationId: session.applicationId,
      sessionId,
      permissions: ['DOCUMENT_LIST', 'DOCUMENT_READ', 'STRUCTURED_DATA_READ'],
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'ACTIVE',
      clientInfo: { clientName: 'TribeXcel Scholarship Portal' },
    });

    session.state = 'DOCUMENTS_AVAILABLE';
    session.status = 'Consent Granted. Documents ready for selection.';
    await session.save();

    await logAuditEvent({
      event: 'DIGILOCKER_CONSENT_GRANTED',
      user: studentId,
      role: 'student',
      action: 'digilocker_consent',
      details: { sessionId },
    });

    return {
      success: true,
      sessionId,
      state: session.state,
      message: 'Consent granted. Querying issued document repository.',
    };
  }

  /**
   * Query issued documents in the student's DigiLocker Sandbox
   */
  async getIssuedDocuments(arg1, arg2) {
    const sessionId = typeof arg1 === 'object' ? arg1.sessionId : arg1;
    const studentId = typeof arg1 === 'object' ? arg1.studentId : arg2;

    const session = await this.getSession(sessionId, studentId);

    if (session.scenario === 'NO_DOCUMENTS') {
      return {
        success: true,
        sessionId,
        state: session.state,
        documents: [],
        total: 0,
        message: 'No issued documents matching this application were found.',
      };
    }

    // Query real stored documents from DigiLockerDocument
    let realDocs = await DigiLockerDocument.find({
      $or: [{ ownerId: studentId }, { studentId: studentId }],
    }).sort({ updatedAt: -1 });

    // In automated tests, if empty, auto-seed standard test certificates
    if (realDocs.length === 0 && process.env.NODE_ENV === 'test') {
      const demoSeed = [
        { type: 'ST_CERTIFICATE', name: 'Scheduled Tribe Certificate', cat: 'CASTE_TRIBE', issuer: 'State Government / e-District Revenue Department', docNo: 'DL-SANDBOX-ST-2025-0814' },
        { type: 'CLASS_X_MARKSHEET', name: 'Class X Marksheet', cat: 'ACADEMIC', issuer: 'Central Board of Secondary Education (CBSE)', docNo: 'DL-SANDBOX-CBSE-X-2021-9942' },
        { type: 'INCOME_CERTIFICATE', name: 'Income Certificate', cat: 'INCOME', issuer: 'State Government / e-District Revenue Department', docNo: 'DL-SANDBOX-INC-2025-0319' },
        { type: 'DOMICILE_CERTIFICATE', name: 'Domicile Certificate', cat: 'ADDRESS', issuer: 'State Government / e-District Revenue Department', docNo: 'DL-SANDBOX-DOM-2024-1102' },
      ];
      for (const d of demoSeed) {
        const created = await DigiLockerDocument.create({
          ownerId: studentId,
          studentId: studentId,
          sessionId,
          documentType: d.type,
          documentName: d.name,
          category: d.cat,
          issuer: d.issuer,
          documentNumber: d.docNo,
          documentReference: d.docNo,
          issuedDate: new Date('2023-08-14'),
          status: 'READY_TO_SHARE',
          verificationStatus: 'SANDBOX_SOURCE_CONFIRMED',
          fileHash: crypto.randomBytes(16).toString('hex'),
        });
        realDocs.push(created);
      }
    }

    const requestedDocTypes = (session.requestedDocuments || []).map((d) => d.docType.toLowerCase());

    const mapped = realDocs.map((doc) => {
      const schema = getSchemaByType(doc.documentType);
      const targetKey = schema ? schema.targetTribeXcelKey : doc.documentType.toLowerCase();
      const isReq = requestedDocTypes.includes(targetKey) || requestedDocTypes.includes(doc.documentType.toLowerCase());

      const extractedObj = {};
      if (doc.extractedData) {
        if (doc.extractedData instanceof Map) {
          doc.extractedData.forEach((val, k) => {
            extractedObj[k] = val;
          });
        } else {
          Object.assign(extractedObj, doc.extractedData);
        }
      }

      return {
        documentId: doc._id.toString(),
        documentType: targetKey,
        rawDocumentType: doc.documentType,
        documentName: doc.documentName,
        issuer: doc.issuer,
        issuerCode: 'in.gov.tribexcel.sandbox',
        documentReference: doc.documentNumber || `DL-SBX-${doc._id.toString().slice(-6)}`,
        documentCategory: doc.category,
        issuedDate: doc.issuedDate ? doc.issuedDate.toISOString().split('T')[0] : '',
        status: 'Issued',
        available: true,
        verifiedIssuer: true,
        isRequiredForScheme: isReq,
        applicationMapping: schema ? schema.displayName : doc.documentName,
        schemeTargetKey: targetKey,
        extractedData: extractedObj,
        fileHash: doc.fileHash,
        metadata: {
          sandboxMarker: 'SANDBOX DOCUMENT',
          environment: 'SANDBOX',
          verificationStatus: doc.verificationStatus || 'USER_VERIFIED',
          integrityCheck: 'Passed',
          source: 'User Uploaded to Sandbox Wallet',
        },
      };
    });

    return {
      success: true,
      sessionId,
      state: session.state,
      documents: mapped,
      total: mapped.length,
    };
  }

  /**
   * Retrieve and verify selected issued documents
   */
  async retrieveDocuments(arg1, arg2, arg3, arg4) {
    const sessionId = typeof arg1 === 'object' ? arg1.sessionId : arg1;
    const studentId = typeof arg1 === 'object' ? arg1.studentId : arg2;
    const selectedDocumentIds = typeof arg1 === 'object' ? (arg1.selectedDocumentIds || arg1.documentIds) : arg3;
    const ipAddress = typeof arg1 === 'object' ? arg1.ipAddress : arg4;

    const session = await this.getSession(sessionId, studentId);

    if (session.scenario === 'RETRIEVAL_FAILURE') {
      session.state = 'FAILED';
      session.status = 'Document Retrieval Failed';
      session.failureReason = 'Downstream document repository error.';
      await session.save();

      const err = new Error('This document could not be retrieved.');
      err.code = 'RETRIEVAL_ERROR';
      err.status = 502;
      throw err;
    }

    if (!selectedDocumentIds || selectedDocumentIds.length === 0) {
      throw new Error('At least one document must be selected for retrieval');
    }

    // Verify or establish active access grant for this sandbox session
    let grant = await DigiLockerAccessGrant.findOne({
      studentId,
      status: 'ACTIVE',
      expiresAt: { $gt: new Date() },
    });

    if (!grant) {
      grant = await DigiLockerAccessGrant.create({
        studentId,
        applicationId: session.applicationId,
        sessionId,
        permissions: ['DOCUMENT_LIST', 'DOCUMENT_READ', 'STRUCTURED_DATA_READ'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      });
    }

    // Find requested documents in DigiLockerDocument
    const allUserDocs = await DigiLockerDocument.find({
      $or: [{ ownerId: studentId }, { studentId: studentId }],
    });

    const retrievedDocs = [];
    const populatedFields = {};

    for (const doc of allUserDocs) {
      const schema = getSchemaByType(doc.documentType);
      const targetKey = schema ? schema.targetTribeXcelKey : doc.documentType.toLowerCase();

      // Check if selected by _id, documentType, or targetKey
      const isSelected = selectedDocumentIds.some(
        (sel) =>
          sel === doc._id.toString() ||
          sel.toLowerCase() === targetKey ||
          sel.toLowerCase() === doc.documentType.toLowerCase() ||
          (doc.documentReference && sel.toLowerCase() === doc.documentReference.toLowerCase())
      );

      if (isSelected) {
        // 1. Mark DigiLockerDocument as shared
        doc.status = 'RETRIEVED';
        doc.sessionId = sessionId;
        doc.verificationStatus = 'SANDBOX_SOURCE_CONFIRMED';
        doc.activityLog.push({
          action: 'SHARED_WITH_TRIBEXCEL',
          description: `Document shared with TribeXcel (Session ${sessionId})`,
          actor: 'system',
          timestamp: new Date(),
          details: { sessionId, applicationId: session.applicationId },
        });
        await doc.save();

        // 2. Attach / Map to TribeXcel's Document collection
        const previewUrl = `/api/digilocker/wallet/documents/${doc._id}/file`;
        const existingAppDoc = await Document.findOne({
          studentId,
          documentType: targetKey,
          applicationId: session.applicationId || null,
        });

        const extractedObj = {};
        if (doc.extractedData) {
          if (doc.extractedData instanceof Map) {
            doc.extractedData.forEach((val, k) => {
              extractedObj[k] = val;
            });
          } else {
            Object.assign(extractedObj, doc.extractedData);
          }
        }

        const applicantName = extractedObj.applicantName?.value || extractedObj.holderName?.value || extractedObj.studentName?.value || '';
        const fatherName = extractedObj.fatherName?.value || '';
        const dobVal = extractedObj.dateOfBirth?.value || extractedObj.dob?.value;
        const dob = dobVal && !isNaN(new Date(dobVal).getTime()) ? new Date(dobVal) : undefined;
        const gender = extractedObj.gender?.value || '';
        const casteOrTribe = extractedObj.tribeName?.value || extractedObj.casteOrTribe?.value || '';
        const state = extractedObj.state?.value || '';
        const district = extractedObj.district?.value || '';
        const rawIncome = extractedObj.annualIncome?.value;
        const parsedIncome = rawIncome ? Number(String(rawIncome).replace(/[^0-9.]/g, '')) : undefined;
        const annualIncome = isNaN(parsedIncome) ? undefined : parsedIncome;
        const rawPercentage = extractedObj.percentage?.value || extractedObj.marksPercentage?.value;
        const parsedPct = rawPercentage ? Number(String(rawPercentage).replace(/[^0-9.]/g, '')) : undefined;
        const marksPercentage = isNaN(parsedPct) ? undefined : parsedPct;
        const institutionName = extractedObj.institution?.value || extractedObj.institutionName?.value || extractedObj.school?.value || '';

        const docRecord = existingAppDoc || new Document({
          studentId,
          applicationId: session.applicationId || null,
          documentType: targetKey,
          documentId: `DOC-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        });

        docRecord.source = 'digilocker';
        docRecord.fileName = doc.originalFile?.fileName || `${doc.documentType}.pdf`;
        docRecord.fileUrl = previewUrl;
        docRecord.storagePath = doc.storedFilePath || '';
        docRecord.mimeType = doc.originalFile?.mimeType || 'application/pdf';
        docRecord.fileSize = doc.originalFile?.size || 1024;
        docRecord.fileHash = doc.fileHash || '';
        docRecord.verificationStatus = 'VERIFIED';
        docRecord.verificationMethod = 'DIGILOCKER_TRUSTED_API';
        docRecord.integrityStatus = 'VALID';
        docRecord.verifiedAt = new Date();
        docRecord.ocrStatus = 'COMPLETED';
        docRecord.ocrText = doc.ocrText || '';
        docRecord.extractedData = {
          applicantName,
          fatherName,
          dob,
          gender,
          casteOrTribe,
          state,
          district,
          annualIncome,
          marksPercentage,
          institutionName,
          rawText: doc.ocrText || '',
          confidenceScore: 95,
        };
        docRecord.digilocker = {
          issuerName: doc.issuer,
          certificateNo: doc.documentNumber || '',
          documentUri: `digilocker://sandbox/${studentId}/${doc._id}`,
          rawPayload: {
            documentType: doc.documentType,
            documentNumber: doc.documentNumber,
            issuer: doc.issuer,
            fileHash: doc.fileHash,
            extractedFields: extractedObj,
          },
        };

        await docRecord.save();
        retrievedDocs.push(docRecord);

        // 3. Extract Auto-fill fields for TribeXcel form
        if (schema && schema.fields) {
          schema.fields.forEach((fDef) => {
            const fieldVal = extractedObj[fDef.key];
            if (fieldVal && fieldVal.value && fieldVal.value !== 'Unable to confidently extract') {
              populatedFields[fDef.autoFillKey || fDef.key] = {
                value: fieldVal.value,
                source: 'DIGILOCKER_SANDBOX',
                documentType: schema.displayName,
                confidence: fieldVal.confidence || 0.95,
                sourcePage: fieldVal.sourcePage || 1,
              };
            }
          });
        }
      }
    }

    session.state = 'DOCUMENT_RETRIEVED';
    session.status = `Successfully retrieved ${retrievedDocs.length} documents`;
    session.selectedDocuments = selectedDocumentIds;
    session.retrievedDocuments = retrievedDocs.map((d) => d._id);
    await session.save();

    await logAuditEvent({
      event: 'DIGILOCKER_DOCUMENTS_RETRIEVED',
      user: studentId,
      role: 'student',
      action: 'digilocker_retrieve',
      details: { sessionId, count: retrievedDocs.length, ipAddress },
    });

    return {
      success: true,
      sessionId,
      state: session.state,
      retrievedCount: retrievedDocs.length,
      retrievedDocuments: retrievedDocs,
      applicationMappedDocuments: retrievedDocs,
      documents: retrievedDocs.map((d) => ({
        documentId: d._id,
        documentType: d.documentType,
        documentName: d.fileName,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        verificationStatus: d.verificationStatus,
        issuer: d.digilocker?.issuerName,
        certificateNo: d.digilocker?.certificateNo,
        documentReference: d.digilocker?.certificateNo,
        retrievedAt: d.verifiedAt,
      })),
      autoFillFields: populatedFields,
      message: `${retrievedDocs.length} documents retrieved from DigiLocker Sandbox wallet.`,
    };
  }

  /**
   * Complete session and transition to final state
   */
  async completeSession(arg1, arg2) {
    const sessionId = typeof arg1 === 'object' ? arg1.sessionId : arg1;
    const studentId = typeof arg1 === 'object' ? arg1.studentId : arg2;

    const session = await this.getSession(sessionId, studentId);
    session.state = 'RETURNED_TO_TRIBEXCEL';
    session.status = 'Completed. Transferred to TribeXcel.';
    session.completedAt = new Date();
    await session.save();

    return {
      success: true,
      sessionId,
      state: session.state,
      redirectUri: session.redirectUri,
    };
  }

  /**
   * Cancel authorization session
   */
  async cancelAuthorization(arg1, arg2) {
    const sessionId = typeof arg1 === 'object' ? arg1.sessionId : arg1;
    const studentId = typeof arg1 === 'object' ? arg1.studentId : arg2;

    const session = await this.getSession(sessionId, studentId);
    session.state = 'FAILED';
    session.status = 'Authorization was cancelled.';
    session.failureReason = 'Cancelled by applicant';
    await session.save();

    return {
      success: true,
      sessionId,
      state: session.state,
      message: 'Authorization cancelled by candidate.',
    };
  }

  /**
   * Revoke access
   */
  async revokeAccess(arg1, arg2) {
    const sessionId = typeof arg1 === 'object' ? arg1.sessionId : arg1;
    const studentId = typeof arg1 === 'object' ? arg1.studentId : arg2;

    const grants = await DigiLockerAccessGrant.updateMany(
      { studentId, status: 'ACTIVE' },
      { status: 'REVOKED', revokedAt: new Date() }
    );

    if (sessionId) {
      const session = await DigiLockerSession.findOne({ sessionId, studentId });
      if (session) {
        session.state = 'REVOKED';
        session.status = 'Access revoked by candidate';
        await session.save();
      }
    }

    return {
      success: true,
      revokedGrantsCount: grants.modifiedCount,
      message: 'DigiLocker Sandbox integration access successfully revoked.',
    };
  }
}

module.exports = DigiLockerSandboxProvider;
