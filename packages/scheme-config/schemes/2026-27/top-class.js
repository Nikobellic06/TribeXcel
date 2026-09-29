/**
 * National Scholarship for Higher Education (Top Class) for ST Students
 * Canonical Versioned Configuration (Academic Session 2026-27)
 * Supports Dedicated FRESH and RENEWAL Flows
 */
module.exports = {
  id: 'top-class',
  code: 'TOP_CLASS',
  name: 'National Scholarship for Higher Education (Top Class) for ST Students',
  hindiName: 'अनुसूचित जनजाति छात्रों हेतु शीर्ष श्रेणी शिक्षा राष्ट्रीय छात्रवृत्ति',
  shortName: 'Top Class',
  academicYear: '2026-27',
  schemeVersion: '2026.1',
  ruleVersion: '2026.1',
  formVersion: '2026.1',
  documentVersion: '2026.1',
  applicationMode: 'DIRECT',
  applicationStatus: 'OPEN',
  managingAuthority: 'Ministry of Tribal Affairs, Government of India',
  level: '250+ Notified Premier Institutions (IITs, IIMs, NITs, AIIMS, NLUs, etc.)',
  type: 'Central Sector Scheme (Unified TribeXcel Intake)',
  window: '1 July 2026 – 31 October 2026',
  overview: 'Full financial support for Scheduled Tribe students pursuing graduate and post-graduate studies in 250+ notified premier institutions. 1000 fresh scholarships awarded annually.',

  eligibilityRules: {
    category: ['ST'],
    incomeLimit: 600000, // Total family income <= Rs. 6.00 Lakhs per annum
    orphanIncomeExempt: true,
    premierInstitutesOnly: true,
    renewalPassingMarks: 50.0, // Minimum passing percentage for renewal in subsequent years
    otherScholarshipRestriction: true,
  },

  slots: {
    total: 1000,
  },

  applicationTypes: ['FRESH', 'RENEWAL'],

  // Dynamic Form Field Configurations by Application Type
  formConfigurations: {
    FRESH: {
      fields: {
        personal: ['fullName', 'dob', 'gender', 'fatherName', 'motherName', 'mobile', 'addressLine', 'district', 'state', 'pincode'],
        category: ['domicileState', 'isPVTG', 'hasDisability', 'disabilityPercentage', 'familyAnnualIncome', 'isOrphan'],
        academic: [
          'premierInstituteName',
          'programmeName',
          'degreeType',
          'entranceExamName', // JEE Advanced / CAT / NEET / CLAT / etc.
          'entranceRank',
          'admissionDate',
          'rollNumber',
          'tuitionFeePerAnnum',
          'nonRefundableCharges',
        ],
        bank: ['accountHolder', 'accountNumber', 'ifsc', 'bankName', 'branchName'],
      },
      documents: [
        {
          id: 'photo',
          title: 'Passport Photograph',
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
          title: 'Class 10 Certificate / DOB Proof',
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
          id: 'bonafide_certificate',
          title: 'Institute Bonafide & Admission Letter',
          mandatory: true,
          allowedMimeTypes: ['application/pdf'],
          maxSizeBytes: 2097152,
        },
        {
          id: 'fee_receipt',
          title: 'Official Institute Fee Receipt / Structure',
          mandatory: true,
          allowedMimeTypes: ['application/pdf', 'image/jpeg'],
          maxSizeBytes: 2097152,
        },
        {
          id: 'bank_passbook',
          title: 'Bank Passbook / Cancelled Cheque',
          mandatory: true,
          allowedMimeTypes: ['application/pdf', 'image/jpeg'],
          maxSizeBytes: 2097152,
        },
      ],
    },
    RENEWAL: {
      fields: {
        personal: ['fullName', 'dob', 'mobile', 'addressLine', 'district', 'state', 'pincode'],
        academic: [
          'premierInstituteName',
          'programmeName',
          'currentYearSemester',
          'previousYearMarksPercentage',
          'hasBacklogs',
          'promotedToNextYear',
          'tuitionFeePerAnnum',
        ],
        bank: ['accountHolder', 'accountNumber', 'ifsc', 'bankName', 'branchName'],
      },
      documents: [
        {
          id: 'last_passing_marksheet',
          title: 'Last Passing Semester / Annual Marksheet',
          mandatory: true,
          allowedMimeTypes: ['application/pdf'],
          maxSizeBytes: 2097152,
        },
        {
          id: 'bonafide_certificate',
          title: 'Current Academic Year Bonafide Certificate',
          mandatory: true,
          allowedMimeTypes: ['application/pdf'],
          maxSizeBytes: 2097152,
        },
        {
          id: 'fee_receipt',
          title: 'Current Session Fee Receipt',
          mandatory: true,
          allowedMimeTypes: ['application/pdf', 'image/jpeg'],
          maxSizeBytes: 2097152,
        },
        {
          id: 'bank_passbook',
          title: 'Bank Passbook Copy',
          mandatory: true,
          allowedMimeTypes: ['application/pdf', 'image/jpeg'],
          maxSizeBytes: 2097152,
        },
      ],
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

  benefits: [
    { label: 'Full Tuition Fee', value: 'Actual tuition fee & non-refundable charges (up to Rs. 2.00 Lakh/yr in private notified institutes)' },
    { label: 'Living Expenses', value: 'Rs. 3,000 / month (Rs. 36,000 / annum)' },
    { label: 'Books & Stationery', value: 'Rs. 5,000 / annum' },
    { label: 'Computer Grant', value: 'Rs. 45,000 one-time financial assistance for laptop/desktop' },
  ],

  officialSources: {
    portalUrl: 'https://scholarships.gov.in',
    guidelinesUrl: 'https://tribal.nic.in/topClass.aspx',
    authority: 'Ministry of Tribal Affairs, Government of India',
  },
};
