/*
 * Display labels for backend values. Statuses are shared with the student
 * portal, so the stored values stay the same and only the wording changes.
 */

export const STATUS = {
  Draft: { label: 'Draft', tone: 'grey' },
  Pending: { label: 'Pending review', tone: 'navy' },
  Flagged: { label: 'Human review', tone: 'warn' },
  Deficient: { label: 'Correction required', tone: 'warn-strong' },
  Eligible: { label: 'Verified', tone: 'ok' },
  Selected: { label: 'Selected', tone: 'ok-strong' },
  Rejected: { label: 'Rejected', tone: 'bad' },
};

export const STATUS_OPTIONS = ['Pending', 'Flagged', 'Deficient', 'Eligible', 'Selected', 'Rejected'];

export const VIEWS = {
  all: { title: 'All Applications', countKey: 'all' },
  pending: { title: 'Pending Review', countKey: 'pending', status: 'Pending' },
  flagged: { title: 'AI Flagged', countKey: 'flagged', status: 'Flagged' },
  defective: { title: 'Defective', countKey: 'defective', status: 'Deficient' },
  verified: { title: 'Verified', countKey: 'verified' },
  rejected: { title: 'Rejected', countKey: 'rejected', status: 'Rejected' },
};

export const SCHEMES = {
  NFST: { short: 'NFST', name: 'National Fellowship for ST Students' },
  NOS: { short: 'NOS', name: 'National Overseas Scholarship for ST Students' },
  PRE_MATRIC: { short: 'Pre-Matric', name: 'Pre-Matric Scholarship for ST Students' },
  POST_MATRIC: { short: 'Post-Matric', name: 'Post-Matric Scholarship for ST Students' },
  TOP_CLASS: { short: 'Top Class', name: 'Top Class Education for ST Students' },
};

export const PRIORITY = {
  high: { label: 'High', tone: 'bad' },
  medium: { label: 'Medium', tone: 'warn' },
  normal: { label: 'Normal', tone: 'grey' },
};

/* Preliminary AI result (never a decision). */
export const AI_RESULT = {
  NO_ISSUES_DETECTED: { label: 'No issues detected', tone: 'ok' },
  REQUIRES_HUMAN_REVIEW: { label: 'Requires human review', tone: 'warn' },
  INCOMPLETE: { label: 'Incomplete', tone: 'warn' },
  UNAVAILABLE: { label: 'Analysis unavailable', tone: 'grey' },
  NOT_APPLICABLE: { label: 'Not applicable', tone: 'grey' },
  NOT_RUN: { label: 'Not run', tone: 'grey' },
};

/* Preliminary result of the deterministic rule evaluation. */
export const RULE_RESULT = {
  ELIGIBLE: { label: 'Meets configured rules', tone: 'ok' },
  INCOMPLETE: { label: 'Incomplete', tone: 'warn' },
  NOT_ELIGIBLE: { label: 'Rule failure', tone: 'bad' },
  REQUIRES_HUMAN_REVIEW: { label: 'Requires human review', tone: 'warn' },
};

export const RULE_STATUS = {
  PASS: { label: 'PASS', tone: 'ok' },
  FAIL: { label: 'FAIL', tone: 'bad' },
  INSUFFICIENT_DATA: { label: 'INSUFFICIENT DATA', tone: 'warn' },
  NOT_APPLICABLE: { label: 'NOT APPLICABLE', tone: 'grey' },
  REQUIRES_HUMAN_REVIEW: { label: 'HUMAN REVIEW', tone: 'warn' },
};

export const MATCH_STATUS = {
  MATCH: { label: 'MATCH', tone: 'ok' },
  PARTIAL: { label: 'PARTIAL MATCH', tone: 'warn' },
  MISMATCH: { label: 'MISMATCH', tone: 'bad' },
  UNAVAILABLE: { label: 'NOT COMPARABLE', tone: 'grey' },
};

export const FLAG_CODES = {
  MISSING_DOCUMENTS: 'Missing documents',
  ELIGIBILITY_FAILED: 'Eligibility rule failed',
  RULE_REVIEW: 'Rule needs officer judgement',
  INSUFFICIENT_DATA: 'Insufficient information',
  FIELD_MISMATCH: 'Field mismatch',
  PARTIAL_MATCH: 'Partial match',
  LOW_QUALITY_DOCUMENT: 'Low-quality document',
  OCR_INSUFFICIENT: 'Insufficient OCR information',
  AI_CHECK_FAILED: 'AI check not satisfied',
  ANALYSIS_UNAVAILABLE: 'AI analysis unavailable',
  RESUBMITTED: 'Correction submitted',
};

export const FLAG_SOURCE = { rules: 'Rules', ai: 'AI-assisted', data: 'Data check' };
