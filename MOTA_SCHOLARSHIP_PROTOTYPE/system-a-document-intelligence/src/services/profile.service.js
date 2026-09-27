/**
 * Structured Applicant Profile Generator
 * 
 * Aggregates and normalizes extracted data from all analyzed documents
 * into a single unified profile. Does NOT invent values (uses null if not found).
 */

export function generateApplicantProfile(documents = []) {
  const profile = {
    applicant: {
      fullName: null,
      dateOfBirth: null,
      gender: null,
      category: null,
      tribeName: null,
      domicileState: null
    },
    education: {
      class: null,
      institution: null,
      course: null,
      qualification: null,
      percentage: null
    },
    financial: {
      annualIncome: null
    },
    bank: {
      bankName: null,
      accountHolderName: null,
      accountNumberMasked: null,
      ifsc: null
    },
    documents: []
  };

  // Helper priority getter: returns first non-null value from given document types, then falls back to any doc
  function findFieldValue(preferredTypes, fieldKey) {
    for (const type of preferredTypes) {
      const doc = documents.find(d => d.documentType === type);
      if (doc && doc.fields && doc.fields[fieldKey] !== null && doc.fields[fieldKey] !== undefined && String(doc.fields[fieldKey]).trim() !== '') {
        return String(doc.fields[fieldKey]).trim();
      }
    }
    // Fallback to any document that has this field
    for (const doc of documents) {
      if (doc && doc.fields && doc.fields[fieldKey] !== null && doc.fields[fieldKey] !== undefined && String(doc.fields[fieldKey]).trim() !== '') {
        return String(doc.fields[fieldKey]).trim();
      }
    }
    return null;
  }

  // Populate Applicant
  profile.applicant.fullName = findFieldValue(['AADHAAR', 'ST_CERTIFICATE', 'PVTG_CERTIFICATE', 'MARKSHEET', 'BANK_PASSBOOK'], 'fullName');
  profile.applicant.dateOfBirth = findFieldValue(['AADHAAR', 'MARKSHEET'], 'dateOfBirth');
  profile.applicant.gender = findFieldValue(['AADHAAR'], 'gender');
  profile.applicant.category = findFieldValue(['ST_CERTIFICATE', 'PVTG_CERTIFICATE'], 'category');
  profile.applicant.tribeName = findFieldValue(['ST_CERTIFICATE', 'PVTG_CERTIFICATE'], 'tribeName');
  profile.applicant.domicileState = findFieldValue(['DOMICILE_CERTIFICATE', 'AADHAAR', 'ST_CERTIFICATE'], 'domicileState') 
    || findFieldValue(['DOMICILE_CERTIFICATE', 'AADHAAR', 'ST_CERTIFICATE'], 'state');

  // Populate Education
  profile.education.class = findFieldValue(['MARKSHEET', 'BONAFIDE_CERTIFICATE', 'ADMISSION_LETTER'], 'class');
  profile.education.institution = findFieldValue(['ADMISSION_LETTER', 'OFFER_LETTER', 'MARKSHEET', 'DEGREE_CERTIFICATE', 'BONAFIDE_CERTIFICATE'], 'institution');
  profile.education.course = findFieldValue(['ADMISSION_LETTER', 'OFFER_LETTER', 'MARKSHEET', 'DEGREE_CERTIFICATE'], 'course');
  profile.education.qualification = findFieldValue(['MARKSHEET', 'DEGREE_CERTIFICATE'], 'qualification');
  profile.education.percentage = findFieldValue(['MARKSHEET'], 'percentage');

  // Populate Financial
  profile.financial.annualIncome = findFieldValue(['INCOME_CERTIFICATE'], 'annualIncome');

  // Populate Bank
  profile.bank.bankName = findFieldValue(['BANK_PASSBOOK'], 'bankName');
  profile.bank.accountHolderName = findFieldValue(['BANK_PASSBOOK'], 'accountHolderName') || profile.applicant.fullName;
  profile.bank.accountNumberMasked = findFieldValue(['BANK_PASSBOOK'], 'accountNumberMasked');
  profile.bank.ifsc = findFieldValue(['BANK_PASSBOOK'], 'ifsc');

  // Document Summary
  profile.documents = documents.map(d => ({
    documentType: d.documentType,
    filename: d.filename,
    quality: d.quality,
    qualityScore: d.qualityScore,
    confidence: d.confidence
  }));

  return profile;
}
