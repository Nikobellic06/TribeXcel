/**
 * Explainability Engine for MoTA Verification
 *
 * Produces structured, human-readable explanations detailing:
 * - What passed (✓)
 * - What failed (✗)
 * - What information/document is missing (?)
 * - Why human review is needed (⚠)
 * - Documents status breakdown (📄)
 * - Decision Boundary statement (Non-autonomous AI disclaimer)
 */

function buildExplanation(finalStatus, ruleEvaluations, documentVerification, deficiencies, schemeName) {
  const lines = [];

  lines.push(`### AI-Assisted Verification Summary for ${schemeName || 'MoTA Scheme'}`);
  lines.push(`**Overall Assessment Status:** \`${finalStatus}\``);
  lines.push("");

  // Documents Status Breakdown
  if (Array.isArray(documentVerification) && documentVerification.length > 0) {
    lines.push("#### 📄 Document Requirements Status:");
    for (const d of documentVerification) {
      const icon = d.status === "PRESENT" ? "✓" : (d.status === "MISSING" ? "✗" : "⚠");
      lines.push(`- **${d.document}**: \`${d.status}\` — ${d.reason}`);
    }
    lines.push("");
  }

  // Passed Criteria
  const passedRules = (ruleEvaluations || []).filter((r) => r.status === "PASS");
  if (passedRules.length > 0) {
    lines.push("#### ✓ Criteria Successfully Verified:");
    for (const r of passedRules) {
      lines.push(`- **${r.criterion}**: ${r.reason} *(Expected: ${r.expected} | Actual: ${r.actual})*`);
    }
    lines.push("");
  }

  // Failed Criteria
  const failedRules = (ruleEvaluations || []).filter((r) => r.status === "FAIL");
  if (failedRules.length > 0) {
    lines.push("#### ✗ Ineligibility Points Identified:");
    for (const r of failedRules) {
      lines.push(`- **${r.criterion}**: ${r.reason} *(Expected: ${r.expected} | Actual: ${r.actual})*`);
    }
    lines.push("");
  }

  // Missing Information / Incomplete Documents
  const missingRules = (ruleEvaluations || []).filter((r) => r.status === "INSUFFICIENT_DATA");
  const missingDocs = (documentVerification || []).filter((d) => d.status === "MISSING");
  if (missingRules.length > 0 || missingDocs.length > 0) {
    lines.push("#### ? Missing Information / Pending Paperwork:");
    for (const d of missingDocs) {
      lines.push(`- Document Missing: **${d.document}** — ${d.reason}`);
    }
    for (const r of missingRules) {
      lines.push(`- Incomplete Field: **${r.criterion}** — ${r.reason} *(Expected: ${r.expected} | Actual: ${r.actual})*`);
    }
    lines.push("");
  }

  // Human Review Triggers / Discrepancies
  const reviewTriggers = (deficiencies || []).filter(
    (d) => d.type === "HUMAN_VERIFICATION_REQUIRED" ||
           d.type === "DOCUMENT_MISMATCH" ||
           d.type === "LOW_CONFIDENCE_DOCUMENT"
  );
  if (reviewTriggers.length > 0) {
    lines.push("#### ⚠ Discrepancies & Human Review Flags:");
    for (const trig of reviewTriggers) {
      lines.push(`- **[${trig.type}]** ${trig.field}: ${trig.reason}`);
    }
    lines.push("");
  }

  // Mandatory Decision Boundary Disclaimer (Section 14)
  lines.push("---");
  lines.push("> **Official Notice:** This is an AI-assisted automated verification result. This engine does NOT autonomously grant or reject scholarships. Final decision is subject to authorized Ministry of Tribal Affairs officer review.");

  return lines.join("\n");
}

module.exports = { buildExplanation };
