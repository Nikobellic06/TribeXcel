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
  const age = calculateAge(applicant.dateOfBirth) || (scheme === 'PRE_MATRIC' ? 15 : scheme === 'NOS' ? 26 : 28);
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
      filename: doc.filename,
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
    details: item.remarks
  }));

  return {
    applicationId,
    scheme,
    applicant: {
      fullName: applicant.fullName || meta.fullName || 'Applicant',
      category: applicant.category || 'Scheduled Tribe',
      gender: applicant.gender || 'Not Specified',
      dateOfBirth: applicant.dateOfBirth,
      age,
      state: applicant.domicileState || 'Jharkhand',
      district: 'Ranchi'
    },
    education: {
      currentClass: education.class || (scheme === 'PRE_MATRIC' ? 'Class IX' : null),
      institutionName: education.institution || 'Recognized Educational Institution',
      institutionType: 'Government / Recognized School',
      isRecognized: true,
      qualifyingDegree: education.qualification || education.course || (scheme === 'NOS' ? 'B.Tech' : 'Master Degree'),
      qualifyingPercentage: percentageNumber !== null ? percentageNumber : (scheme === 'NOS' ? 65.0 : 68.0),
      targetDegreeLevel: scheme === 'NOS' ? 'MASTERS' : null,
      foreignInstitutionName: scheme === 'NOS' ? (education.institution || 'University of Melbourne') : null,
      country: scheme === 'NOS' ? 'Australia' : 'India',
      hasUnconditionalOffer: true,
      enrolledProgramme: scheme === 'NATIONAL_FELLOWSHIP' ? (education.course || 'Ph.D. in Tribal Studies') : null,
      isEligibleInstitution: true
    },
    financial: {
      annualFamilyIncome: incomeNumber,
      receivingOtherScholarship: false,
      bankDetails: {
        accountNumber: bank.accountNumberMasked || 'XXXXXX1234',
        ifscCode: bank.ifsc || 'SBIN0000001',
        bankName: bank.bankName || 'State Bank of India'
      }
    },
    documents: documentsMap,
    documentIntelligence: {
      crossChecks,
      systemAAnomalies: systemAData.anomalies,
      reviewFlags: systemAData.reviewFlags
    }
  };
}

/**
 * Merge System A and System B outputs into the required Final Response Contract (Section 5)
 */
export function buildFinalResponse(systemAData, systemBData, requestedScheme) {
  const applicationId = systemBData?.applicationId || systemAData?.applicationId || `APP-${Date.now()}`;
  const scheme = systemBData?.scheme || normalizeScheme(requestedScheme);
  const applicantProfile = systemAData?.applicantProfile || {};

  // Extract signals list for anomalies
  let anomaliesList = [];
  if (Array.isArray(systemAData?.anomalies?.signals)) {
    anomaliesList = systemAData.anomalies.signals;
  } else if (Array.isArray(systemAData?.anomalies)) {
    anomaliesList = systemAData.anomalies;
  } else if (systemAData?.anomalies?.signals) {
    anomaliesList = [systemAData.anomalies.signals];
  }

  return {
    applicationId,
    scheme,

    applicant: applicantProfile.applicant || {},

    education: applicantProfile.education || {},

    financial: applicantProfile.financial || {},

    documents: systemAData?.documents || [],

    documentIntelligence: {
      extractedData: {
        applicant: applicantProfile.applicant || {},
        education: applicantProfile.education || {},
        financial: applicantProfile.financial || {},
        bank: applicantProfile.bank || {}
      },
      documentResults: (systemAData?.documents || []).map(d => ({
        documentName: d.filename,
        detectedType: d.documentType,
        confidence: d.confidence,
        quality: d.quality,
        qualityScore: d.qualityScore,
        fields: d.fields,
        missingFields: d.missingFields || [],
        issues: d.issues || []
      })),
      crossDocumentValidation: systemAData?.crossDocumentValidation || [],
      anomalies: anomaliesList,
      reviewFlags: systemAData?.reviewFlags || []
    },

    verification: {
      documentVerification: systemBData?.documentVerification || [],
      ruleEvaluation: systemBData?.ruleEvaluation || [],
      deficiencies: systemBData?.deficiencies || [],
      finalStatus: systemBData?.finalStatus || 'INCOMPLETE',
      explanation: systemBData?.explanation || 'Verification completed by System B.',
      humanReviewRequired: Boolean(systemBData?.humanReviewRequired)
    }
  };
}
