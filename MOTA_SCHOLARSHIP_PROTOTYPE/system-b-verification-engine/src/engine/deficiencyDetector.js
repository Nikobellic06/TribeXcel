/**
 * System B Deficiency Detector
 *
 * Supported Types:
 * - MISSING_DOCUMENT
 * - LOW_CONFIDENCE_DOCUMENT
 * - DOCUMENT_MISMATCH
 * - ELIGIBILITY_INFORMATION_MISSING
 * - RULE_FAILURE
 * - HUMAN_VERIFICATION_REQUIRED
 */

function detectDeficiencies(documentVerification, ruleEvaluations, documentDeficiencies = []) {
  const deficiencies = [...documentDeficiencies];

  // 1. Process Rule Evaluations
  for (const rule of ruleEvaluations) {
    if (rule.status === "FAIL") {
      deficiencies.push({
        type: "RULE_FAILURE",
        field: rule.criterion,
        ruleId: rule.ruleId,
        reason: rule.reason
      });
    } else if (rule.status === "INSUFFICIENT_DATA") {
      deficiencies.push({
        type: "ELIGIBILITY_INFORMATION_MISSING",
        field: rule.criterion,
        ruleId: rule.ruleId,
        reason: rule.reason
      });
    } else if (rule.status === "REQUIRES_HUMAN_REVIEW") {
      deficiencies.push({
        type: "HUMAN_VERIFICATION_REQUIRED",
        field: rule.criterion,
        ruleId: rule.ruleId,
        reason: rule.reason
      });
    }
  }

  // Deduplicate deficiencies by type + field + reason
  const seen = new Set();
  const uniqueDeficiencies = [];

  for (const d of deficiencies) {
    const key = `${d.type}|${d.field}|${d.reason}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDeficiencies.push(d);
    }
  }

  return uniqueDeficiencies;
}

module.exports = { detectDeficiencies };
