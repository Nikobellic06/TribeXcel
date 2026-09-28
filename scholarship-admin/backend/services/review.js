const ruleEngine = require('./ruleEngine');
const crossChecks = require('./crossChecks');

/*
 * Combines the rule evaluation, AI-assisted analysis and cross-document checks
 * into review flags with a clear reason each, plus a review priority.
 * Flags only route an application to an officer — they never decide it.
 */

function flagsFor(app, ruleEvaluation, aiAnalysis, cross) {
  const flags = [];
  const add = (code, severity, source, title, detail) => flags.push({ code, severity, source, title, detail });

  ruleEvaluation.results.forEach((r) => {
    if (r.status === 'FAIL' && r.id === 'documents') add('MISSING_DOCUMENTS', 'high', 'rules', 'Required documents missing', r.detail);
    else if (r.status === 'FAIL') add('ELIGIBILITY_FAILED', 'high', 'rules', `Rule failed: ${r.label}`, r.detail);
    else if (r.status === 'REQUIRES_HUMAN_REVIEW') add('RULE_REVIEW', 'medium', 'rules', r.label, r.detail);
  });
  const insufficient = ruleEvaluation.results.filter((r) => r.status === 'INSUFFICIENT_DATA');
  if (insufficient.length) {
    add('INSUFFICIENT_DATA', 'medium', 'rules', 'Information needed for rule evaluation is missing', insufficient.map((r) => `${r.label}: ${r.detail}`).join('; '));
  }

  cross.forEach((x) => {
    const detail = x.values.map((v) => `${v.source}: "${v.value}"`).join(' | ');
    if (x.status === 'MISMATCH') add('FIELD_MISMATCH', 'high', 'data', `${x.field} does not match across sources`, detail);
    if (x.status === 'PARTIAL') add('PARTIAL_MATCH', 'medium', 'data', `${x.field} only partly matches`, detail);
  });

  if (aiAnalysis?.status === 'completed') {
    (aiAnalysis.documents || []).forEach((d) => {
      if (d.quality === 'Poor' || d.quality === 'Unreadable') {
        add('LOW_QUALITY_DOCUMENT', 'medium', 'ai', `${d.name}: document quality ${d.quality.toLowerCase()}`, d.qualityIssues.join('; ') || 'Document quality is insufficient for reliable extraction.');
      } else if (d.ocrPerformed && Object.keys(d.fields || {}).length === 0) {
        add('OCR_INSUFFICIENT', 'medium', 'ai', `${d.name}: no fields could be extracted`, 'OCR returned no usable information.');
      }
    });
    (aiAnalysis.checks || []).filter((c) => !c.passed).forEach((c) => add('AI_CHECK_FAILED', 'medium', 'ai', `AI check not satisfied: ${c.label}`, c.details || ''));
  } else if (aiAnalysis?.status === 'unavailable') {
    add('ANALYSIS_UNAVAILABLE', 'low', 'ai', 'AI-assisted analysis unavailable', aiAnalysis.reason || '');
  }

  if ((app.resubmissionCount || 0) > 0) {
    add('RESUBMITTED', 'low', 'data', 'Correction submitted by the applicant', 'Check the corrected details and documents.');
  }
  return flags;
}

function priorityOf(flags) {
  if (flags.some((f) => f.severity === 'high')) return 'high';
  if (flags.some((f) => f.severity === 'medium')) return 'medium';
  return 'normal';
}

/* Full review picture for one application (used by the detail page). */
function assess(app, student) {
  const ruleEvaluation = ruleEngine.evaluate(app, student);
  const aiAnalysis = app.aiAnalysis || { status: 'not_run', preliminaryResult: 'NOT_RUN', reason: 'AI-assisted analysis has not been run for this application.' };
  const cross = crossChecks.build(app, aiAnalysis, student);
  const flags = flagsFor(app, ruleEvaluation, aiAnalysis, cross);
  return { ruleEvaluation, aiAnalysis, crossChecks: cross, flags, priority: priorityOf(flags) };
}

/* Stores the summary fields used by lists, filters and the review queue. */
function applySummary(doc, assessment) {
  doc.reviewFlags = assessment.flags;
  doc.reviewPriority = assessment.priority;
  doc.rulePreliminary = assessment.ruleEvaluation.preliminaryResult;
  doc.aiPreliminary = assessment.aiAnalysis.preliminaryResult || 'NOT_RUN';
  return doc;
}

/* Routing after submission: anything that needs attention goes to the AI Flagged queue. */
function initialStatus(assessment) {
  const needsAttention =
    assessment.priority !== 'normal' ||
    assessment.ruleEvaluation.preliminaryResult !== 'ELIGIBLE' ||
    ['REQUIRES_HUMAN_REVIEW', 'INCOMPLETE'].includes(assessment.aiAnalysis.preliminaryResult);
  return needsAttention ? 'Flagged' : 'Pending';
}

module.exports = { assess, applySummary, initialStatus, priorityOf };
