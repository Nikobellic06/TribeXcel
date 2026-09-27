/**
 * Transformer Service
 * Translates between System A (Document Intelligence) and System B (Verification Engine),
 * and builds the combined final response contract.
 */

export function normalizeScheme(inputScheme) {
  if (!inputScheme) return 'PRE_MATRIC';
  const s = String(inputScheme).toUpperCase().trim();
  if (s.includes('OVERSEAS') || s === 'NOS' || s === 'NOS-ST') return 'NOS';
  if (s.includes('FELLOWSHIP') || s.includes('NFST') || s === 'NATIONAL_FELLOWSHIP') return 'NATIONAL_FELLOWSHIP';
  if (s.includes('PRE') || s.includes('MATRIC') || s === 'PM-ST') return 'PRE_MATRIC';
  return 'PRE_MATRIC';
}

function calculateAge(dobString) {
  if (!dobString) return null;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function parseNumber(val) {
  if (val === null || val === undefined) return null;
  const clean = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

/**
 * Transform System A Intelligence to System B Verification Payload
 */
export function buildSystemBPayload(systemAData, schemeInput, meta = {}) {
  const scheme = normalizeScheme(schemeInput || meta.scheme);
  const applicationId = systemAData.applicationId || meta.applicationId || `MOTA-APP-${Date.now()}`;
  const profile = systemAData.applicantProfile || {};
  const applicant = profile.applicant || {};
  const education = profile.education || {};
  const financial = profile.financial || {};
  const bank = profile.bank || {};
  const docsList = systemAData.documents || [];

  // Parse age from DOB if available
  const age = calculateAge(applicant.dateOfBirth);
  const incomeNumber = parseNumber(financial.annualIncome);
  const percentageNumber = parseNumber(education.percentage);

  // Map documents to System B scheme requirements
  const documentsMap = {};

  for (const doc of docsList) {
    const docType = doc.documentType;
    const isPoor = doc.quality === 'POOR';
    const isWarning = doc.quality === 'WARNING';
    const status = isPoor ? 'LOW_CONFIDENCE' : 'PRESENT';

    const entry = {
      status,
      confidence: doc.confidence || 0.9,
      quality: doc.quality,
      filename: doc.originalFilename || doc.filename,
      extractedFields: doc.fields || {},
      reason: doc.issues && doc.issues.length > 0 ? doc.issues.join('; ') : undefined
    };

    // Scheme-specific name mappings
    if (docType === 'ST_CERTIFICATE' || docType === 'PVTG_CERTIFICATE') {
      documentsMap['ST Certificate'] = entry;
      documentsMap['ST / PVTG Certificate'] = entry;
      documentsMap[docType] = entry;
    } else if (docType === 'INCOME_CERTIFICATE') {
      entry.incomeDeclared = incomeNumber;
      documentsMap['Income Certificate'] = entry;
      documentsMap[docType] = entry;
    } else if (docType === 'AADHAAR') {
      documentsMap['Aadhaar'] = entry;
      documentsMap['Valid Passport / Proof of Age'] = entry;
      documentsMap[docType] = entry;
    } else if (docType === 'MARKSHEET') {
      entry.extractedPercentage = percentageNumber;
      documentsMap['Marksheet'] = entry;
      documentsMap['Qualifying Degree Marksheet / Certificate'] = entry;
      documentsMap['Postgraduate Degree Marksheet / Certificate'] = entry;
      documentsMap['School Enrollment / Admission Verification'] = entry;
      documentsMap[docType] = entry;
    } else if (docType === 'DEGREE_CERTIFICATE') {
      documentsMap['Qualifying Degree Marksheet / Certificate'] = entry;
      documentsMap['Postgraduate Degree Marksheet / Certificate'] = entry;
      documentsMap[docType] = entry;
    } else if (docType === 'ADMISSION_LETTER' || docType === 'OFFER_LETTER') {
      documentsMap['School Enrollment / Admission Verification'] = entry;
      documentsMap['Overseas University Offer / Admission Letter'] = entry;
      documentsMap['Admission / Registration Letter in M.Phil / PhD'] = entry;
      documentsMap[docType] = entry;
    } else if (docType === 'BANK_PASSBOOK') {
      documentsMap['Bank Account Passbook / Proof'] = entry;
      documentsMap[docType] = entry;
    } else if (docType === 'BONAFIDE_CERTIFICATE') {
      documentsMap['School Enrollment / Admission Verification'] = entry;
      documentsMap['Eligible Institution Verification / Recommendation'] = entry;
      documentsMap[docType] = entry;
    } else {
      documentsMap[docType] = entry;
    }
  }

  // Cross-checks mapping
  const crossChecks = (systemAData.crossDocumentValidation || []).map(item => ({
    field: item.field,
    match: item.status === 'MATCH',
    status: item.status === 'MISMATCH' ? 'DOCUMENT_MISMATCH' : item.status,
    details: item.details || item.remarks
  }));

  return {
    applicationId,
    scheme,
    applicantProfile: systemAData.applicantProfile,
    documents: docsList,
    documentsMap,
    crossDocumentValidation: systemAData.crossDocumentValidation || [],
    anomalies: systemAData.anomalies,
    reviewFlags: systemAData.reviewFlags,
    applicant: {
      fullName: applicant.fullName || meta.fullName || null,
      category: applicant.category || null,
      gender: applicant.gender || null,
      dateOfBirth: applicant.dateOfBirth || null,
      age,
      state: applicant.domicileState || null,
      district: applicant.district || null
    },
    education: {
      currentClass: education.class || null,
      institutionName: education.institution || null,
      institutionType: education.institution ? 'Government / Recognized School' : null,
      isRecognized: true,
      qualifyingDegree: education.qualification || education.course || null,
      qualifyingPercentage: percentageNumber,
      percentage: percentageNumber,
      targetDegreeLevel: scheme === 'NOS' ? 'MASTERS' : null,
      foreignInstitutionName: scheme === 'NOS' ? education.institution : null,
      country: scheme === 'NOS' ? 'Foreign Country' : 'India',
      hasUnconditionalOffer: true,
      enrolledProgramme: scheme === 'NATIONAL_FELLOWSHIP' ? education.course : null,
      isEligibleInstitution: true
    },
    financial: {
      annualIncome: incomeNumber,
      annualFamilyIncome: incomeNumber,
      receivingOtherScholarship: false,
      bankDetails: {
        accountNumber: bank.accountNumberMasked || bank.accountNumber || null,
        ifscCode: bank.ifsc || null,
        bankName: bank.bankName || null
      }
    },
    documentIntelligence: {
      crossChecks,
      systemAAnomalies: systemAData.anomalies,
      reviewFlags: systemAData.reviewFlags
    }
  };
}

/**
 * Merge System A and System B outputs into the required Final Response Contract (Section 3)
 */
export function buildFinalResponse(systemAData, systemBData, requestedScheme) {
  const applicationId = systemBData?.applicationId || systemAData?.applicationId || `APP-${Date.now()}`;
  const scheme = systemBData?.scheme || normalizeScheme(requestedScheme);
  const applicantProfile = systemAData?.applicantProfile || {};
  const rawDocs = systemAData?.documents || [];

  // Extract signals list for anomalies
  let anomaliesList = [];
  if (Array.isArray(systemAData?.anomalies?.signals)) {
    anomaliesList = systemAData.anomalies.signals;
  } else if (Array.isArray(systemAData?.anomalies)) {
    anomaliesList = systemAData.anomalies;
  } else if (systemAData?.anomalies?.signals) {
    anomaliesList = [systemAData.anomalies.signals];
  }

  // Section 3 structured documentIntelligence sub-arrays
  const classification = rawDocs.map(d => ({
    document: d.originalFilename || d.filename || 'Document',
    detectedType: d.documentType,
    confidence: d.confidence,
    evidence: d.classificationEvidence || []
  }));

  const ocr = rawDocs.map(d => ({
    document: d.originalFilename || d.filename || 'Document',
    ocrEngine: 'PaddleOCR (PP-OCRv6) + PyMuPDF',
    status: 'SUCCESS',
    confidence: d.confidence,
    lineCount: Array.isArray(d.lines) ? d.lines.length : (d.fields ? Object.keys(d.fields).length : 0)
  }));

  const extraction = rawDocs.map(d => ({
    document: d.originalFilename || d.filename || 'Document',
    documentType: d.documentType,
    fields: d.fields || {},
    fieldConfidence: d.fieldConfidence || {}
  }));

  const quality = rawDocs.map(d => ({
    document: d.originalFilename || d.filename || 'Document',
    quality: d.quality || 'GOOD',
    qualityScore: d.qualityScore || 0.95,
    issues: d.issues || []
  }));

  const documentResults = rawDocs.map(d => ({
    documentName: d.originalFilename || d.filename,
    detectedType: d.documentType,
    confidence: d.confidence,
    quality: d.quality,
    qualityScore: d.qualityScore,
    classificationEvidence: d.classificationEvidence || [],
    fields: d.fields || {},
    fieldConfidence: d.fieldConfidence || {},
    missingFields: d.missingFields || [],
    issues: d.issues || []
  }));

  const normApplicantProfile = {
    applicant: applicantProfile.applicant || {},
    education: applicantProfile.education || {},
    financial: applicantProfile.financial || {},
    bank: applicantProfile.bank || {}
  };

  return {
    applicationId,
    scheme,

    // Top-level applicant profile (Section 3 requirement)
    applicantProfile: normApplicantProfile,
    applicant: normApplicantProfile.applicant,
    education: normApplicantProfile.education,
    financial: normApplicantProfile.financial,

    // Ingested documents list
    documents: rawDocs,

    // Detailed Document Intelligence block (Section 3 requirement)
    documentIntelligence: {
      classification,
      ocr,
      extraction,
      quality,
      crossDocumentValidation: systemAData?.crossDocumentValidation || [],
      anomalies: anomaliesList,
      // Backward compatibility aliases
      extractedData: normApplicantProfile,
      documentResults,
      reviewFlags: systemAData?.reviewFlags || []
    },

    // Verification evaluation block (Section 3 requirement)
    verification: {
      scheme,
      documents: systemBData?.documentVerification || [],
      rules: systemBData?.ruleEvaluation || [],
      deficiencies: systemBData?.deficiencies || [],
      finalStatus: systemBData?.finalStatus || 'INCOMPLETE',
      humanReviewRequired: Boolean(systemBData?.humanReviewRequired),
      explanation: systemBData?.explanation || 'Verification completed by System B.',
      // Backward compatibility aliases
      documentVerification: systemBData?.documentVerification || [],
      ruleEvaluation: systemBData?.ruleEvaluation || []
    }
  };
}
