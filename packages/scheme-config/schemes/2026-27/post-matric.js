/**
 * Post-Matric Scholarship Scheme for ST Students
 * Canonical Versioned Configuration (Academic Session 2026-27)
 * Supports Core Post-Matric Fields + Configurable State/UT Extensions
 */
module.exports = {
  id: 'post-matric',
  code: 'POST_MATRIC',
  name: 'Post-Matric Scholarship Scheme for ST Students',
  hindiName: 'अनुसूचित जनजाति छात्रों हेतु पोस्ट-मैट्रिक छात्रवृत्ति योजना',
  shortName: 'Post-Matric',
  academicYear: '2026-27',
  schemeVersion: '2026.1',
  ruleVersion: '2026.1',
  formVersion: '2026.1',
  documentVersion: '2026.1',
  applicationMode: 'DIRECT',
  applicationStatus: 'OPEN',
  managingAuthority: 'State Tribal Welfare Departments & Ministry of Tribal Affairs',
  level: 'Class XI, XII, ITI, Diploma, UG, PG in India',
  type: 'Centrally Sponsored Scheme (Unified TribeXcel Intake)',
  window: '1 July 2026 – 31 October 2026',
  overview: 'Comprehensive entitlement scheme providing tuition fee reimbursement and maintenance allowance to Scheduled Tribe students pursuing post-matriculation or post-secondary education.',

  eligibilityRules: {
    category: ['ST'],
    incomeLimit: 250000, // Rs. 2.50 Lakhs per annum
    orphanIncomeExempt: true,
    minMarks: null,
    maxAge: null,
    regularStudentOnly: true,
    otherScholarshipRestriction: true,
  },

  // Core Post-Matric Fields
  coreFields: {
    personal: ['fullName', 'dob', 'gender', 'fatherName', 'motherName', 'mobile', 'addressLine', 'district', 'state', 'pincode'],
    category: ['domicileState', 'isPVTG', 'hasDisability', 'disabilityPercentage', 'familyAnnualIncome', 'isOrphan'],
    academic: [
      'courseLevel', // Intermediate / Diploma / Undergraduate / Postgraduate
      'currentCourse',
      'currentYear',
      'courseDuration',
      'institutionName',
      'universityOrBoard',
      'institutionState',
      'admissionYear',
      'enrollmentNumber',
      'hostelStatus',
    ],
    bank: ['accountHolder', 'accountNumber', 'ifsc', 'bankName', 'branchName'],
  },

  // State/UT Configurable Extensions
  stateExtensions: {
    Jharkhand: [
      { key: 'eDistrictApplicationNo', label: 'e-District Jharkhand Application Ref', type: 'text', required: false },
      { key: 'blockName', label: 'Tehsil / Block Name', type: 'text', required: true },
    ],
    Odisha: [
      { key: 'preranaId', label: 'PRERANA Scholarship Registration ID (if existing)', type: 'text', required: false },
      { key: 'panchayatName', label: 'Gram Panchayat', type: 'text', required: true },
    ],
    MadhyaPradesh: [
      { key: 'samagraId', label: 'Samagra Social Security ID (SSSM ID)', type: 'text', required: true },
    ],
    Chhattisgarh: [
      { key: 'cgDistrictPortalRef', label: 'Chhattisgarh State Portal Registration ID', type: 'text', required: false },
    ],
    Default: [
      { key: 'tehsil', label: 'Sub-District / Tehsil', type: 'text', required: false },
    ],
  },

  formSteps: [
    { key: 'personal', labelKey: 'step.personal', required: true },
    { key: 'category', labelKey: 'step.category', required: true },
    { key: 'academic', labelKey: 'step.academic', required: true },
    { key: 'bank', labelKey: 'step.bank', required: true },
    { key: 'documents', labelKey: 'step.documents', required: true },
    { key: 'review', labelKey: 'step.review', required: true },
  ],

  documentRequirements: [
    {
      id: 'photo',
      title: 'Applicant Photograph',
      description: 'Recent passport-size photograph with white background',
      mandatory: true,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
      sourceType: 'MANUAL_UPLOAD',
    },
    {
      id: 'st_certificate',
      title: 'Scheduled Tribe (ST) Certificate',
      description: 'Valid ST Certificate issued by competent Revenue Authority (Tehsildar/SDM)',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: 'CASTC',
    },
    {
      id: 'class10_certificate',
      title: 'Class 10 Certificate / DOB Proof',
      description: 'Class X board certificate verifying candidate date of birth',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: '10CR',
    },
    {
      id: 'family_income_proof',
      title: 'Family Income Certificate',
      description: 'Income certificate issued by competent authority showing total income <= Rs. 2,50,000/yr',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: 'INCER',
    },
    {
      id: 'domicile_certificate',
      title: 'Domicile / Residential Certificate',
      description: 'Proof of permanent residence in state',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: 'DOMCR',
    },
  ],

  conditionalDocuments: [
    {
      id: 'disability_certificate',
      condition: 'hasDisability',
      title: 'Disability Certificate (UDID)',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: 'DISCR',
    },
    {
      id: 'pvtg_certificate',
      condition: 'isPVTG',
      title: 'PVTG Certificate',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg'],
      maxSizeBytes: 2097152,
      digilockerSupported: false,
    },
    {
      id: 'orphan_certificate',
      condition: 'isOrphan',
      title: 'Orphan Certificate / Parents Death Certificates',
      mandatory: true,
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 2097152,
      digilockerSupported: false,
    },
  ],

  benefits: [
    { label: 'Compulsory Non-Refundable Fees', value: 'Reimbursement of tuition, examination, library, and laboratory charges' },
    { label: 'Maintenance Allowance', value: 'Course Group-based monthly stipend (up to Rs. 1,200/month for day scholars, Rs. 1,500/month for hostellers)' },
    { label: 'Study Tour & Thesis Charges', value: 'Allowable under post-graduate courses as per State schedule' },
  ],

  officialSources: {
    portalUrl: 'https://scholarships.gov.in',
    guidelinesUrl: 'https://tribal.nic.in/postMatric.aspx',
    authority: 'Ministry of Tribal Affairs & State Tribal Welfare Departments',
  },
};
