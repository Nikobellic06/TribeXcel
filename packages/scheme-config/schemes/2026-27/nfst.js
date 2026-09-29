/**
 * National Fellowship for ST Students (NFST) - M.Phil / Ph.D
 * Canonical Versioned Configuration (Academic Session 2026-27)
 */
module.exports = {
  id: 'nfst',
  code: 'NFST',
  name: 'National Fellowship for ST Students',
  hindiName: 'अनुसूचित जनजाति के छात्रों के लिए राष्ट्रीय अध्येतावृत्ति',
  shortName: 'NFST',
  academicYear: '2026-27',
  schemeVersion: '2026.1',
  ruleVersion: '2026.1',
  formVersion: '2026.1',
  documentVersion: '2026.1',
  applicationMode: 'DIRECT',
  applicationStatus: 'OPEN',
  managingAuthority: 'Ministry of Tribal Affairs, Government of India',
  level: 'M.Phil / Ph.D in Indian Universities & Research Institutes',
  type: 'Central Sector Scheme (Unified TribeXcel Intake)',
  window: '1 July 2026 – 31 October 2026',
  overview: 'Provides 750 fellowships annually to Scheduled Tribe research scholars pursuing regular full-time M.Phil and Ph.D degrees in recognized Indian universities, IITs, NITs, and Institutes of National Importance.',

  eligibilityRules: {
    category: ['ST'],
    incomeLimit: null, // NO family income limit under official NFST guidelines
    minQualifyingMarks: 55.0, // Minimum Master's percentage (M.Phil marks not considered for minimum qualifying marks)
    maxAge: 36, // General ST limit as on 1st July of selection year
    allowedCourses: ['M.Phil', 'Ph.D', 'Integrated M.Phil-Ph.D'],
    regularFullTimeOnly: true,
    otherFellowshipDeclarationRequired: true,
  },

  slots: {
    total: 750,
    breakdown: {
      divyangjan: 38,
      pvtg: 25,
      female: 225,
      generalST: 462,
    },
  },

  formSteps: [
    { key: 'personal', labelKey: 'step.personal', required: true },
    { key: 'category', labelKey: 'step.category', required: true },
    { key: 'academic', labelKey: 'step.academic', required: true },
    { key: 'bank', labelKey: 'step.bank', required: true },
    { key: 'documents', labelKey: 'step.documents', required: true },
    { key: 'review', labelKey: 'step.review', required: true },
  ],

  // Specific NFST fields only
  formFields: {
    personal: ['fullName', 'dob', 'gender', 'fatherName', 'motherName', 'mobile', 'addressLine', 'district', 'state', 'pincode'],
    category: ['domicileState', 'isPVTG', 'hasDisability', 'disabilityPercentage'],
    academic: [
      'courseLevel', // M.Phil / Ph.D / Integrated
      'discipline',
      'universityName',
      'departmentName',
      'admissionStatus', // Confirmed / Registered
      'admissionDate',
      'registrationNumber',
      'pgDegreeName',
      'pgUniversity',
      'pgPassingYear',
      'pgGradeType', // percentage or cgpa
      'pgMarksPercentage',
      'pgCGPA',
    ],
    bank: ['accountHolder', 'accountNumber', 'ifsc', 'bankName', 'branchName'],
    declarations: ['truthful', 'consent', 'singleFellowship'],
  },

  documentRequirements: [
    {
      id: 'photo',
      title: 'Applicant Photograph',
      mandatory: true,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
    },
    {
      id: 'st_certificate',
      title: 'Scheduled Tribe (ST) Certificate',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: 'CASTC',
    },
    {
      id: 'class10_certificate',
      title: 'Class 10 Certificate (Proof of Date of Birth)',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: '10CR',
    },
    {
      id: 'pg_marksheet',
      title: "Master's Degree Consolidated Marksheet",
      description: "Consolidated marksheet showing minimum 55% marks (M.Phil marks not considered)",
      mandatory: true,
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: 'DEGRR',
    },
    {
      id: 'admission_letter',
      title: 'University Admission / Joining Letter',
      description: 'Official document certifying regular admission in M.Phil / Ph.D issued by University Registrar/Dean',
      mandatory: true,
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 2097152,
    },
  ],

  conditionalDocuments: [
    {
      id: 'cgpa_conversion',
      condition: 'usesCGPA',
      title: 'CGPA to Percentage Conversion Formula',
      mandatory: true,
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 2097152,
    },
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
    },
  ],

  benefits: [
    { label: 'Junior Research Fellowship (JRF)', value: 'Rs. 37,000 / month (first 2 years)' },
    { label: 'Senior Research Fellowship (SRF)', value: 'Rs. 42,000 / month (remaining duration)' },
    { label: 'Contingency Grant', value: 'Humanities: Rs. 10,000–Rs. 20,500/yr; Science: Rs. 12,000–Rs. 25,000/yr' },
    { label: 'House Rent Allowance (HRA)', value: 'As per central government / UGC norms' },
    { label: 'Escorts / Reader Allowance', value: 'Rs. 2,000 / month for physically handicapped / blind scholars' },
  ],

  officialSources: {
    portalUrl: 'https://fellowship.tribal.gov.in',
    guidelinesUrl: 'https://tribal.nic.in/NFST.aspx',
    authority: 'Ministry of Tribal Affairs, New Delhi',
  },
};
