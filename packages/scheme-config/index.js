/**
 * Ministry of Tribal Affairs (MoTA), Government of India
 * Canonical Single Source of Truth for Scheme Configuration & Document Rules
 * Version: 2026.1 (Academic Session 2026-27)
 */

const preMatric = require('./schemes/2026-27/pre-matric');
const postMatric = require('./schemes/2026-27/post-matric');
const topClass = require('./schemes/2026-27/top-class');
const nfst = require('./schemes/2026-27/nfst');
const nos = require('./schemes/2026-27/nos');

// Compatibility wrapper to ensure both .eligibilityRules and .eligibilityCriteria are accessible
function normalizeScheme(scheme) {
  const norm = { ...scheme };
  if (!norm.eligibilityCriteria && norm.eligibilityRules) {
    norm.eligibilityCriteria = { ...norm.eligibilityRules };
  }
  if (!norm.eligibilityRules && norm.eligibilityCriteria) {
    norm.eligibilityRules = { ...norm.eligibilityCriteria };
  }
  norm.applicationMode = 'DIRECT'; // All 5 MoTA schemes process directly through TribeXcel
  return norm;
}

const SCHEME_CATALOGUE = {
  PRE_MATRIC: normalizeScheme(preMatric),
  POST_MATRIC: normalizeScheme(postMatric),
  TOP_CLASS: normalizeScheme(topClass),
  NFST: normalizeScheme(nfst),
  NOS: normalizeScheme(nos),
};

const DOCUMENT_REGISTRY = {
  photo: { id: 'photo', label: 'Passport Photograph', defaultMime: 'image/jpeg', digilockerSupported: false },
  signature: { id: 'signature', label: 'Applicant Signature', defaultMime: 'image/jpeg', digilockerSupported: false },
  class10_certificate: { id: 'class10_certificate', label: 'Class 10 Certificate / DOB Proof', defaultMime: 'application/pdf', digilockerSupported: true, digilockerType: '10CR' },
  st_certificate: { id: 'st_certificate', label: 'Scheduled Tribe (ST) Certificate', defaultMime: 'application/pdf', digilockerSupported: true, digilockerType: 'CASTC' },
  pvtg_certificate: { id: 'pvtg_certificate', label: 'PVTG Certificate', defaultMime: 'application/pdf', digilockerSupported: false },
  disability_certificate: { id: 'disability_certificate', label: 'Disability Certificate (UDID)', defaultMime: 'application/pdf', digilockerSupported: true, digilockerType: 'DISCR' },
  family_income_proof: { id: 'family_income_proof', label: 'Family Income Certificate / ITR', defaultMime: 'application/pdf', digilockerSupported: true, digilockerType: 'INCER' },
  domicile_certificate: { id: 'domicile_certificate', label: 'Domicile / Residential Certificate', defaultMime: 'application/pdf', digilockerSupported: true, digilockerType: 'DOMCR' },
  orphan_certificate: { id: 'orphan_certificate', label: 'Orphan / Parents Death Certificate', defaultMime: 'application/pdf', digilockerSupported: false },
  pg_marksheet: { id: 'pg_marksheet', label: "Master's Degree Marksheet / Grade Sheet", defaultMime: 'application/pdf', digilockerSupported: true, digilockerType: 'DEGRR' },
  qualifying_degree: { id: 'qualifying_degree', label: 'Qualifying Degree Certificate / Marksheet', defaultMime: 'application/pdf', digilockerSupported: true, digilockerType: 'DEGRR' },
  cgpa_conversion: { id: 'cgpa_conversion', label: 'CGPA Conversion Formula Document', defaultMime: 'application/pdf', digilockerSupported: false },
  admission_letter: { id: 'admission_letter', label: 'University Admission / Joining Letter', defaultMime: 'application/pdf', digilockerSupported: false },
  foreign_admission_letter: { id: 'foreign_admission_letter', label: 'Foreign University Offer Letter', defaultMime: 'application/pdf', digilockerSupported: false },
  bonafide_certificate: { id: 'bonafide_certificate', label: 'Institute Bonafide Certificate', defaultMime: 'application/pdf', digilockerSupported: false },
  fee_receipt: { id: 'fee_receipt', label: 'Institute Fee Receipt / Structure', defaultMime: 'application/pdf', digilockerSupported: false },
  bank_passbook: { id: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque', defaultMime: 'application/pdf', digilockerSupported: false },
  last_passing_marksheet: { id: 'last_passing_marksheet', label: 'Last Passing Semester / Annual Marksheet', defaultMime: 'application/pdf', digilockerSupported: false },
  visa_and_studentid: { id: 'visa_and_studentid', label: 'Valid Student Visa & Foreign Student ID Card', defaultMime: 'application/pdf', digilockerSupported: false },
  joining_letter: { id: 'joining_letter', label: 'Official Department Joining Letter', defaultMime: 'application/pdf', digilockerSupported: false },
  employer_noc: { id: 'employer_noc', label: 'Employer NOC & Experience Certificate', defaultMime: 'application/pdf', digilockerSupported: false },
  gap_certificate: { id: 'gap_certificate', label: 'Gap Affidavit / Certificate', defaultMime: 'application/pdf', digilockerSupported: false },
};

/**
 * Returns dynamic document checklist for any of the 5 schemes based on context
 * @param {string} schemeCode - PRE_MATRIC | POST_MATRIC | TOP_CLASS | NFST | NOS
 * @param {object} context - Form values, student profile, applicationType
 */
function getDocumentChecklist(schemeCode, context = {}) {
  const scheme = SCHEME_CATALOGUE[schemeCode];
  if (!scheme) return [];

  const applicationType = (context.applicationType || 'FRESH').toUpperCase();
  let baseReqs = [];
  let conditionalReqs = [];

  if (schemeCode === 'TOP_CLASS') {
    const config = scheme.formConfigurations?.[applicationType] || scheme.formConfigurations?.FRESH;
    baseReqs = config?.documents || [];
    conditionalReqs = config?.conditionalDocuments || [];
  } else {
    baseReqs = scheme.documentRequirements || scheme.documents || [];
    conditionalReqs = scheme.conditionalDocuments || [];
  }

  const checklist = [];

  baseReqs.forEach((doc) => {
    const reg = DOCUMENT_REGISTRY[doc.id] || {};
    checklist.push({
      ...reg,
      ...doc,
      required: doc.mandatory !== false,
      isConditional: false,
    });
  });

  conditionalReqs.forEach((doc) => {
    let conditionMet = false;
    if (typeof doc.condition === 'function') {
      conditionMet = Boolean(doc.condition(context));
    } else if (typeof doc.condition === 'string') {
      const condKey = doc.condition.startsWith('!') ? doc.condition.slice(1) : doc.condition;
      const isNegated = doc.condition.startsWith('!');
      const val = context[condKey] === 'yes' || context[condKey] === true;
      conditionMet = isNegated ? !val : val;
    }
    if (conditionMet) {
      const reg = DOCUMENT_REGISTRY[doc.id] || {};
      checklist.push({
        ...reg,
        ...doc,
        required: true,
        isConditional: true,
      });
    }
  });

  return checklist;
}

/**
 * Helper to return array of required document IDs for a scheme and section context
 */
function requiredDocTypes(schemeCode, sections = {}) {
  const c = sections.category || {};
  const a = sections.academic || {};
  const e = sections.employment_gap || {};
  const appType = sections.applicationType || 'FRESH';

  const flatContext = {
    ...c,
    ...a,
    ...e,
    applicationType: appType,
    isPVTG: c.isPVTG === 'yes' || c.isPVTG === true,
    hasDisability: c.hasDisability === 'yes' || c.hasDisability === true,
    isOrphan: c.isOrphan === 'yes' || c.isOrphan === true,
    usesCGPA: a.usesCGPA === 'yes' || a.usesCGPA === true || a.gradeType === 'cgpa',
    isEmployed: e.isEmployed === 'yes' || e.isEmployed === true,
    hasGap: e.hasGap === 'yes' || e.hasGap === true,
    hasJoinedForeignUniversity: a.hasJoinedForeignUniversity === 'yes' || a.hasJoinedForeignUniversity === true,
  };

  const checklist = getDocumentChecklist(schemeCode, flatContext);
  return checklist.map((d) => d.id);
}

/**
 * Evaluate preliminary eligibility deterministically for a student against a scheme
 */
function evaluateEligibility(schemeCode, profile = {}) {
  const scheme = SCHEME_CATALOGUE[schemeCode];
  if (!scheme) return { eligible: false, reasons: ['Unknown scheme'] };

  const rules = scheme.eligibilityRules;
  const reasons = [];

  // 1. Scheduled Tribe Check
  const category = (profile.category || '').toUpperCase();
  if (category && category !== 'ST' && category !== 'SCHEDULED TRIBE') {
    reasons.push('Candidate must belong to the Scheduled Tribe (ST) category');
  }

  // 2. Income Check
  if (rules.incomeLimit !== null && rules.incomeLimit !== undefined) {
    const income = Number(profile.annualFamilyIncome ?? profile.familyAnnualIncome ?? profile.declaredIncome);
    const isOrphan = profile.isOrphan === true || profile.isOrphan === 'yes';
    if (!isOrphan && Number.isFinite(income) && income > rules.incomeLimit) {
      reasons.push(`Annual family income (Rs. ${income.toLocaleString('en-IN')}) exceeds scheme ceiling of Rs. ${rules.incomeLimit.toLocaleString('en-IN')}`);
    }
  }

  // 3. Class Check for Pre-Matric
  if (schemeCode === 'PRE_MATRIC' && rules.allowedClasses) {
    const cls = String(profile.className || profile.class || '').toUpperCase();
    if (cls && !rules.allowedClasses.includes(cls)) {
      reasons.push(`Scheme is open exclusively to Class IX & X students (Found Class ${cls})`);
    }
  }

  // 4. Minimum Marks Check (NFST / NOS)
  if (rules.minQualifyingMarks) {
    const marks = Number(profile.qualifyingMarksPercentage ?? profile.pgMarksPercentage ?? profile.declaredMarks);
    if (Number.isFinite(marks) && marks < rules.minQualifyingMarks) {
      reasons.push(`Qualifying marks (${marks}%) are below mandatory minimum of ${rules.minQualifyingMarks}%`);
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

module.exports = {
  SCHEME_CATALOGUE,
  DOCUMENT_REGISTRY,
  getDocumentChecklist,
  requiredDocTypes,
  evaluateEligibility,
};
