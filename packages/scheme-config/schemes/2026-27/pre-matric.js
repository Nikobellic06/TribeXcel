/**
 * Pre-Matric Scholarship Scheme for ST Students (Class IX & X)
 * Canonical Versioned Configuration (Academic Session 2026-27)
 */
module.exports = {
  id: 'pre-matric',
  code: 'PRE_MATRIC',
  name: 'Pre-Matric Scholarship Scheme for ST Students',
  hindiName: 'अनुसूचित जनजाति छात्रों हेतु मैट्रिक-पूर्व छात्रवृत्ति योजना',
  shortName: 'Pre-Matric',
  academicYear: '2026-27',
  schemeVersion: '2026.1',
  ruleVersion: '2026.1',
  formVersion: '2026.1',
  documentVersion: '2026.1',
  applicationMode: 'DIRECT',
  applicationStatus: 'OPEN',
  managingAuthority: 'State Government / UT Administration & Ministry of Tribal Affairs',
  level: 'Class IX & X in Recognized Schools',
  type: 'Centrally Sponsored Scheme (Unified TribeXcel Intake)',
  window: '1 July 2026 – 31 October 2026',
  overview: 'Supports Scheduled Tribe parents in sending children to school at Class IX and X levels, minimizing dropout rates and establishing strong educational foundations.',

  eligibilityRules: {
    category: ['ST'],
    allowedClasses: ['IX', 'X', '9', '10'],
    incomeLimit: 250000, // Rs. 2.50 Lakhs per annum
    orphanIncomeExempt: true,
    minMarks: null,
    maxAge: null,
    dayScholarOrHostellerRequired: true,
    schoolRecognitionRequired: true,
    otherScholarshipRestriction: true,
  },

  formSteps: [
    { key: 'personal', labelKey: 'step.personal', required: true },
    { key: 'category', labelKey: 'step.category', required: true },
    { key: 'academic', labelKey: 'step.academic', required: true },
    { key: 'bank', labelKey: 'step.bank', required: true },
    { key: 'documents', labelKey: 'step.documents', required: true },
    { key: 'review', labelKey: 'step.review', required: true },
  ],

  formFields: {
    personal: ['fullName', 'dob', 'gender', 'fatherName', 'motherName', 'mobile', 'addressLine', 'district', 'state', 'pincode'],
    category: ['domicileState', 'isPVTG', 'hasDisability', 'disabilityPercentage', 'familyAnnualIncome', 'isOrphan'],
    academic: ['className', 'schoolName', 'schoolType', 'board', 'enrollmentNumber', 'scholarType', 'isRepeating'],
    bank: ['accountHolder', 'accountNumber', 'ifsc', 'bankName', 'branchName'],
  },

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
      description: 'Proof of permanent residence issued by competent authority',
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
    { label: 'Day Scholar Grant', value: 'Rs. 2,250 / year + Rs. 750 book grant' },
    { label: 'Hosteller Grant', value: 'Rs. 5,250 / year + Rs. 1,000 book grant' },
    { label: 'Disability Allowance', value: 'Additional allowance as per Ministry norms for Divyang scholars' },
  ],

  officialSources: {
    portalUrl: 'https://scholarships.gov.in',
    guidelinesUrl: 'https://tribal.nic.in/preMatric.aspx',
    authority: 'Ministry of Tribal Affairs & State Tribal Welfare Departments',
  },
};
