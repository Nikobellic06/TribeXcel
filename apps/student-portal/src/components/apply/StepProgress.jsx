import { Check } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { STEPS } from '../../config/steps';

/* Horizontal step indicator above the form (compact bar on small screens). */
export default function StepProgress({ current, completed, onSelect, canOpen }) {
  const { t, tx } = useLang();
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="no-print">
      {/* Small screens */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-navy">
            {tx({ en: `Step ${currentIndex + 1} of ${STEPS.length}`, hi: `चरण ${currentIndex + 1} / ${STEPS.length}` })}
          </span>
          <span className="text-muted">{t(STEPS[currentIndex]?.labelKey)}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-navy transition-all" style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {/* Medium and up */}
      <ol className="hidden items-start md:flex">
        {STEPS.map((s, i) => {
          const done = completed.includes(s.key);
          const active = s.key === current;
          const openable = canOpen(s.key);
          return (
            <li key={s.key} className="relative flex flex-1 flex-col items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-[15px] h-0.5 w-full ${completed.includes(STEPS[i - 1].key) ? 'bg-leaf' : 'bg-line'}`}
                />
              )}
              <button
                type="button"
                disabled={!openable}
                onClick={() => onSelect(s.key)}
                aria-current={active ? 'step' : undefined}
                className="relative z-10 flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-colors ${
                    active
                      ? 'border-navy bg-navy text-white'
                      : done
                      ? 'border-leaf bg-leaf text-white'
                      : 'border-line bg-white text-muted'
                  }`}
                >
                  {done && !active ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className={`max-w-[110px] text-center text-[12px] leading-tight ${active ? 'font-semibold text-navy' : 'text-muted'}`}>
                  {t(s.labelKey)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
