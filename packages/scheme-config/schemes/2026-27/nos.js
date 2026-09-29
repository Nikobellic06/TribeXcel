/**
 * National Overseas Scholarship for ST Students (NOS)
 * Canonical Versioned Configuration (Academic Session 2026-27)
 */
module.exports = {
  id: 'nos',
  code: 'NOS',
  name: 'National Overseas Scholarship for ST Students',
  hindiName: 'अनुसूचित जनजाति छात्रों हेतु राष्ट्रीय विदेशी छात्रवृत्ति',
  shortName: 'NOS',
  academicYear: '2026-27',
  schemeVersion: '2026.1',
  ruleVersion: '2026.1',
  formVersion: '2026.1',
  documentVersion: '2026.1',
  applicationMode: 'DIRECT',
  applicationStatus: 'OPEN',
  managingAuthority: 'Ministry of Tribal Affairs, Government of India',
  level: "Master's / Ph.D / Post-Doctoral Abroad",
  type: 'Central Sector Scheme (Unified TribeXcel Intake)',
  window: '1 July 2026 – 31 October 2026',
  overview: 'Provides 20 fresh awards annually to meritorious Scheduled Tribe students pursuing higher education abroad in institutions ranked within the top 1000 in QS World University Rankings.',

  eligibilityRules: {
    category: ['ST'],
    incomeLimit: 600000, // Total family income <= Rs. 6.00 Lakhs per annum
    orphanIncomeExempt: true,
    minQualifyingMarks: 55.0, // Minimum marks in qualifying degree
    qsRankLimit: 1000,
    maxAgeByLevel: {
      masters: 32,
      phd: 35,
      postdoc: 38,
    },
    twoChildrenRule: true,
    noPreviousAward: true,
  },

  slots: {
    total: 20,
    breakdown: {
      generalST: 17,
      pvtg: 3,
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

  // Specific NOS overseas fields
  formFields: {
    personal: ['fullName', 'dob', 'gender', 'fatherName', 'motherName', 'mobile', 'addressLine', 'district', 'state', 'pincode'],
    category: ['domicileState', 'isPVTG', 'hasDisability', 'disabilityPercentage', 'familyAnnualIncome', 'isOrphan'],
    academic: [
      'programmeLevel', // Master's / Ph.D / Post-Doctoral
      'fieldOfStudy',
      'courseName',
      'foreignInstitutionName',
      'country',
      'admissionStatus', // Confirmed / Unconditional Offer / Conditional Offer
      'courseStartDate',
      'qualifyingDegreeName',
      'qualifyingMarksPercentage',
      'qualifyingCGPA',
      'gradeType',
      'hasJoinedForeignUniversity',
      'isEmployed',
    ],
    bank: ['accountHolder', 'accountNumber', 'ifsc', 'bankName', 'branchName'],
    declarations: ['truthful', 'consent', 'twoChildrenRule', 'noPreviousAward'],
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
      id: 'family_income_proof',
      title: 'Family Income Certificate / ITR',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: 'INCER',
    },
    {
      id: 'qualifying_degree',
      title: 'Qualifying Degree Marksheet & Certificate',
      mandatory: true,
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 2097152,
      digilockerSupported: true,
      digilockerDocType: 'DEGRR',
    },
    {
      id: 'foreign_admission_letter',
      title: 'Foreign University Admission / Offer Letter',
      description: 'Official unconditional or conditional admission letter from foreign university ranked within QS top 1000',
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
      id: 'visa_and_studentid',
      condition: 'hasJoinedForeignUniversity',
      title: 'Valid Student Visa & Foreign University Student ID Card',
      mandatory: true,
      allowedMimeTypes: ['application/pdf', 'image/jpeg'],
      maxSizeBytes: 2097152,
    },
    {
      id: 'joining_letter',
      condition: 'hasJoinedForeignUniversity',
      title: 'Official Department Joining Letter',
      mandatory: true,
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 2097152,
    },
    {
      id: 'employer_noc',
      condition: 'isEmployed',
      title: 'Employer No Objection Certificate (NOC)',
      mandatory: true,
      allowedMimeTypes: ['application/pdf'],
      maxSizeBytes: 2097152,
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
    { label: 'Annual Maintenance Allowance', value: 'USA: USD 15,400; UK: GBP 9,900; Other countries: USD equivalent' },
    { label: 'Tuition Fees', value: 'Actual tuition fees paid directly to the foreign university' },
    { label: 'Contingency Allowance', value: 'USD 1,500 / annum (or GBP 1,100 / annum)' },
    { label: 'Economy Class Airfare', value: 'Direct international air travel and return after course completion' },
  ],

  officialSources: {
    portalUrl: 'https://overseas.tribal.gov.in',
    guidelinesUrl: 'https://tribal.nic.in/NOS.aspx',
    authority: 'Overseas Scholarship Division, Ministry of Tribal Affairs',
  },
};
