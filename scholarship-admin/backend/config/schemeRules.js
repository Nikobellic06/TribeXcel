/*
 * Scheme rules used by the deterministic rule engine (services/ruleEngine.js)
 * and the required-document checks.
 *
 * Values come from the Ministry of Tribal Affairs guidelines:
 *   - Pre-Matric Scholarship for ST students (Class IX-X)
 *   - National Fellowship for ST students (NFST, M.Phil / Ph.D)
 *   - National Overseas Scholarship for ST students (NOS), revised 07.10.2022
 * The same values are used by student-web/src/config/schemes.js — keep both in sync.
 */

const DOCUMENT_LABELS = {
  photo: 'Passport-size photograph',
  signature: 'Signature',
  st_certificate: 'Scheduled Tribe (ST) certificate',
  pvtg_certificate: 'PVTG certificate',
  income_certificate: 'Family income certificate',
  domicile_certificate: 'Domicile certificate',
  disability_certificate: 'Disability certificate (UDID)',
  class10_certificate: 'Class 10 certificate (proof of date of birth)',
  previous_marksheet: 'Marksheet of the last class passed',
  school_bonafide: 'School bonafide / enrolment certificate',
  ug_marksheet: "Bachelor's degree marksheet",
  pg_marksheet: "Post-graduation (Master's) marksheet",
  cgpa_conversion: 'CGPA to percentage conversion formula',
  phd_certificate: 'Ph.D degree / completion certificate',
  admission_letter: 'Admission / joining certificate from the university',
  premier_offer_letter: 'Offer letter from IIT / AIIMS / IIM / IISER',
  offer_letter: 'Offer of admission from the foreign university',
};

const SCHEME_RULES = {
  PRE_MATRIC: {
    code: 'PRE_MATRIC',
    name: 'Pre-Matric Scholarship for ST Students',
    shortName: 'Pre-Matric',
    level: 'Class IX & X',
    incomeLimit: 250000,
    orphanIncomeExempt: true,
    minMarks: null,
    maxAge: null,
    allowedClasses: ['IX', 'X'],
    meritBased: false,
    seats: null,
  },
  NFST: {
    code: 'NFST',
    name: 'National Fellowship for ST Students (M.Phil / Ph.D)',
    shortName: 'NFST',
    level: 'M.Phil / Ph.D in India',
    incomeLimit: null,
    minMarks: 55,
    maxAge: 36,
    meritBased: true,
    meritBasis: 'Post-graduation marks (higher first)',
    seats: { total: 750, split: { Divyangjan: 38, PVTG: 25, Female: 225, 'ST others': 462 } },
  },
  NOS: {
    code: 'NOS',
    name: 'National Overseas Scholarship for ST Students',
    shortName: 'NOS',
    level: "Master's / Ph.D / Post-doc abroad",
    incomeLimit: 600000,
    orphanIncomeExempt: true,
    minMarks: 55,
    qsRankLimit: 1000,
    maxAgeByLevel: { masters: 32, phd: 35, postdoc: 38 },
    meritBased: true,
    meritBasis: 'QS World University Ranking (better rank first), then qualifying marks',
    seats: { total: 20, split: { ST: 17, PVTG: 3 } },
  },
};

const yes = (v) => v === 'yes';

/* Required documents for an application, based on its answers (mirror of student-web/src/config/documents.js). */
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

/* Older applications only carry document names; map them to portal ids. */
const LEGACY_DOC_NAMES = {
  'Caste Certificate': 'st_certificate',
  'Income Certificate': 'income_certificate',
  'Latest Marksheet': 'pg_marksheet',
  Marksheet: 'pg_marksheet',
  'Admission Letter': 'admission_letter',
};

module.exports = { SCHEME_RULES, DOCUMENT_LABELS, requiredDocTypes, LEGACY_DOC_NAMES };
