/**
 * Structured Applicant Profile Generator
 * 
 * Aggregates and normalizes extracted data from all analyzed documents
 * into a unified profile adhering to Section 16 requirements.
 * 
 * Includes the best-supported value with source document and confidence.
 */

export function generateApplicantProfile(documents = []) {
  // Helper to extract value, source filename, and confidence
  function findFieldEntry(preferredTypes, fieldKeys) {
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

    // 1. Try preferred document types first
    for (const type of preferredTypes) {
      const doc = documents.find(d => d.documentType === type);
      if (doc && doc.fields) {
        for (const k of keys) {
          const val = getVal(doc.fields, k);
          if (val !== null) {
            const fc = doc.fieldConfidence?.[k];
            return {
              value: val,
              source: doc.filename || doc.documentType,
              confidence: fc && fc.confidence ? fc.confidence : doc.confidence || 0.90
            };
          }
        }
      }
    }

    // 2. Fallback to any document that has this field
    for (const doc of documents) {
      if (doc && doc.fields) {
        for (const k of keys) {
          const val = getVal(doc.fields, k);
          if (val !== null) {
            const fc = doc.fieldConfidence?.[k];
            return {
              value: val,
              source: doc.filename || doc.documentType,
              confidence: fc && fc.confidence ? fc.confidence : doc.confidence || 0.85
            };
          }
        }
      }
    }

    return {
      value: null,
      source: null,
      confidence: 0.0
    };
  }

  // Section 16 Top-Level Profile Attributes
  const fullNameEntry = findFieldEntry(
    ['AADHAAR', 'ST_CERTIFICATE', 'PVTG_CERTIFICATE', 'MARKSHEET', 'BANK_PASSBOOK', 'DOMICILE_CERTIFICATE'],
    ['fullName', 'name', 'studentName', 'applicantName']
  );

  const dobEntry = findFieldEntry(['AADHAAR', 'MARKSHEET'], ['dateOfBirth', 'dob']);
  const categoryEntry = findFieldEntry(['ST_CERTIFICATE', 'PVTG_CERTIFICATE'], ['category']);
  const tribeNameEntry = findFieldEntry(['ST_CERTIFICATE', 'PVTG_CERTIFICATE'], ['tribeName']);
  const domicileEntry = findFieldEntry(
    ['DOMICILE_CERTIFICATE', 'AADHAAR', 'ST_CERTIFICATE'],
    ['domicileState', 'state', 'address']
  );
  const institutionEntry = findFieldEntry(
    ['ADMISSION_LETTER', 'OFFER_LETTER', 'MARKSHEET', 'DEGREE_CERTIFICATE', 'BONAFIDE_CERTIFICATE'],
    ['institution', 'university']
  );
  const courseEntry = findFieldEntry(
    ['ADMISSION_LETTER', 'OFFER_LETTER', 'MARKSHEET', 'DEGREE_CERTIFICATE', 'BONAFIDE_CERTIFICATE'],
    ['course', 'degree', 'courseOrClass', 'programme']
  );
  const qualificationEntry = findFieldEntry(
    ['MARKSHEET', 'DEGREE_CERTIFICATE'],
    ['qualification', 'examination', 'degree']
  );
  const incomeEntry = findFieldEntry(['INCOME_CERTIFICATE'], ['annualIncome']);
  const classEntry = findFieldEntry(['MARKSHEET', 'BONAFIDE_CERTIFICATE'], ['class', 'courseOrClass']);
  const percentageEntry = findFieldEntry(['MARKSHEET', 'DEGREE_CERTIFICATE'], ['percentage']);
  const genderEntry = findFieldEntry(['AADHAAR'], ['gender']);
  const bankNameEntry = findFieldEntry(['BANK_PASSBOOK'], ['bankName']);
  const ifscEntry = findFieldEntry(['BANK_PASSBOOK'], ['ifsc', 'IFSC']);
  const accMaskedEntry = findFieldEntry(['BANK_PASSBOOK'], ['maskedAccountNumber', 'accountNumberMasked', 'accountNumber']);

  return {
    // Section 16 exact attributes
    fullName: fullNameEntry,
    dateOfBirth: dobEntry,
    category: categoryEntry,
    tribeName: tribeNameEntry,
    domicileState: domicileEntry,
    institution: institutionEntry,
    course: courseEntry,
    qualification: qualificationEntry,
    annualIncome: incomeEntry,

    // Nested structures for full backwards compatibility
    applicant: {
      fullName: fullNameEntry.value,
      dateOfBirth: dobEntry.value,
      gender: genderEntry.value,
      category: categoryEntry.value,
      tribeName: tribeNameEntry.value,
      domicileState: domicileEntry.value
    },
    education: {
      class: classEntry.value,
      institution: institutionEntry.value,
      course: courseEntry.value,
      qualification: qualificationEntry.value,
      percentage: percentageEntry.value
    },
    financial: {
      annualIncome: incomeEntry.value
    },
    bank: {
      bankName: bankNameEntry.value,
      accountHolderName: fullNameEntry.value,
      accountNumberMasked: accMaskedEntry.value,
      ifsc: ifscEntry.value
    },

    // Document Summary
    documents: documents.map(d => ({
      documentType: d.documentType,
      filename: d.filename,
      quality: d.quality,
      qualityScore: d.qualityScore,
      confidence: d.confidence
    }))
  };
}
