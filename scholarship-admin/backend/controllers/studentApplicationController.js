const Application = require('../models/Application');
const ApplicationDraft = require('../models/ApplicationDraft');

const SCHEMES = ['NFST', 'NOS', 'PRE_MATRIC'];
const CURRENT_SESSION = '2026-27';

/*
 * Schemes the AI engine has rules for. PRE_MATRIC is verified with the rule
 * checks below until the AI engine adds it (it would otherwise fall back to
 * NFST rules). Override with AI_ENGINE_SCHEMES=NFST,NOS,PRE_MATRIC in .env.
 */
const AI_SCHEMES = (process.env.AI_ENGINE_SCHEMES || 'NFST,NOS').split(',').map((s) => s.trim().toUpperCase());

/* Older clients send only document names; these are the names they use. */
const LEGACY_REQUIRED_DOCS = ['Caste Certificate', 'Income Certificate', 'Latest Marksheet', 'Admission Letter'];

/* Student-portal document ids -> document names the AI engine understands. */
const AI_DOC_ALIAS = {
  st_certificate: 'Caste Certificate',
  income_certificate: 'Income Certificate',
  previous_marksheet: 'Latest Marksheet',
  ug_marksheet: 'Latest Marksheet',
  pg_marksheet: 'Latest Marksheet',
  school_bonafide: 'Admission Letter',
  admission_letter: 'Admission Letter',
  offer_letter: 'Admission Letter',
};

/* Scheme rules from the MoTA guidelines (mirror of student-web/src/config/schemes.js). */
const SCHEME_RULES = {
  PRE_MATRIC: { incomeLimit: 250000, minMarks: null },
  NFST: { incomeLimit: null, minMarks: 55 },
  NOS: { incomeLimit: 600000, minMarks: 55, qsRankLimit: 1000 },
};

const yes = (v) => v === 'yes';
const numberOrNull = (v) => (v === undefined || v === null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

/* Required documents for a scheme, based on the answers given (mirror of student-web/src/config/documents.js). */
function requiredDocTypes(scheme, sections = {}) {
  const c = sections.category || {};
  const a = sections.academic || {};
  const list = ['photo', 'signature', 'st_certificate'];
  if (scheme === 'PRE_MATRIC') {
    list.push('domicile_certificate', 'school_bonafide');
    if (!yes(c.isOrphan)) list.push('income_certificate');
  }
  if (scheme === 'NFST') {
    list.push('class10_certificate', 'pg_marksheet', 'admission_letter');
    if (yes(c.isPVTG)) list.push('pvtg_certificate');
    if (a.gradeType === 'cgpa') list.push('cgpa_conversion');
    if (yes(a.premierOffer)) list.push('premier_offer_letter');
  }
  if (scheme === 'NOS') {
    list.push('class10_certificate', a.courseLevel === 'masters' ? 'ug_marksheet' : 'pg_marksheet');
    if (yes(c.isPVTG)) list.push('pvtg_certificate');
    if (!yes(c.isOrphan)) list.push('income_certificate');
    if (a.courseLevel === 'postdoc') list.push('phd_certificate');
    if (a.gradeType === 'cgpa') list.push('cgpa_conversion');
    if (a.admissionStatus !== 'applied') list.push('offer_letter');
  }
  if (yes(c.hasDisability)) list.push('disability_certificate');
  return list;
}

function academicScore(marks) {
  return marks === null ? 75 : Math.max(0, Math.min(100, Math.round(marks)));
}

function socioEconomicScore(income) {
  if (income === null) return 80;
  if (income <= 100000) return 95;
  if (income <= 250000) return 85;
  if (income <= 600000) return 70;
  return 55;
}

/* Rule-based verification — used when the AI engine is offline or does not cover the scheme. */
function ruleBasedVerification(body, docs) {
  const rules = SCHEME_RULES[body.scheme] || SCHEME_RULES.NFST;
  const usesDocTypes = docs.some((d) => d.docType);

  let docsOk;
  if (usesDocTypes) {
    const present = new Set(docs.map((d) => d.docType));
    docsOk = requiredDocTypes(body.scheme, body.sections).every((t) => present.has(t));
  } else {
    const names = docs.map((d) => d.name);
    docsOk = LEGACY_REQUIRED_DOCS.every((n) => names.includes(n));
  }

  const income = numberOrNull(body.declared_income);
  const incomeOk = rules.incomeLimit === null || income === null || income <= rules.incomeLimit;

  const marks = numberOrNull(body.declared_marks);
  const qsRank = Number(body.sections?.academic?.qsRank);
  const marksWaived = body.scheme === 'NOS' && qsRank > 0 && qsRank <= rules.qsRankLimit;
  const marksOk = rules.minMarks === null || marks === null || marksWaived || marks >= rules.minMarks;

  const checks = [
    { label: 'Income within scheme limit', passed: incomeOk },
    { label: 'Category matches ST records', passed: true },
    { label: 'Marks meet minimum cutoff', passed: marksOk },
    { label: 'All required documents present', passed: docsOk },
  ];
  const score = (docsOk ? 30 : 0) + (incomeOk ? 25 : 0) + 25 + (marksOk ? 20 : 0);

  let status = 'Eligible';
  if (!docsOk) status = 'Deficient';
  else if (!incomeOk || !marksOk) status = 'Flagged';

  return {
    checks,
    score,
    status,
    meritScores: {
      academic: academicScore(marks),
      exam: 70,
      socioEconomic: socioEconomicScore(income),
      interview: 70,
    },
  };
}

/*
 * Synchronous call to AI/ML Verification & Merit Engine (Section 8 of system flow).
 * If the microservice is offline, times out or does not cover the scheme,
 * falls back to the rule-based checks above.
 */
async function runVerification(body, formattedDocs) {
  if (!AI_SCHEMES.includes(body.scheme)) return ruleBasedVerification(body, formattedDocs);

  const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const payload = {
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      dob: body.dob ? String(body.dob) : '',
      gender: body.gender || '',
      category: body.category || 'Scheduled Tribe',
      state: body.state || '',
      district: body.district || '',
      scheme: body.scheme,
      course: body.course || '',
      institution: body.institution || '',
      documents: formattedDocs.map((d) => ({
        name: AI_DOC_ALIAS[d.docType] || d.name,
        source: d.source,
        raw_text: d.raw_text || '',
        content_base64: d.content_base64 || null,
      })),
      declared_income: numberOrNull(body.declared_income) ?? undefined,
      declared_marks: numberOrNull(body.declared_marks) ?? undefined,
    };

    const res = await fetch(`${aiEngineUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        checks: data.aiVerification.checks,
        score: data.aiVerification.score,
        status: data.status,
        meritScores: data.meritScores,
      };
    }
  } catch (err) {
    console.warn('AI engine not reached, falling back to rule defaults:', err.message);
  }

  return ruleBasedVerification(body, formattedDocs);
}

function generateApplicationCode() {
  return `SIH26239-${Date.now().toString().slice(-8)}`;
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

    const verificationInput = { ...body, sections: sections || {} };
    if (scheme === 'PRE_MATRIC') verificationInput.declared_marks = undefined; // no marks criterion
    const verification = await runVerification(verificationInput, formattedDocs);

    const declaredIncome = numberOrNull(body.declared_income);
    const declaredMarks = numberOrNull(body.declared_marks);
    const schemeData = sections ? { sections, source: 'student-web' } : undefined;

    let application;
    if (existingApp) {
      existingApp.name = name;
      existingApp.email = email;
      existingApp.phone = phone;
      existingApp.dob = dob;
      existingApp.gender = gender;
      existingApp.state = state;
      existingApp.district = district;
      existingApp.course = course;
      existingApp.institution = institution;
      existingApp.session = session;
      existingApp.documents = formattedDocs;
      if (schemeData) existingApp.schemeData = schemeData;
      if (declaredIncome !== null) existingApp.declaredIncome = declaredIncome;
      if (declaredMarks !== null) existingApp.declaredMarks = declaredMarks;
      existingApp.aiVerification = { checks: verification.checks, score: verification.score };
      existingApp.status = verification.status || 'Eligible';
      existingApp.meritScores = verification.meritScores || existingApp.meritScores;
      existingApp.submittedAt = new Date();
      await existingApp.save();
      application = existingApp;
    } else {
      application = await Application.create({
        applicationCode: generateApplicationCode(),
        student: req.student._id,
        name, email, phone, dob, gender, state, district,
        scheme, course, institution, session,
        category: 'Scheduled Tribe',
        status: verification.status || 'Eligible',
        documents: formattedDocs,
        schemeData,
        declaredIncome: declaredIncome ?? undefined,
        declaredMarks: declaredMarks ?? undefined,
        aiVerification: { checks: verification.checks, score: verification.score },
        meritScores: verification.meritScores || {
          academic: 75,
          exam: 70,
          socioEconomic: 80,
          interview: 70,
        },
        submittedAt: new Date(),
      });
    }

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
