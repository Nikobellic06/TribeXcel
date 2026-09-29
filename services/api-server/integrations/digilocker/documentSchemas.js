/**
 * TribeXcel DigiLocker Sandbox — Document Schemas
 * Defines the 12 canonical document types, their display metadata, category,
 * field definitions, and their mapping to TribeXcel application requirements.
 */

const DOCUMENT_SCHEMAS = {
  ST_CERTIFICATE: {
    documentType: 'ST_CERTIFICATE',
    displayName: 'Scheduled Tribe (ST) Certificate',
    category: 'CASTE_TRIBE',
    targetTribeXcelKey: 'st_certificate',
    defaultIssuer: 'State Revenue Department / Sub-Divisional Magistrate (SDM)',
    description: 'Statutory certificate proving Scheduled Tribe community membership',
    fields: [
      { key: 'certificateNumber', label: 'Certificate Number', type: 'string', required: true, example: 'ST/2024/JH/81923', autoFillKey: 'stCertificateNumber' },
      { key: 'holderName', label: 'Candidate Full Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'fatherName', label: "Father's Name", type: 'string', required: true, example: 'Late Shri Ramesh Kumar', autoFillKey: 'fatherName' },
      { key: 'motherName', label: "Mother's Name", type: 'string', required: false, example: 'Shanti Devi', autoFillKey: 'motherName' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, example: '2005-08-15', autoFillKey: 'dob' },
      { key: 'tribeName', label: 'Tribe / Sub-Caste Name', type: 'string', required: true, example: 'Santhal', autoFillKey: 'tribe' },
      { key: 'category', label: 'Category', type: 'string', required: true, example: 'ST', autoFillKey: 'socialCategory' },
      { key: 'issuingAuthority', label: 'Issuing Authority', type: 'string', required: true, example: 'Sub-Divisional Officer (SDO)', autoFillKey: 'stIssuingAuthority' },
      { key: 'issueDate', label: 'Issue Date', type: 'date', required: true, example: '2023-08-14', autoFillKey: 'stIssueDate' },
      { key: 'district', label: 'District', type: 'string', required: true, example: 'Ranchi', autoFillKey: 'district' },
      { key: 'state', label: 'State', type: 'string', required: true, example: 'Jharkhand', autoFillKey: 'state' },
    ],
  },

  INCOME_CERTIFICATE: {
    documentType: 'INCOME_CERTIFICATE',
    displayName: 'Family Income Certificate',
    category: 'INCOME',
    targetTribeXcelKey: 'family_income_proof',
    defaultIssuer: 'Tehsildar / Competent Revenue Authority',
    description: 'Statutory proof of gross annual family income from all sources',
    fields: [
      { key: 'certificateNumber', label: 'Certificate Number', type: 'string', required: true, example: 'INC/2025/11029', autoFillKey: 'incomeCertificateNumber' },
      { key: 'holderName', label: 'Beneficiary / Head of Family Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'incomeApplicantName' },
      { key: 'fatherName', label: "Father's / Guardian's Name", type: 'string', required: true, example: 'Ramesh Kumar', autoFillKey: 'fatherName' },
      { key: 'annualIncome', label: 'Annual Family Income (₹)', type: 'number', required: true, example: 140000, autoFillKey: 'annualIncome' },
      { key: 'financialYear', label: 'Financial Year', type: 'string', required: true, example: '2025-2026', autoFillKey: 'incomeFinancialYear' },
      { key: 'issuingAuthority', label: 'Issuing Authority', type: 'string', required: true, example: 'Office of the Tehsildar', autoFillKey: 'incomeIssuingAuthority' },
      { key: 'issueDate', label: 'Issue Date', type: 'date', required: true, example: '2025-03-19', autoFillKey: 'incomeIssueDate' },
      { key: 'district', label: 'District', type: 'string', required: true, example: 'Ranchi', autoFillKey: 'district' },
      { key: 'state', label: 'State', type: 'string', required: true, example: 'Jharkhand', autoFillKey: 'state' },
    ],
  },

  DOMICILE_CERTIFICATE: {
    documentType: 'DOMICILE_CERTIFICATE',
    displayName: 'Domicile / Resident Certificate',
    category: 'ADDRESS',
    targetTribeXcelKey: 'domicile_certificate',
    defaultIssuer: 'District Magistrate / Tehsildar',
    description: 'Proof of permanent resident status in the State',
    fields: [
      { key: 'certificateNumber', label: 'Certificate Number', type: 'string', required: true, example: 'DOM/2024/7718', autoFillKey: 'domicileCertificateNumber' },
      { key: 'holderName', label: 'Resident Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'fatherName', label: "Father's Name", type: 'string', required: true, example: 'Ramesh Kumar', autoFillKey: 'fatherName' },
      { key: 'address', label: 'Permanent Address', type: 'string', required: true, example: 'Vill-Bariatu, PO-Ranchi', autoFillKey: 'permanentAddress' },
      { key: 'district', label: 'District', type: 'string', required: true, example: 'Ranchi', autoFillKey: 'district' },
      { key: 'state', label: 'State', type: 'string', required: true, example: 'Jharkhand', autoFillKey: 'state' },
      { key: 'issueDate', label: 'Issue Date', type: 'date', required: true, example: '2024-11-02', autoFillKey: 'domicileIssueDate' },
      { key: 'issuingAuthority', label: 'Issuing Authority', type: 'string', required: true, example: 'Sub-Divisional Magistrate', autoFillKey: 'domicileAuthority' },
    ],
  },

  CLASS_X_MARKSHEET: {
    documentType: 'CLASS_X_MARKSHEET',
    displayName: 'Class X Secondary School Marksheet',
    category: 'ACADEMIC',
    targetTribeXcelKey: 'class10_certificate',
    defaultIssuer: 'Central Board of Secondary Education (CBSE) / State Board',
    description: 'Secondary School Examination Marksheet and DOB certificate',
    fields: [
      { key: 'studentName', label: 'Student Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'rollNumber', label: 'Roll Number / Roll Code', type: 'string', required: true, example: '8172901', autoFillKey: 'class10RollNo' },
      { key: 'school', label: 'School / Institution Name', type: 'string', required: true, example: 'Kendriya Vidyalaya No. 1 Ranchi', autoFillKey: 'class10School' },
      { key: 'board', label: 'Examination Board', type: 'string', required: true, example: 'CBSE', autoFillKey: 'class10Board' },
      { key: 'dateOfBirth', label: 'Date of Birth (as per records)', type: 'date', required: true, example: '2005-08-15', autoFillKey: 'dob' },
      { key: 'passingYear', label: 'Passing Year', type: 'string', required: true, example: '2021', autoFillKey: 'class10PassingYear' },
      { key: 'totalMarks', label: 'Total Marks / CGPA', type: 'string', required: true, example: '432 / 500', autoFillKey: 'class10TotalMarks' },
      { key: 'percentage', label: 'Percentage (%)', type: 'string', required: true, example: '86.4', autoFillKey: 'class10Percentage' },
    ],
  },

  CLASS_XII_MARKSHEET: {
    documentType: 'CLASS_XII_MARKSHEET',
    displayName: 'Class XII Senior Secondary Marksheet',
    category: 'ACADEMIC',
    targetTribeXcelKey: 'class12_marksheet',
    defaultIssuer: 'CBSE / CISCE / State Secondary Education Board',
    description: 'Higher Secondary / Intermediate Certificate',
    fields: [
      { key: 'studentName', label: 'Student Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'rollNumber', label: 'Roll Number', type: 'string', required: true, example: '12849102', autoFillKey: 'class12RollNo' },
      { key: 'school', label: 'College / School Name', type: 'string', required: true, example: 'St. Xaviers College Ranchi', autoFillKey: 'class12School' },
      { key: 'board', label: 'Board Name', type: 'string', required: true, example: 'CBSE', autoFillKey: 'class12Board' },
      { key: 'passingYear', label: 'Passing Year', type: 'string', required: true, example: '2023', autoFillKey: 'class12PassingYear' },
      { key: 'subjects', label: 'Stream / Subjects', type: 'string', required: false, example: 'Physics, Chemistry, Mathematics, English', autoFillKey: 'class12Stream' },
      { key: 'totalMarks', label: 'Total Marks', type: 'string', required: true, example: '445 / 500', autoFillKey: 'class12TotalMarks' },
      { key: 'percentage', label: 'Percentage (%)', type: 'string', required: true, example: '89.0', autoFillKey: 'class12Percentage' },
    ],
  },

  GRADUATION_MARKSHEET: {
    documentType: 'GRADUATION_MARKSHEET',
    displayName: 'Graduation / Bachelor Degree Marksheet',
    category: 'ACADEMIC',
    targetTribeXcelKey: 'graduation_certificate',
    defaultIssuer: 'University / Institute of National Importance',
    description: 'Official undergraduate consolidated marksheet or degree transcript',
    fields: [
      { key: 'studentName', label: 'Student Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'institution', label: 'University / College Name', type: 'string', required: true, example: 'Birla Institute of Technology Mesra', autoFillKey: 'ugInstitute' },
      { key: 'programme', label: 'Degree / Programme (e.g., B.Tech, B.Sc)', type: 'string', required: true, example: 'B.Tech Computer Science', autoFillKey: 'ugDegree' },
      { key: 'passingYear', label: 'Passing Year', type: 'string', required: true, example: '2025', autoFillKey: 'ugPassingYear' },
      { key: 'totalMarks', label: 'Total Marks', type: 'string', required: false, example: '8.45 CGPA', autoFillKey: 'ugMarks' },
      { key: 'percentage', label: 'Percentage (%)', type: 'string', required: false, example: '79.5', autoFillKey: 'ugPercentage' },
      { key: 'cgpa', label: 'CGPA (10-point scale)', type: 'string', required: false, example: '8.45', autoFillKey: 'ugCgpa' },
    ],
  },

  PG_MARKSHEET: {
    documentType: 'PG_MARKSHEET',
    displayName: 'Post-Graduation / Master Degree Marksheet',
    category: 'ACADEMIC',
    targetTribeXcelKey: 'pg_marksheet',
    defaultIssuer: 'Central / State University',
    description: 'Postgraduate degree transcript or final semester marksheet',
    fields: [
      { key: 'studentName', label: 'Student Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'institution', label: 'University / Institute', type: 'string', required: true, example: 'Central Institute of Physical Sciences', autoFillKey: 'pgUniversity' },
      { key: 'programme', label: 'Programme (e.g. M.Sc, M.Phil)', type: 'string', required: true, example: 'M.Sc Physics', autoFillKey: 'pgDegree' },
      { key: 'passingYear', label: 'Passing Year', type: 'string', required: false, example: '2025', autoFillKey: 'pgYear' },
      { key: 'semesterOrYear', label: 'Semester / Year', type: 'string', required: false, example: 'Final Semester', autoFillKey: 'pgSemester' },
      { key: 'marks', label: 'Marks Obtained', type: 'string', required: false, example: '1899 / 2400', autoFillKey: 'pgMarks' },
      { key: 'percentage', label: 'Percentage (%)', type: 'string', required: false, example: '79.13', autoFillKey: 'percentage' },
      { key: 'cgpa', label: 'CGPA', type: 'string', required: false, example: '8.2', autoFillKey: 'cgpa' },
    ],
  },

  ADMISSION_LETTER: {
    documentType: 'ADMISSION_LETTER',
    displayName: 'Institutional Admission / Offer Letter',
    category: 'ACADEMIC',
    targetTribeXcelKey: 'admission_letter',
    defaultIssuer: 'Admissions Office / Dean Academics',
    description: 'Official letter confirming offer of admission',
    fields: [
      { key: 'candidateName', label: 'Candidate Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'applicationNumber', label: 'Admission / Enrollment Number', type: 'string', required: true, example: 'ADM-2026-9921', autoFillKey: 'enrollmentNumber' },
      { key: 'institution', label: 'Admitting Institution', type: 'string', required: true, example: 'Indian Institute of Technology (IIT) Delhi', autoFillKey: 'institutionName' },
      { key: 'programme', label: 'Admitted Programme', type: 'string', required: true, example: 'M.Tech Data Science', autoFillKey: 'courseName' },
      { key: 'admissionYear', label: 'Academic Year', type: 'string', required: true, example: '2026-2027', autoFillKey: 'academicYear' },
      { key: 'category', label: 'Admission Quota / Category', type: 'string', required: false, example: 'ST Quota', autoFillKey: 'socialCategory' },
    ],
  },

  BONAFIDE_CERTIFICATE: {
    documentType: 'BONAFIDE_CERTIFICATE',
    displayName: 'Institutional Bonafide Certificate',
    category: 'ACADEMIC',
    targetTribeXcelKey: 'bonafide_certificate',
    defaultIssuer: 'Head of Institution / Registrar / Principal',
    description: 'Certificate certifying regular enrolled student status',
    fields: [
      { key: 'studentName', label: 'Student Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'rollNumber', label: 'Institute Roll / Registration No.', type: 'string', required: true, example: '26CS091', autoFillKey: 'rollNo' },
      { key: 'institution', label: 'Institution Name', type: 'string', required: true, example: 'National Institute of Technology (NIT) Jamshedpur', autoFillKey: 'institutionName' },
      { key: 'course', label: 'Enrolled Course / Branch', type: 'string', required: true, example: 'B.Tech Mechanical Engineering', autoFillKey: 'courseName' },
      { key: 'academicYear', label: 'Current Academic Year', type: 'string', required: true, example: '2026-2027', autoFillKey: 'academicYear' },
      { key: 'issueDate', label: 'Date of Issue', type: 'date', required: true, example: '2026-07-15', autoFillKey: 'bonafideIssueDate' },
    ],
  },

  DISABILITY_CERTIFICATE: {
    documentType: 'DISABILITY_CERTIFICATE',
    displayName: 'Unique Disability ID (UDID) / Disability Certificate',
    category: 'IDENTITY',
    targetTribeXcelKey: 'disability_certificate',
    defaultIssuer: 'District Medical Board / Ministry of Social Justice',
    description: 'Certificate of disability for Persons with Disabilities (PwD) quota',
    fields: [
      { key: 'certificateNumber', label: 'UDID / Certificate Number', type: 'string', required: true, example: 'JH2091823901', autoFillKey: 'disabilityCertNo' },
      { key: 'holderName', label: 'Candidate Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'disabilityType', label: 'Type of Disability', type: 'string', required: true, example: 'Locomotor Disability', autoFillKey: 'disabilityType' },
      { key: 'percentageDisability', label: 'Disability Percentage (%)', type: 'string', required: true, example: '45%', autoFillKey: 'disabilityPercentage' },
      { key: 'issuingAuthority', label: 'Medical Board Authority', type: 'string', required: true, example: 'Chief Medical Officer, Sadar Hospital', autoFillKey: 'disabilityAuthority' },
      { key: 'issueDate', label: 'Date of Issue', type: 'date', required: true, example: '2023-01-20', autoFillKey: 'disabilityIssueDate' },
    ],
  },

  PVTG_CERTIFICATE: {
    documentType: 'PVTG_CERTIFICATE',
    displayName: 'Particularly Vulnerable Tribal Group (PVTG) Certificate',
    category: 'CASTE_TRIBE',
    targetTribeXcelKey: 'pvtg_certificate',
    defaultIssuer: 'Project Officer, ITDA / District Collector',
    description: 'Special certificate confirming belonging to one of 75 recognized PVTG groups',
    fields: [
      { key: 'certificateNumber', label: 'Certificate Number', type: 'string', required: true, example: 'PVTG/JH/2024/091', autoFillKey: 'pvtgCertNo' },
      { key: 'holderName', label: 'Candidate Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'fullName' },
      { key: 'communityName', label: 'PVTG Community Name', type: 'string', required: true, example: 'Birhor', autoFillKey: 'pvtgCommunity' },
      { key: 'district', label: 'District', type: 'string', required: true, example: 'Hazaribagh', autoFillKey: 'district' },
      { key: 'state', label: 'State', type: 'string', required: true, example: 'Jharkhand', autoFillKey: 'state' },
      { key: 'issuingAuthority', label: 'Competent Authority', type: 'string', required: true, example: 'Integrated Tribal Development Agency (ITDA)', autoFillKey: 'pvtgAuthority' },
      { key: 'issueDate', label: 'Issue Date', type: 'date', required: true, example: '2024-04-12', autoFillKey: 'pvtgIssueDate' },
    ],
  },

  BANK_PASSBOOK: {
    documentType: 'BANK_PASSBOOK',
    displayName: 'Bank Passbook / Cancelled Cheque',
    category: 'INCOME',
    targetTribeXcelKey: 'bank_passbook',
    defaultIssuer: 'Scheduled Commercial Bank / Public Sector Bank',
    description: 'Bank account proof for Direct Benefit Transfer (DBT)',
    fields: [
      { key: 'accountHolderName', label: 'Account Holder Name', type: 'string', required: true, example: 'Rahul Kumar', autoFillKey: 'bankAccountName' },
      { key: 'accountNumber', label: 'Bank Account Number', type: 'string', required: true, example: '38192019482', autoFillKey: 'bankAccountNumber' },
      { key: 'ifscCode', label: 'IFSC Code', type: 'string', required: true, example: 'SBIN0001234', autoFillKey: 'bankIfsc' },
      { key: 'bankName', label: 'Bank Name', type: 'string', required: true, example: 'State Bank of India', autoFillKey: 'bankName' },
      { key: 'branchName', label: 'Branch Name', type: 'string', required: true, example: 'Main Branch Ranchi', autoFillKey: 'bankBranch' },
    ],
  },
};

/**
 * Helper to find schema by documentType or TribeXcel target key
 */
const getSchemaByType = (type) => {
  if (!type) return null;
  const upper = String(type).toUpperCase().replace(/-/g, '_');
  if (DOCUMENT_SCHEMAS[upper]) return DOCUMENT_SCHEMAS[upper];

  // Try matching by target key (e.g. 'st_certificate')
  const found = Object.values(DOCUMENT_SCHEMAS).find(
    (s) => s.targetTribeXcelKey === type.toLowerCase() || s.documentType.toLowerCase() === type.toLowerCase()
  );
  return found || null;
};

/**
 * Map TribeXcel requirement key to DigiLocker document type
 */
const mapTribeXcelKeyToDocType = (reqKey) => {
  const norm = String(reqKey).toLowerCase();
  const entry = Object.values(DOCUMENT_SCHEMAS).find((s) => s.targetTribeXcelKey === norm);
  return entry ? entry.documentType : null;
};

module.exports = {
  DOCUMENT_SCHEMAS,
  getSchemaByType,
  mapTribeXcelKeyToDocType,
};
