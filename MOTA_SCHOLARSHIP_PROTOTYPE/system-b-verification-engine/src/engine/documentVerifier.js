const { SCHEMES } = require('../data/schemes');

/**
 * System B Document Verifier
 * Consumes pre-extracted document intelligence from System A.
 * Does NOT perform duplicate OCR.
 *
 * Allowed Document Statuses:
 * PRESENT, MISSING, INVALID, LOW_CONFIDENCE, NOT_APPLICABLE, REQUIRES_HUMAN_REVIEW
 */
function verifyDocuments(schemeKey, application) {
  const scheme = SCHEMES[schemeKey] || SCHEMES[application.scheme];
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

  const requiredDocs = scheme.requiredDocuments || [];
  const submittedDocs = application.documents || {};
  const docIntelligence = application.documentIntelligence || {};

  const documentVerification = [];
  const documentDeficiencies = [];

  // Helper to find document entry flexibly (case-insensitive & fuzzy key check)
  const findDocEntry = (docName) => {
    // 1. Direct key match in documentIntelligence
    if (docIntelligence[docName]) return docIntelligence[docName];

    // 2. Direct key match in application.documents
    if (submittedDocs[docName]) return submittedDocs[docName];

    // 3. Normalized search in documentIntelligence
    const norm = docName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [k, v] of Object.entries(docIntelligence)) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) return v;
      if (norm.includes(k.toLowerCase().replace(/[^a-z0-9]/g, ''))) return v;
    }

    // 4. Normalized search in documents
    for (const [k, v] of Object.entries(submittedDocs)) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) return v;
      if (norm.includes(k.toLowerCase().replace(/[^a-z0-9]/g, ''))) return v;
    }

    // 5. If documents is an array of objects [{ name, source, status, ... }]
    if (Array.isArray(submittedDocs)) {
      const found = submittedDocs.find(
        (d) => (d.name || d.document || '').toLowerCase().includes(docName.toLowerCase().slice(0, 8))
      );
      if (found) return found;
    }

    return null;
  };

  for (const docName of requiredDocs) {
    const docEntry = findDocEntry(docName);

    if (!docEntry) {
      documentVerification.push({
        document: docName,
        status: "MISSING",
        reason: `Mandatory document "${docName}" has not been submitted.`
      });
      documentDeficiencies.push({
        type: "MISSING_DOCUMENT",
        field: docName,
        reason: `Required document "${docName}" is missing from the application.`
      });
      continue;
    }

    // Check if explicitly marked not applicable
    if (docEntry.status === "NOT_APPLICABLE" || docEntry.notApplicable === true) {
      documentVerification.push({
        document: docName,
        status: "NOT_APPLICABLE",
        reason: docEntry.reason || `Document "${docName}" is not applicable for this applicant category.`
      });
      continue;
    }

    // Check validity
    if (docEntry.isValid === false || docEntry.status === "INVALID") {
      documentVerification.push({
        document: docName,
        status: "INVALID",
        reason: docEntry.reason || `Submitted "${docName}" failed authority/tamper validation checks.`
      });
      documentDeficiencies.push({
        type: "HUMAN_VERIFICATION_REQUIRED",
        field: docName,
        reason: `Document "${docName}" marked as invalid: ${docEntry.reason || "Validation failed"}`
      });
      continue;
    }

    // Check confidence from System A OCR/intelligence
    const confidence = typeof docEntry.confidence === 'number'
      ? docEntry.confidence
      : typeof docEntry.ocrConfidence === 'number'
        ? docEntry.ocrConfidence
        : 1.0;

    if (confidence < 0.65 || docEntry.status === "LOW_CONFIDENCE") {
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

    // Check if flagged for human officer review
    if (docEntry.status === "REQUIRES_HUMAN_REVIEW" || docEntry.requiresHumanReview) {
      documentVerification.push({
        document: docName,
        status: "REQUIRES_HUMAN_REVIEW",
        reason: docEntry.reason || `Ambiguity in document "${docName}". Officer scrutiny needed.`
      });
      documentDeficiencies.push({
        type: "HUMAN_VERIFICATION_REQUIRED",
        field: docName,
        reason: `Document "${docName}" requires authorized officer review: ${docEntry.reason || 'Verification flag'}`
      });
      continue;
    }

    // Document is present and sufficiently verified by System A
    const sourceInfo = docEntry.source === 'digilocker'
      ? "Digitally verified via DigiLocker partner source."
      : "Verified through System A document intelligence.";

    documentVerification.push({
      document: docName,
      status: "PRESENT",
      reason: docEntry.reason || `${docName} is present. ${sourceInfo}`
    });
  }

  // Cross-document consistency checks (System A intelligence cross-checks)
  const crossChecks = docIntelligence.crossChecks || application.crossChecks || [];
  for (const check of crossChecks) {
    if (check.match === false || check.status === "MISMATCH" || check.status === "DOCUMENT_MISMATCH") {
      documentDeficiencies.push({
        type: "DOCUMENT_MISMATCH",
        field: check.field || "documentConsistency",
        reason: check.details || check.reason || `Discrepancy detected across submitted documents for ${check.field || 'applicant information'}.`
      });
    }
  }

  return {
    documentVerification,
    documentDeficiencies
  };
}

module.exports = { verifyDocuments };
