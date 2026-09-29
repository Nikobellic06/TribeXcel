import { Globe } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import useTextSize from '../../utils/useTextSize';

/* Thin top bar: skip link, language switch and text-size controls. */
export default function UtilityBar() {
  const { t, toggleLang } = useLang();
  const { decrease, reset, increase } = useTextSize();
  const sizeBtn =
    'h-6 min-w-[26px] rounded border border-white/15 bg-white/5 px-1.5 text-[11px] font-semibold text-slate-200 hover:bg-white/15';

  return (
    <div className="no-print bg-navy-deep text-[12px] text-slate-300">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <a href="#main-content" className="underline-offset-2 hover:text-white hover:underline">
            {t('nav.skip')}
          </a>
          <span className="h-4 w-px bg-white/20" aria-hidden="true" />
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 rounded border border-[#d9a441]/40 px-2 py-0.5 font-semibold text-[#f0c870] hover:bg-white/10"
            aria-label="Switch language / भाषा बदलें"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            {t('nav.switchLang')}
          </button>
        </div>
        <div className="flex items-center gap-1" aria-label={t('nav.textSize')}>
          <span className="mr-1 hidden sm:inline">{t('nav.textSize')}</span>
          <button type="button" onClick={decrease} className={sizeBtn} aria-label="Decrease text size">A-</button>
          <button type="button" onClick={reset} className={sizeBtn} aria-label="Reset text size">A</button>
          <button type="button" onClick={increase} className={sizeBtn} aria-label="Increase text size">A+</button>
        </div>
      </div>
    </div>
  );
}
