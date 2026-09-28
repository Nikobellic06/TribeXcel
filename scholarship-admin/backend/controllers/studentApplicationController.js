const Application = require('../models/Application');
const ApplicationDraft = require('../models/ApplicationDraft');

const SCHEMES = ['NFST', 'NOS', 'PRE_MATRIC'];
const CURRENT_SESSION = '2026-27';

const aiAnalysis = require('../services/aiAnalysis');
const review = require('../services/review');

const numberOrNull = (v) => (v === undefined || v === null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

function generateApplicationCode() {
  return `MOTA-ST-${Date.now().toString().slice(-8)}`;
}

/* Keep only plain objects; never store the re-typed account number. */
function sanitizeSections(sections) {
  if (!sections || typeof sections !== 'object' || Array.isArray(sections)) return null;
  const out = {};
  ['personal', 'category', 'academic', 'bank', 'declarations'].forEach((key) => {
    const value = sections[key];
    out[key] = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
  });
  delete out.bank.confirmAccountNumber;
  return out;
}

/* A student may only attach files from their own upload folder. */
function ownFileUrl(url, studentId) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('/uploads/') && !url.startsWith(`/uploads/${studentId}/`)) return '';
  return url.slice(0, 500);
}

/* POST /api/student/applications
 *
 * Accepts the student portal payload
 *   { scheme, session, name, email, phone, dob, gender, state, district,
 *     course, institution, declared_income, declared_marks,
 *     sections: { personal, category, academic, bank, declarations },
 *     documents: [{ docType, name, source, fileUrl, ... }] }
 * and, for older clients, the same fields without `sections` / `docType`.
 */
const submitApplication = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      name, email, phone, dob, gender, state, district,
      scheme, course, institution, documents,
    } = body;

    const required = { name, email, phone, dob, gender, state, district, scheme, course, institution };
    for (const [field, value] of Object.entries(required)) {
      if (!value) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    if (!SCHEMES.includes(scheme)) {
      return res.status(400).json({ message: 'scheme must be NFST, NOS or PRE_MATRIC' });
    }

    const session = typeof body.session === 'string' && /^\d{4}-\d{2}$/.test(body.session) ? body.session : CURRENT_SESSION;
    const sections = sanitizeSections(body.sections);

    if (sections && (!sections.declarations.truthful || !sections.declarations.consent)) {
      return res.status(400).json({ message: 'Please accept the declarations before submitting' });
    }

    const studentId = String(req.student._id);
    const docsArray = Array.isArray(documents) ? documents : [];
    const formattedDocs = docsArray
      .filter((d) => d && d.name)
      .map((d) => ({
        name: String(d.name),
        docType: typeof d.docType === 'string' ? d.docType : '',
        source: d.source === 'digilocker' ? 'digilocker' : 'manual',
        verified: d.source === 'digilocker',
        fileUrl: ownFileUrl(d.fileUrl, studentId),
        fileName: d.fileName ? String(d.fileName).slice(0, 120) : '',
        mimeType: d.mimeType ? String(d.mimeType) : '',
        size: Number(d.size) || 0,
        digilockerUri: d.digilockerUri ? String(d.digilockerUri) : '',
        issuer: d.issuer ? String(d.issuer) : '',
        certificateNo: d.certificateNo ? String(d.certificateNo) : '',
        // Only forwarded to the AI engine; not stored on the application.
        content_base64: d.content_base64 || null,
        raw_text: d.raw_text || null,
      }));

    // One application per scheme per session. Only an application returned
    // for correction (Deficient) can be submitted again.
    const existingApp = await Application.findOne({
      student: req.student._id,
      scheme,
      $or: [{ session }, { session: { $exists: false } }],
    }).sort({ createdAt: -1 });

    if (existingApp && existingApp.status !== 'Deficient') {
      return res.status(409).json({
        message: 'You have already applied for this scheme in this session',
        applicationId: existingApp._id,
        status: existingApp.status,
      });
    }

    const declaredIncome = numberOrNull(body.declared_income);
    const declaredMarks = scheme === 'PRE_MATRIC' ? null : numberOrNull(body.declared_marks);
    const schemeData = sections ? { sections, source: 'student-web' } : undefined;
    const now = new Date();

    const fields = {
      name, email, phone, dob, gender, state, district, course, institution, session,
      documents: formattedDocs,
      declaredIncome: declaredIncome ?? undefined,
      declaredMarks: declaredMarks ?? undefined,
      submittedAt: now,
      lastActionAt: now,
    };
    if (schemeData) fields.schemeData = schemeData;

    let application;
    if (existingApp) {
      application = existingApp;
      application.set(fields);
      application.resubmissionCount = (application.resubmissionCount || 0) + 1;
      application.lastResubmittedAt = now;
    } else {
      application = new Application({
        ...fields,
        applicationCode: generateApplicationCode(),
        student: req.student._id,
        scheme,
        category: 'Scheduled Tribe',
        status: 'Pending',
      });
    }

    // AI-assisted analysis (assistive only), rule evaluation and review flags.
    // The status only routes the application to an officer; it never approves it.
    const { analysis, raw } = await aiAnalysis.run({ ...application.toObject(), documents: formattedDocs });
    application.aiAnalysis = analysis;
    if (raw?.aiVerification) {
      application.aiVerification = { checks: raw.aiVerification.checks || [], score: raw.aiVerification.score || 0 };
    }
    const assessment = review.assess(application.toObject(), req.student);
    review.applySummary(application, assessment);
    const fromStatus = existingApp ? existingApp.status : '';
    application.status = review.initialStatus(assessment);
    application.reviewHistory.push({
      action: existingApp ? 'Resubmitted after correction' : 'Submitted',
      fromStatus,
      toStatus: application.status,
      byId: req.student._id,
      byName: name,
      byRole: 'Applicant',
      at: now,
    });
    await application.save();

    // The draft is no longer needed once the application is submitted.
    ApplicationDraft.deleteOne({ student: req.student._id, scheme }).catch(() => {});

    res.status(201).json({ application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate application code, please try again' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

/* GET /api/student/applications */
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.student._id })
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your applications' });
  }
};

/* GET /api/student/applications/:id */
const getMyApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.student._id,
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ application });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(500).json({ message: 'Failed to fetch application' });
  }
};

module.exports = { submitApplication, getMyApplications, getMyApplicationById };
