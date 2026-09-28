/**
 * Document-Specific Schemas & Required Field Definitions
 */

export const DOCUMENT_SCHEMAS = {
  ST_CERTIFICATE: {
    name: 'Scheduled Tribe Certificate',
    requiredFields: ['fullName', 'tribeName', 'category', 'certificateNumber', 'issuingAuthority'],
    allFields: ['fullName', 'fatherName', 'motherName', 'tribeName', 'category', 'certificateNumber', 'issueDate', 'issuingAuthority', 'state', 'district']
  },
  PVTG_CERTIFICATE: {
    name: 'Particularly Vulnerable Tribal Group Certificate',
    requiredFields: ['fullName', 'tribeName', 'category', 'certificateNumber'],
    allFields: ['fullName', 'fatherName', 'motherName', 'tribeName', 'category', 'certificateNumber', 'issueDate', 'issuingAuthority', 'state', 'district']
  },
  INCOME_CERTIFICATE: {
    name: 'Income Certificate',
    requiredFields: ['fullName', 'annualIncome', 'certificateNumber', 'issuingAuthority'],
    allFields: ['fullName', 'fatherName', 'annualIncome', 'incomePeriod', 'financialYear', 'certificateNumber', 'issueDate', 'issuingAuthority', 'state', 'district']
  },
  MARKSHEET: {
    name: 'Marksheet / Statement of Marks',
    requiredFields: ['studentName', 'institution', 'percentage'],
    allFields: ['studentName', 'rollNumber', 'institution', 'board', 'examination', 'class', 'academicYear', 'subjects', 'subjectMarks', 'totalMarks', 'maximumMarks', 'percentage', 'result', 'grade']
  },
  DOMICILE_CERTIFICATE: {
    name: 'Domicile / Residential Certificate',
    requiredFields: ['fullName', 'state', 'certificateNumber'],
    allFields: ['fullName', 'fatherName', 'address', 'state', 'district', 'certificateNumber', 'issueDate', 'issuingAuthority']
  },
  AADHAAR: {
    name: 'Aadhaar Card',
    requiredFields: ['name', 'maskedAadhaarNumber'],
    allFields: ['name', 'dateOfBirth', 'gender', 'maskedAadhaarNumber', 'address']
  },
  BANK_PASSBOOK: {
    name: 'Bank Passbook / Statement',
    requiredFields: ['accountHolderName', 'bankName', 'maskedAccountNumber', 'ifsc'],
    allFields: ['accountHolderName', 'bankName', 'branch', 'maskedAccountNumber', 'ifsc']
  },
  DEGREE_CERTIFICATE: {
    name: 'University Degree Certificate',
    requiredFields: ['name', 'degree', 'university'],
    allFields: ['name', 'degree', 'specialization', 'university', 'institution', 'year', 'percentage', 'certificateNumber', 'issueDate']
  },
  ADMISSION_LETTER: {
    name: 'Admission / Allotment Letter',
    requiredFields: ['applicantName', 'institution', 'course'],
    allFields: ['applicantName', 'institution', 'course', 'programme', 'admissionYear', 'country', 'issueDate', 'referenceNumber']
  },
  OFFER_LETTER: {
    name: 'Foreign University Offer Letter',
    requiredFields: ['applicantName', 'institution', 'course'],
    allFields: ['applicantName', 'institution', 'course', 'programme', 'admissionYear', 'country', 'issueDate', 'referenceNumber']
  },
  DISABILITY_CERTIFICATE: {
    name: 'Disability Certificate (PwD)',
    requiredFields: ['name', 'disabilityType', 'disabilityPercentage', 'certificateNumber'],
    allFields: ['name', 'disabilityType', 'disabilityPercentage', 'certificateNumber', 'issueDate', 'issuingAuthority']
  },
  BONAFIDE_CERTIFICATE: {
    name: 'Bonafide Certificate',
    requiredFields: ['name', 'institution'],
    allFields: ['name', 'institution', 'course', 'academicYear', 'certificateNumber', 'issueDate']
  },
  FEE_RECEIPT: {
    name: 'Institution Fee Receipt',
    requiredFields: ['studentName', 'institution', 'feeAmount'],
    allFields: ['studentName', 'institution', 'feeAmount', 'feeType', 'receiptNumber', 'paymentDate', 'academicYear']
  },
  UNKNOWN: {
    name: 'Unrecognized Document',
    requiredFields: [],
    allFields: ['name', 'documentReference', 'rawTextSnippet']
  }
};
