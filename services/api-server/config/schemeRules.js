/*
 * Official Ministry of Tribal Affairs (MoTA) Scheme Rules Configuration
 * Academic Session: 2026-27 (Rule Version: 2026.1)
 */

const {
  SCHEME_CATALOGUE,
  DOCUMENT_REGISTRY,
  getDocumentChecklist,
  requiredDocTypes,
  evaluateEligibility,
} = require('../../../packages/scheme-config');

const DOCUMENT_LABELS = {
  photo: 'Passport-size photograph',
  signature: 'Scanned signature',
  class10_certificate: 'Class 10 certificate (proof of date of birth)',
  st_certificate: 'Scheduled Tribe (ST) certificate',
  pvtg_certificate: 'PVTG certificate',
  disability_certificate: 'Disability certificate (UDID)',
  pg_marksheet: "Master's degree marksheet / consolidated grade sheet",
  qualifying_degree: 'Qualifying degree / marksheet certificate',
  cgpa_conversion: 'CGPA to percentage conversion formula',
  admission_letter: 'University joining / admission certificate',
  foreign_admission_letter: 'Offer of admission from foreign university',
  family_income_proof: 'Family income certificate / ITR acknowledgement',
  domicile_certificate: 'Domicile / residential certificate',
  orphan_certificate: 'Orphan certificate / death certificate of parents',
  bonafide_certificate: 'Institute bonafide certificate',
  fee_receipt: 'Institute fee receipt / structure',
  bank_passbook: 'Bank passbook / cancelled cheque',
  last_passing_marksheet: 'Last passing semester / annual marksheet',
  visa_and_studentid: 'Student visa and university student ID card',
  joining_letter: 'Official department joining letter',
  employer_noc: 'Employer NOC & experience certificate',
  gap_certificate: 'Gap affidavit / certificate',
};

const SCHEME_RULES = {
  NFST: {
    code: 'NFST',
    name: 'National Fellowship for ST Students (M.Phil / Ph.D)',
    shortName: 'NFST',
    level: 'M.Phil / Ph.D in Indian Universities',
    applicationMode: 'DIRECT',
    incomeLimit: null, // No family income ceiling under official NFST guidelines
    minMarks: 55.0, // Minimum qualifying marks in Master's degree
    maxAge: 36, // General ST limit as per MoTA guidelines
    meritBased: true,
    meritBasis: 'Qualifying post-graduation marks & interview/committee review',
    seats: { total: 750, split: { Divyangjan: 38, PVTG: 25, Female: 225, 'ST others': 462 } },
  },
  NOS: {
    code: 'NOS',
    name: 'National Overseas Scholarship for ST Students',
    shortName: 'NOS',
    level: "Master's / Ph.D / Post-Doctoral Abroad",
    applicationMode: 'DIRECT',
    incomeLimit: 600000, // Total family income <= Rs. 6.00 Lakh per annum
    orphanIncomeExempt: true,
    minMarks: 55.0,
    qsRankLimit: 1000,
    maxAgeByLevel: { masters: 32, phd: 35, postdoc: 38 },
    meritBased: true,
    meritBasis: 'MoTA Expert Committee evaluation & QS rank tier',
    seats: { total: 20, split: { ST: 17, PVTG: 3 } },
  },
  PRE_MATRIC: {
    code: 'PRE_MATRIC',
    name: 'Pre-Matric Scholarship for ST Students (Class IX & X)',
    shortName: 'Pre-Matric',
    level: 'Class IX & X',
    applicationMode: 'DIRECT',
    incomeLimit: 250000,
    orphanIncomeExempt: true,
    minMarks: null,
    maxAge: null,
    allowedClasses: ['IX', 'X', '9', '10'],
    meritBased: false,
    seats: null,
  },
  POST_MATRIC: {
    code: 'POST_MATRIC',
    name: 'Post-Matric Scholarship for ST Students',
    shortName: 'Post-Matric',
    level: 'Class XI, XII, UG, PG in India',
    applicationMode: 'DIRECT',
    incomeLimit: 250000,
    orphanIncomeExempt: true,
    minMarks: null,
    maxAge: null,
    meritBased: false,
    seats: null,
  },
  TOP_CLASS: {
    code: 'TOP_CLASS',
    name: 'Top Class Education Scheme for ST Students',
    shortName: 'Top Class',
    level: 'Notified Premier Institutes in India',
    applicationMode: 'DIRECT',
    incomeLimit: 600000,
    orphanIncomeExempt: true,
    minMarks: null,
    meritBased: true,
    seats: { total: 1000 },
  },
};

const LEGACY_DOC_NAMES = {
  'Caste Certificate': 'st_certificate',
  'Income Certificate': 'family_income_proof',
  'Latest Marksheet': 'pg_marksheet',
  Marksheet: 'pg_marksheet',
  'Admission Letter': 'admission_letter',
  'Bonafide Certificate': 'bonafide_certificate',
};

module.exports = {
  SCHEME_RULES,
  DOCUMENT_LABELS,
  requiredDocTypes,
  LEGACY_DOC_NAMES,
  SCHEME_CATALOGUE,
  DOCUMENT_REGISTRY,
  getDocumentChecklist,
  evaluateEligibility,
};
