const { SCHEMES } = require('../data/schemes');
const { verifyDocuments } = require('./documentVerifier');
const { detectDeficiencies } = require('./deficiencyDetector');
const { buildExplanation } = require('./explanationBuilder');
const { evaluatePreMatricRules } = require('./rules/preMatricRules');
const { evaluateNosRules } = require('./rules/nosRules');
const { evaluateNationalFellowshipRules } = require('./rules/nationalFellowshipRules');

/**
 * Normalizes scheme code or name to canonical key
 */
function normalizeSchemeKey(schemeInput) {
  if (!schemeInput) return "PRE_MATRIC";
  const s = String(schemeInput).toUpperCase().trim();
  if (s.includes("OVERSEAS") || s === "NOS" || s === "NOS-ST") return "NOS";
  if (s.includes("FELLOWSHIP") || s.includes("NFST") || s === "NATIONAL_FELLOWSHIP") return "NATIONAL_FELLOWSHIP";
  if (s.includes("PRE") || s.includes("MATRIC") || s === "PM-ST") return "PRE_MATRIC";
  return s;
}

/**
 * Main Verification Engine Entrypoint
 *
 * Input format:
 * {
 *   "applicationId": "",
 *   "scheme": "",
 *   "applicant": {},
 *   "education": {},
 *   "financial": {},
 *   "documents": {},
 *   "documentIntelligence": {}
 * }
 *
 * Output format:
 * {
 *   "applicationId": "",
 *   "scheme": "",
 *   "documentVerification": [],
 *   "ruleEvaluation": [],
 *   "deficiencies": [],
 *   "finalStatus": "",
 *   "explanation": "",
 *   "humanReviewRequired": false
 * }
 */
function verifyApplication(application) {
  const schemeKey = normalizeSchemeKey(application.scheme);
  const schemeDef = SCHEMES[schemeKey] || SCHEMES.PRE_MATRIC;
  const appId = application.applicationId || `APP-${Date.now().toString().slice(-6)}`;

  // 1. Verify Documents (Consuming System A document intelligence without duplicate OCR)
  const { documentVerification, documentDeficiencies } = verifyDocuments(schemeKey, application);

  // 2. Evaluate Scheme-Specific Rules
  let ruleEvaluation = [];
  if (schemeKey === "NOS") {
    ruleEvaluation = evaluateNosRules(application, documentVerification);
  } else if (schemeKey === "NATIONAL_FELLOWSHIP") {
    ruleEvaluation = evaluateNationalFellowshipRules(application, documentVerification);
  } else {
    ruleEvaluation = evaluatePreMatricRules(application, documentVerification);
  }

  // 3. Detect and Aggregate Deficiencies
  const deficiencies = detectDeficiencies(documentVerification, ruleEvaluation, documentDeficiencies);

  // 4. Determine Final Status (Section 9)
  // Allowed: ELIGIBLE, NOT_ELIGIBLE, INCOMPLETE, HUMAN_REVIEW
  const hasFails = ruleEvaluation.some((r) => r.status === "FAIL");
  const hasInsufficientData = ruleEvaluation.some((r) => r.status === "INSUFFICIENT_DATA");
  const hasMissingDocs = documentVerification.some((d) => d.status === "MISSING");
  const hasInvalidDocs = documentVerification.some((d) => d.status === "INVALID");
  const hasDocumentMismatches = deficiencies.some((d) => d.type === "DOCUMENT_MISMATCH");
  const hasLowConfidenceDocs = documentVerification.some((d) => d.status === "LOW_CONFIDENCE");
  const hasHumanReviewRules = ruleEvaluation.some((r) => r.status === "REQUIRES_HUMAN_REVIEW");

  let finalStatus = "ELIGIBLE";
  let humanReviewRequired = false;

  if (hasFails) {
    // Explicit mandatory criteria failure
    finalStatus = "NOT_ELIGIBLE";
  } else if (hasDocumentMismatches || hasLowConfidenceDocs || hasHumanReviewRules || hasInvalidDocs) {
    // Document inconsistencies or low scan confidence must NOT be auto-failed;
    // they require human review per Section 9.
    finalStatus = "HUMAN_REVIEW";
    humanReviewRequired = true;
  } else if (hasMissingDocs || hasInsufficientData) {
    // Required info/docs are missing and eligibility cannot yet be determined
    finalStatus = "INCOMPLETE";
  } else {
    // All mandatory criteria passed and docs verified
    finalStatus = "ELIGIBLE";
  }

  // Ensure humanReviewRequired is true for HUMAN_REVIEW status
  if (finalStatus === "HUMAN_REVIEW") {
    humanReviewRequired = true;
  }

  // 5. Build Explainable Markdown Summary
  const explanation = buildExplanation(
    finalStatus,
    ruleEvaluation,
    documentVerification,
    deficiencies,
    schemeDef.name
  );

  return {
    applicationId: appId,
    scheme: schemeKey,
    schemeName: schemeDef.name,
    documentVerification,
    ruleEvaluation,
    deficiencies,
    finalStatus,
    explanation,
    humanReviewRequired
  };
}

module.exports = {
  verifyApplication,
  normalizeSchemeKey
};
