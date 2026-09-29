import { Check, CircleAlert, Cpu, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { getSchemeByCode } from '../config/schemes';

/**
 * 5-Stage Statutory Government Verification Timeline
 * 
 * 1. Application Submitted
 * 2. AI Preliminary Verification (Automated OCR & Schema Ingestion)
 * 3. Institutional / Nodal Verification
 * 4. State / Ministry Scrutiny
 * 5. Final Selection / Decision
 */
function stageStates(status) {
  switch (status) {
    case 'Pending':
      return ['done', 'done', 'current', 'todo', 'todo'];
    case 'Deficient':
      return ['done', 'done', 'action', 'todo', 'todo'];
    case 'Flagged':
      return ['done', 'done', 'done', 'current', 'todo'];
    case 'Eligible':
      return ['done', 'done', 'done', 'done', 'current'];
    case 'Selected':
      return ['done', 'done', 'done', 'done', 'done'];
    case 'Rejected':
      return ['done', 'done', 'done', 'done', 'failed'];
    default:
      return ['done', 'done', 'current', 'todo', 'todo'];
  }
}

export default function ApplicationTracker({ status, schemeCode }) {
  const { tx } = useLang();
  const scheme = getSchemeByCode(schemeCode);

  const institutionalLabel = scheme?.verification?.[0] || {
    en: 'Nodal Verification',
    hi: 'नोडल अधिकारी सत्यापन',
  };

  const labels = [
    { en: 'Submitted', hi: 'जमा किया' },
    { en: 'Documents Processing', hi: 'दस्तावेज़ प्रसंस्करण' },
    institutionalLabel,
    { en: 'Ministry Scrutiny', hi: 'मंत्रालय जाँच' },
    { en: 'Final Status', hi: 'अंतिम स्थिति' },
  ];

  const states = stageStates(status);

  return (
    <ol className="flex items-start">
      {labels.map((label, i) => {
        const s = states[i];
        const dot = {
          done: 'bg-leaf border-leaf text-white',
          current: 'bg-white border-navy text-navy',
          action: 'bg-ochre border-ochre text-white',
          failed: 'bg-alert border-alert text-white',
          todo: 'bg-white border-line text-muted',
        }[s];

        return (
          <li key={i} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-[11px] h-0.5 w-full ${
                  states[i - 1] === 'done' && s !== 'todo' ? 'bg-leaf' : 'bg-line'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10.5px] font-bold ${dot}`}
            >
              {s === 'done' ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : s === 'action' ? (
                <CircleAlert className="h-3.5 w-3.5" />
              ) : s === 'failed' ? (
                <X className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={`mt-1.5 px-0.5 text-[11px] leading-tight ${
                s === 'current' || s === 'action' ? 'font-bold text-ink' : 'text-muted'
              }`}
            >
              {tx(label)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
