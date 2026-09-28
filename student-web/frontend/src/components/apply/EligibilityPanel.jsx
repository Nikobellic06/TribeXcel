import { CircleCheck, CircleAlert, TriangleAlert, CircleDashed } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { overallEligibility } from '../../utils/eligibility';

const icon = {
  pass: <CircleCheck className="h-4 w-4 text-leaf" aria-hidden="true" />,
  fail: <CircleAlert className="h-4 w-4 text-alert" aria-hidden="true" />,
  warn: <TriangleAlert className="h-4 w-4 text-ochre" aria-hidden="true" />,
  pending: <CircleDashed className="h-4 w-4 text-[#9aa6b4]" aria-hidden="true" />,
};

/* Live eligibility summary — compact in the sidebar, detailed on the review step. */
export default function EligibilityPanel({ checks, detailed = false }) {
  const { tx } = useLang();
  const overall = overallEligibility(checks);

  const heading = {
    pass: { en: 'You meet the scheme criteria', hi: 'आप योजना के मानदंड पूरे करते हैं' },
    fail: { en: 'Some criteria are not met', hi: 'कुछ मानदंड पूरे नहीं होते' },
    pending: { en: 'Eligibility check', hi: 'पात्रता जाँच' },
  }[overall];

  const tone = {
    pass: 'border-leaf/30 bg-leaf-soft/60',
    fail: 'border-alert/30 bg-alert-soft/60',
    pending: 'border-line bg-white',
  }[overall];

  return (
    <section className={`rounded-md border p-4 ${tone}`} aria-live="polite">
      <h3 className="text-[13px] font-semibold text-ink">{tx(heading)}</h3>
      {!detailed && (
        <p className="mt-0.5 text-[12px] text-muted">
          {tx({ en: 'Updates as you fill the form.', hi: 'फ़ॉर्म भरते समय अपडेट होता है।' })}
        </p>
      )}
      <ul className={`mt-3 ${detailed ? 'grid gap-3 sm:grid-cols-2' : 'space-y-2.5'}`}>
        {checks.map((c) => (
          <li key={c.id} className="flex gap-2">
            <span className="mt-0.5 shrink-0">{icon[c.status]}</span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium leading-snug text-ink">{tx(c.label)}</span>
              {(detailed || c.status === 'fail' || c.status === 'warn') && (
                <span className="block text-[12px] leading-snug text-muted">{tx(c.detail)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
