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

  // Helper priority getter: returns first non-null value from given document types, checking field aliases
  function findFieldValue(preferredTypes, fieldKeys) {
    const keys = Array.isArray(fieldKeys) ? fieldKeys : [fieldKeys];

    const getVal = (fields, k) => {
      if (!fields || fields[k] === null || fields[k] === undefined) return null;
      let raw = fields[k];
      if (typeof raw === 'object' && raw.value !== undefined) {
        raw = raw.value;
      }
      if (raw === null || raw === undefined) return null;
      const s = String(raw).trim();
      return s.length > 0 ? s : null;
    };

    for (const type of preferredTypes) {
      const doc = documents.find(d => d.documentType === type);
      if (doc && doc.fields) {
        for (const k of keys) {
          const val = getVal(doc.fields, k);
          if (val !== null) return val;
        }
      }
    }

    // Fallback to any document that has any of these field keys
    for (const doc of documents) {
      if (doc && doc.fields) {
        for (const k of keys) {
          const val = getVal(doc.fields, k);
          if (val !== null) return val;
        }
      }
    }
    return null;
  }

  // Populate Applicant
  profile.applicant.fullName = findFieldValue(
    ['AADHAAR', 'ST_CERTIFICATE', 'PVTG_CERTIFICATE', 'MARKSHEET', 'BANK_PASSBOOK', 'DOMICILE_CERTIFICATE'],
    ['fullName', 'name', 'studentName', 'applicantName']
  );
  profile.applicant.dateOfBirth = findFieldValue(['AADHAAR', 'MARKSHEET'], ['dateOfBirth', 'dob']);
  profile.applicant.gender = findFieldValue(['AADHAAR'], ['gender']);
  profile.applicant.category = findFieldValue(['ST_CERTIFICATE', 'PVTG_CERTIFICATE'], ['category']);
  profile.applicant.tribeName = findFieldValue(['ST_CERTIFICATE', 'PVTG_CERTIFICATE'], ['tribeName']);
  profile.applicant.domicileState = findFieldValue(
    ['DOMICILE_CERTIFICATE', 'AADHAAR', 'ST_CERTIFICATE'],
    ['domicileState', 'state']
  );

  // Populate Education
  profile.education.class = findFieldValue(
    ['MARKSHEET', 'BONAFIDE_CERTIFICATE', 'ADMISSION_LETTER'],
    ['class', 'courseOrClass']
  );
  profile.education.institution = findFieldValue(
    ['ADMISSION_LETTER', 'OFFER_LETTER', 'MARKSHEET', 'DEGREE_CERTIFICATE', 'BONAFIDE_CERTIFICATE'],
    ['institution', 'university']
  );
  profile.education.course = findFieldValue(
    ['ADMISSION_LETTER', 'OFFER_LETTER', 'MARKSHEET', 'DEGREE_CERTIFICATE', 'BONAFIDE_CERTIFICATE'],
    ['course', 'degree', 'courseOrClass']
  );
  profile.education.qualification = findFieldValue(
    ['MARKSHEET', 'DEGREE_CERTIFICATE'],
    ['qualification', 'examination', 'degree']
  );
  profile.education.percentage = findFieldValue(['MARKSHEET'], ['percentage']);

  // Populate Financial
  profile.financial.annualIncome = findFieldValue(['INCOME_CERTIFICATE'], ['annualIncome']);

  // Populate Bank
  profile.bank.bankName = findFieldValue(['BANK_PASSBOOK'], ['bankName']);
  profile.bank.accountHolderName = findFieldValue(['BANK_PASSBOOK'], ['accountHolderName', 'name']) || profile.applicant.fullName;
  profile.bank.accountNumberMasked = findFieldValue(['BANK_PASSBOOK'], ['accountNumberMasked', 'maskedAccountNumber']);
  profile.bank.ifsc = findFieldValue(['BANK_PASSBOOK'], ['ifsc', 'IFSC']);

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
