const { SCHEME_RULES, DOCUMENT_LABELS, requiredDocTypes, LEGACY_DOC_NAMES } = require('../config/schemeRules');

/*
 * Deterministic eligibility rule engine.
 * Every result comes from config/schemeRules.js and the data in the
 * application — nothing is guessed. Statuses:
 *   PASS | FAIL | INSUFFICIENT_DATA | NOT_APPLICABLE | REQUIRES_HUMAN_REVIEW
 * Preliminary result:
 *   ELIGIBLE | INCOMPLETE | NOT_ELIGIBLE | REQUIRES_HUMAN_REVIEW
 */

const yes = (v) => v === 'yes';
const no = (v) => v === 'no';
const blank = (v) => v === undefined || v === null || String(v).trim() === '';
const num = (v) => (blank(v) || !Number.isFinite(Number(v)) ? null : Number(v));
const inr = (n) => `Rs. ${Number(n).toLocaleString('en-IN')}`;

function ageOn(dob, ref) {
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return null;
  let age = ref.getFullYear() - b.getFullYear();
  const m = ref.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < b.getDate())) age -= 1;
  return age;
}

/* Age limits are counted on 1 July of the selection year (first year of the session). */
function referenceDate(session) {
  const year = Number(String(session || '2026-27').slice(0, 4)) || 2026;
  return new Date(Date.UTC(year, 6, 1));
}

function docTypeOf(doc) {
  return doc.docType || LEGACY_DOC_NAMES[doc.name] || '';
}

function documentChecklist(app) {
  const sections = app.schemeData?.sections || {};
  const docs = app.documents || [];
  const byType = {};
  docs.forEach((d) => {
    const t = docTypeOf(d);
    if (t) byType[t] = d;
  });
  const required = requiredDocTypes(app.scheme, sections);
  const list = required.map((t) => ({
    docType: t,
    label: DOCUMENT_LABELS[t] || t,
    required: true,
    present: Boolean(byType[t]),
    source: byType[t]?.source || null,
  }));
  docs.forEach((d) => {
    const t = docTypeOf(d);
    if (!required.includes(t)) {
      list.push({ docType: t || d.name, label: DOCUMENT_LABELS[t] || d.name, required: false, present: true, source: d.source });
    }
  });
  return list;
}

function evaluate(app, student) {
  const rules = SCHEME_RULES[app.scheme];
  const s = app.schemeData?.sections || {};
  const p = s.personal || {};
  const c = s.category || {};
  const a = s.academic || {};
  const b = s.bank || {};
  const hasSections = Boolean(app.schemeData?.sections);
  const results = [];
  const add = (id, label, status, detail, kind = 'eligibility') => results.push({ id, label, status, detail, kind });

  if (!rules) {
    return { scheme: app.scheme, results: [], preliminaryResult: 'REQUIRES_HUMAN_REVIEW', documents: [], note: 'No rules configured for this scheme' };
  }

  // Scheduled Tribe
  const docs = documentChecklist(app);
  const stDoc = docs.find((d) => d.docType === 'st_certificate' && d.present);
  if (app.category && !/scheduled tribe|^st$/i.test(app.category)) {
    add('st', 'Scheduled Tribe eligibility', 'FAIL', `Category recorded as "${app.category}"`);
  } else if (!blank(c.stCertificateNo) || stDoc) {
    add('st', 'Scheduled Tribe eligibility', 'PASS', [c.tribeName, c.stCertificateNo].filter(Boolean).join(', ') || 'ST certificate attached');
  } else {
    add('st', 'Scheduled Tribe eligibility', 'INSUFFICIENT_DATA', 'No ST certificate details or document');
  }

  // Domicile (Pre-Matric is awarded by the domicile State)
  if (app.scheme === 'PRE_MATRIC') {
    if (!blank(c.domicileState)) add('domicile', 'Domicile State available', 'PASS', c.domicileState);
    else if (!blank(app.state)) add('domicile', 'Domicile State available', 'REQUIRES_HUMAN_REVIEW', `Only address State recorded (${app.state})`);
    else add('domicile', 'Domicile State available', 'INSUFFICIENT_DATA', 'Domicile State not recorded');
  }

  // Class (Pre-Matric)
  if (rules.allowedClasses) {
    if (blank(a.className)) add('class', 'Studying in Class IX or X', 'INSUFFICIENT_DATA', 'Class not recorded');
    else if (rules.allowedClasses.includes(a.className)) add('class', 'Studying in Class IX or X', 'PASS', `Class ${a.className}`);
    else add('class', 'Studying in Class IX or X', 'FAIL', `Class ${a.className}`);
  }

  // Income
  const incomeLabel = rules.incomeLimit ? `Family income up to ${inr(rules.incomeLimit)}` : 'Family income limit';
  const income = num(app.declaredIncome ?? c.familyIncome);
  if (!rules.incomeLimit) add('income', incomeLabel, 'NOT_APPLICABLE', 'This scheme has no income limit');
  else if (yes(c.isOrphan) && rules.orphanIncomeExempt) add('income', incomeLabel, 'NOT_APPLICABLE', 'Orphan applicant; income limit does not apply');
  else if (income === null) add('income', incomeLabel, 'INSUFFICIENT_DATA', 'Annual family income not declared');
  else if (income <= rules.incomeLimit) add('income', incomeLabel, 'PASS', `Declared ${inr(income)}`);
  else add('income', incomeLabel, 'FAIL', `Declared ${inr(income)}`);

  // Marks
  if (!rules.minMarks) {
    add('marks', 'Minimum qualifying marks', 'NOT_APPLICABLE', 'No marks criterion for this scheme');
  } else {
    const marks = num(app.declaredMarks ?? (a.gradeType === 'cgpa' ? a.convertedPercentage : a.percentage));
    const qs = num(a.qsRank);
    const admitted = a.admissionStatus === 'studying' || a.admissionStatus === 'offer';
    const label = `At least ${rules.minMarks}% in the qualifying degree`;
    if (app.scheme === 'NOS' && qs && qs <= rules.qsRankLimit && admitted) add('marks', label, 'PASS', `Waived: admitted to a QS top-${rules.qsRankLimit} university (rank ${qs})`);
    else if (marks === null) add('marks', label, 'INSUFFICIENT_DATA', 'Qualifying marks not declared');
    else if (marks >= rules.minMarks) add('marks', label, 'PASS', `${marks}% declared`);
    else add('marks', label, 'FAIL', `${marks}% declared`);
  }

  // Age
  const maxAge = rules.maxAge || (rules.maxAgeByLevel ? rules.maxAgeByLevel[a.courseLevel] : null);
  if (!rules.maxAge && !rules.maxAgeByLevel) {
    add('age', 'Age limit', 'NOT_APPLICABLE', 'No age limit for this scheme');
  } else if (!maxAge) {
    add('age', 'Age limit', 'INSUFFICIENT_DATA', 'Course level not recorded');
  } else {
    const age = app.dob ? ageOn(app.dob, referenceDate(app.session)) : null;
    const label = `Age up to ${maxAge} years on 1 July`;
    if (age === null) add('age', label, 'INSUFFICIENT_DATA', 'Date of birth not recorded');
    else add('age', label, age <= maxAge ? 'PASS' : 'FAIL', `${age} years on the reference date`);
  }

  // Scheme-specific exclusions
  if (app.scheme === 'PRE_MATRIC') {
    if (yes(a.repeatingClass)) add('repeat', 'Not repeating the same class', 'FAIL', 'Applicant declared a repeated class');
    else if (no(a.repeatingClass)) add('repeat', 'Not repeating the same class', 'PASS', 'Declared not repeating');
    if (yes(a.otherScholarship)) add('other', 'No other scholarship', 'FAIL', 'Applicant declared another scholarship');
    else if (no(a.otherScholarship)) add('other', 'No other scholarship', 'PASS', 'Declared none');
  }
  if (app.scheme === 'NFST' && yes(a.otherFellowship)) {
    add('other', 'No other fellowship', 'REQUIRES_HUMAN_REVIEW', 'Holds another fellowship; must be surrendered if selected');
  }
  if (app.scheme === 'NOS') {
    if (yes(a.siblingAvailed)) add('sibling', 'One child per family', 'FAIL', 'A sibling has already received the award');
    if (yes(a.previousAward)) add('once', 'One-time award', 'FAIL', 'Applicant has received the award before');
    const qs = num(a.qsRank);
    if (qs && qs > SCHEME_RULES.NOS.qsRankLimit) add('qs', 'University in QS top 1000', 'REQUIRES_HUMAN_REVIEW', `QS rank ${qs}; awards go first to top-1000 universities`);
  }

  // Academic information
  const academicOk = app.scheme === 'PRE_MATRIC'
    ? !blank(a.schoolName || app.institution) && !blank(a.className)
    : !blank(app.institution) && !blank(app.course);
  add('academic', 'Required academic information', academicOk ? 'PASS' : 'INSUFFICIENT_DATA', academicOk ? [app.course, app.institution].filter(Boolean).join(', ') : 'Course or institution missing', 'information');

  // Bank
  if (!hasSections) add('bank', 'Bank information (DBT)', 'INSUFFICIENT_DATA', 'No bank details on record', 'information');
  else if (blank(b.accountNumber) || blank(b.ifsc)) add('bank', 'Bank information (DBT)', 'INSUFFICIENT_DATA', 'Account number or IFSC missing', 'information');
  else if (b.aadhaarSeeded !== 'yes') add('bank', 'Bank information (DBT)', 'REQUIRES_HUMAN_REVIEW', 'Aadhaar seeding not confirmed', 'information');
  else add('bank', 'Bank information (DBT)', 'PASS', `${b.bankName || 'Bank'}, IFSC ${b.ifsc}, Aadhaar seeded`, 'information');

  // Identity
  if (!student) add('kyc', 'Aadhaar e-KYC', 'INSUFFICIENT_DATA', 'Student record not linked', 'information');
  else if (student.aadhaarVerified) add('kyc', 'Aadhaar e-KYC', 'PASS', `Completed (Aadhaar ending ${student.aadhaarLast4})`, 'information');
  else add('kyc', 'Aadhaar e-KYC', 'REQUIRES_HUMAN_REVIEW', 'e-KYC not completed', 'information');

  // Documents
  const missing = docs.filter((d) => d.required && !d.present);
  add('documents', 'Required documents', missing.length ? 'FAIL' : 'PASS', missing.length ? `Missing: ${missing.map((d) => d.label).join(', ')}` : `${docs.filter((d) => d.required).length} of ${docs.filter((d) => d.required).length} attached`, 'documents');

  const failedEligibility = results.some((r) => r.status === 'FAIL' && r.kind === 'eligibility');
  const docsMissing = missing.length > 0;
  const needsReview = results.some((r) => r.status === 'REQUIRES_HUMAN_REVIEW' || r.status === 'INSUFFICIENT_DATA');
  let preliminaryResult = 'ELIGIBLE';
  if (failedEligibility) preliminaryResult = 'NOT_ELIGIBLE';
  else if (docsMissing) preliminaryResult = 'INCOMPLETE';
  else if (needsReview) preliminaryResult = 'REQUIRES_HUMAN_REVIEW';

  return { scheme: app.scheme, schemeName: rules.name, results, preliminaryResult, documents: docs };
}

module.exports = { evaluate, documentChecklist, docTypeOf };
