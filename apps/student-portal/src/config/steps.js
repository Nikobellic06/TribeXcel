/*
 * The six application steps, in order. `key` is also the URL segment:
 *   /apply/:schemeId/:step   e.g. /apply/nfst/academic
 */
export const STEPS = [
  { key: 'personal', labelKey: 'step.personal' },
  { key: 'category', labelKey: 'step.category' },
  { key: 'academic', labelKey: 'step.academic' },
  { key: 'bank', labelKey: 'step.bank' },
  { key: 'documents', labelKey: 'step.documents' },
  { key: 'review', labelKey: 'step.review' },
];

export const STEP_KEYS = STEPS.map((s) => s.key);

export const stepIndex = (key) => STEP_KEYS.indexOf(key);
