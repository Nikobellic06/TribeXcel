const { SCHEMES } = require('../data/schemes');
const { adaptApplication } = require('./inputAdapter');

const REQUIRED_DOC_MAP = {
  "ST Certificate": ["ST_CERTIFICATE", "PVTG_CERTIFICATE"],
  "ST / PVTG Certificate": ["ST_CERTIFICATE", "PVTG_CERTIFICATE"],
  "Income Certificate": ["INCOME_CERTIFICATE"],
  "School Enrollment / Admission Verification": [
    "MARKSHEET", "ADMISSION_LETTER", "BONAFIDE_CERTIFICATE", "COLLEGE_ID", "STUDENT_ID", "FEE_RECEIPT"
  ],
  "Bank Account Passbook / Proof": [
    "BANK_PASSBOOK", "CANCELLED_CHEQUE", "BANK_STATEMENT"
  ],
  "Qualifying Degree Marksheet / Certificate": [
    "MARKSHEET", "DEGREE_CERTIFICATE", "PROVISIONAL_CERTIFICATE", "PG_DEGREE_CERTIFICATE"
  ],
  "Postgraduate Degree Marksheet / Certificate": [
    "MARKSHEET", "DEGREE_CERTIFICATE", "PG_DEGREE_CERTIFICATE"
  ],
  "Overseas University Offer / Admission Letter": [
    "OFFER_LETTER", "ADMISSION_LETTER", "OVERSEAS_OFFER"
  ],
  "Admission / Registration Letter in M.Phil / PhD": [
    "ADMISSION_LETTER", "BONAFIDE_CERTIFICATE", "REGISTRATION_LETTER"
  ],
  "Eligible Institution Verification / Recommendation": [
    "BONAFIDE_CERTIFICATE", "ADMISSION_LETTER", "RECOMMENDATION_LETTER", "INSTITUTION_VERIFICATION"
  ],
  "Valid Passport / Proof of Age": [
    "PASSPORT", "AADHAAR", "BIRTH_CERTIFICATE", "VOTER_ID"
  ],
  "Domicile Certificate": [
    "DOMICILE_CERTIFICATE", "RESIDENCE_CERTIFICATE"
  ]
};

/**
 * System B Document Verifier
 * Evaluates REAL document intelligence produced by System A.
 * Does NOT perform duplicate OCR.
 *
 * Allowed Document Statuses:
 * PRESENT, MISSING, INVALID, LOW_CONFIDENCE, NOT_APPLICABLE, REQUIRES_HUMAN_REVIEW
 */
function verifyDocuments(schemeKey, application) {
  const scheme = SCHEMES[schemeKey] || SCHEMES[application.scheme] || SCHEMES.PRE_MATRIC;
  if (!scheme) {
    return {
      documentVerification: [],
      documentDeficiencies: [
        {
          type: "RULE_FAILURE",
          field: "scheme",
          reason: `Unknown scheme: ${schemeKey || application.scheme}`
        }
      ]
    };
  }

  const adapted = adaptApplication(application);
  const requiredDocs = scheme.requiredDocuments || [];
  const documentsList = adapted.documentsList || [];
  const documentsMap = adapted.documentsMap || {};
  const crossChecks = adapted.crossDocumentValidation || [];

  const documentVerification = [];
  const documentDeficiencies = [];

  // Matcher for required document in System A extracted documents
  const findMatchingDoc = (reqName) => {
    // 1. Check legacy/direct map by key
    if (documentsMap[reqName]) return documentsMap[reqName];

    const targetTypes = REQUIRED_DOC_MAP[reqName] || [];
    const normReq = reqName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 2. Check in documentsList by documentType
    for (const doc of documentsList) {
      const type = (doc.documentType || '').toUpperCase();
      if (targetTypes.includes(type)) {
        return doc;
      }
      const normType = type.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normReq === normType || normReq.includes(normType) || normType.includes(normReq)) {
        return doc;
      }
    }

    // 3. Normalized search in documentsMap
    for (const [k, v] of Object.entries(documentsMap)) {
      const normKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normReq === normKey || normReq.includes(normKey) || normKey.includes(normReq)) {
        return v;
      }
    }

    return null;
  };

  // Helper to check if a document has cross-document conflict
  const hasDocConflict = (doc) => {
    if (!doc || !crossChecks.length) return null;
    const docName = (doc.originalFilename || doc.name || doc.filename || '').toLowerCase();
    const docType = (doc.documentType || '').toUpperCase();

    for (const check of crossChecks) {
      if (check.status === 'MISMATCH' || check.match === false) {
        // If values list mentions this document or if field is relevant to document
        const mentionsDoc = Array.isArray(check.values) && check.values.some(v => 
          (v.document || '').toLowerCase().includes(docName) || docName.includes((v.document || '').toLowerCase())
        );
        const relevantField = (
          (docType === 'AADHAAR' && (check.field === 'dateOfBirth' || check.field === 'fullName')) ||
          (docType === 'MARKSHEET' && (check.field === 'dateOfBirth' || check.field === 'fullName' || check.field === 'studentName')) ||
          (docType === 'ST_CERTIFICATE' && (check.field === 'fullName' || check.field === 'category')) ||
          (docType === 'INCOME_CERTIFICATE' && (check.field === 'fullName' || check.field === 'annualIncome'))
        );

        if (mentionsDoc || relevantField) {
          return check;
        }
      }
    }
    return null;
  };

  // Evaluate each required document
  for (const docName of requiredDocs) {
    const doc = findMatchingDoc(docName);

    if (!doc) {
      documentVerification.push({
        document: docName,
        status: "MISSING",
        reason: `Mandatory document "${docName}" has not been submitted or detected.`
      });
      documentDeficiencies.push({
        type: "MISSING_DOCUMENT",
        field: docName,
        reason: `Required document "${docName}" is missing from the application.`
      });
      continue;
    }

    // Explicitly not applicable
    if (doc.status === "NOT_APPLICABLE" || doc.notApplicable === true) {
      documentVerification.push({
        document: docName,
        status: "NOT_APPLICABLE",
        reason: doc.reason || `Document "${docName}" is not applicable for this applicant category.`
      });
      continue;
    }

    // Invalid / Tamper checks
    if (doc.isValid === false || doc.status === "INVALID") {
      documentVerification.push({
        document: docName,
        status: "INVALID",
        reason: doc.reason || `Submitted "${docName}" failed authority/tamper validation checks.`
      });
      documentDeficiencies.push({
        type: "HUMAN_VERIFICATION_REQUIRED",
        field: docName,
        reason: `Document "${docName}" marked as invalid: ${doc.reason || "Validation failed"}`
      });
      continue;
    }

    // Cross-document conflict check
    const conflict = hasDocConflict(doc);
    if (conflict) {
      documentVerification.push({
        document: docName,
        status: "REQUIRES_HUMAN_REVIEW",
        reason: conflict.details || conflict.reason || `Discrepancy detected across submitted documents for ${conflict.field || 'information'}. Manual verification required.`
      });
      continue;
    }

    // Scan Quality / Confidence check
    const confidence = typeof doc.confidence === 'number'
      ? doc.confidence
      : typeof doc.ocrConfidence === 'number'
        ? doc.ocrConfidence
        : 1.0;

    const isPoorQuality = doc.quality === 'POOR' || doc.qualityScore < 0.60;

    if (confidence < 0.65 || doc.status === "LOW_CONFIDENCE" || isPoorQuality) {
      documentVerification.push({
        document: docName,
        status: "LOW_CONFIDENCE",
        reason: `System A document scan confidence is low (${Math.round(confidence * 100)}%). Manual scrutiny required.`
      });
      documentDeficiencies.push({
        type: "LOW_CONFIDENCE_DOCUMENT",
        field: docName,
        reason: `OCR quality score for "${docName}" is ${Math.round(confidence * 100)}% (threshold: 65%).`
      });
      continue;
    }

    // Flagged for human review
    if (doc.status === "REQUIRES_HUMAN_REVIEW" || doc.requiresHumanReview) {
      documentVerification.push({
        document: docName,
        status: "REQUIRES_HUMAN_REVIEW",
        reason: doc.reason || `Ambiguity in document "${docName}". Officer scrutiny needed.`
      });
      documentDeficiencies.push({
        type: "HUMAN_VERIFICATION_REQUIRED",
        field: docName,
        reason: `Document "${docName}" requires authorized officer review: ${doc.reason || 'Verification flag'}`
      });
      continue;
    }

    // Document is present and verified
    const sourceInfo = doc.source === 'digilocker'
      ? "Digitally verified via DigiLocker partner source."
      : "Verified through System A document intelligence.";

    documentVerification.push({
      document: docName,
      status: "PRESENT",
      reason: doc.reason || `${docName} is present. ${sourceInfo}`
    });
  }

  // Cross-document consistency deficiencies
  for (const check of crossChecks) {
    if (check.match === false || check.status === "MISMATCH" || check.status === "DOCUMENT_MISMATCH") {
      documentDeficiencies.push({
        type: "DOCUMENT_MISMATCH",
        field: check.field || "documentConsistency",
        reason: check.details || check.reason || `Discrepancy detected across submitted documents for ${check.field || 'applicant information'}.`
      });
    }
  }

  // Check for unknown or unrelated documents in submission
  for (const doc of documentsList) {
    if (doc.documentType === 'UNKNOWN' || (typeof doc.confidence === 'number' && doc.confidence < 0.30)) {
      documentDeficiencies.push({
        type: "HUMAN_VERIFICATION_REQUIRED",
        field: doc.originalFilename || doc.name || "unrelatedDocument",
        reason: `Unrecognized document type detected ("${doc.originalFilename || doc.name || 'uploaded file'}"). Requires manual officer verification.`
      });
    }
  }

  return {
    documentVerification,
    documentDeficiencies
  };
}

module.exports = {
  verifyDocuments,
  REQUIRED_DOC_MAP
};
