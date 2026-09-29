import { Link } from 'react-router-dom';
import { ArrowLeft, Check, CircleDot, Lock, Printer } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { STEPS } from '../../config/steps';
import EligibilityPanel from './EligibilityPanel';

/*
 * Application status checklist shown on the left, like state scholarship
 * portals: each row shows done / current / pending, and every reachable row
 * is a working link.
 */
function Row({ state, label, sub, onClick, to, disabled }) {
  const marker = {
    done: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
      </span>
    ),
    current: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white">
        <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    ),
    todo: <span className="h-6 w-6 rounded-full border-2 border-line bg-white" aria-hidden="true" />,
    locked: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-[#9aa6b4]">
        <Lock className="h-3 w-3" aria-hidden="true" />
      </span>
    ),
  }[state];

  const body = (
    <>
      <span className="shrink-0">{marker}</span>
      <span className="min-w-0 text-left">
        <span className={`block text-[13px] leading-snug ${state === 'current' ? 'font-semibold text-navy' : state === 'locked' ? 'text-[#8a96a4]' : 'text-ink'}`}>
          {label}
        </span>
        {sub && <span className="block text-[11.5px] leading-snug text-muted">{sub}</span>}
      </span>
    </>
  );

  const cls = `flex w-full items-center gap-3 px-4 py-2.5 transition-colors ${
    state === 'current' ? 'bg-navy-soft/70' : disabled ? '' : 'hover:bg-paper'
  } ${disabled ? 'cursor-not-allowed' : ''}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-current={state === 'current' ? 'step' : undefined}>
      {body}
    </button>
  );
}

export default function ApplicationSidebar({ scheme, current, completed, canOpen, onSelect, kycVerified, checks }) {
  const { t, tx } = useLang();

  return (
    <div className="space-y-4">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('nav.dashboard')}
      </Link>

      <nav aria-label={tx({ en: 'Application status', hi: 'आवेदन की स्थिति' })} className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-ochre-soft/70 px-4 py-3">
          <p className="text-[13px] font-bold text-navy">{tx({ en: 'Application status', hi: 'आवेदन की स्थिति' })}</p>
          <p className="text-[12px] text-muted">{tx(scheme.short)}, {t('portal.session')}</p>
        </div>
        <ul className="divide-y divide-line">
          <li>
            <Row state="done" label={t('step.registration')} disabled />
          </li>
          <li>
            <Row
              state={kycVerified ? 'done' : 'todo'}
              label={t('step.kyc')}
              sub={kycVerified ? null : tx({ en: 'Complete it in your profile', hi: 'प्रोफ़ाइल में पूरा करें' })}
              to="/profile"
            />
          </li>
          {STEPS.map((s, i) => {
            const openable = canOpen(s.key);
            const state = s.key === current ? 'current' : completed.includes(s.key) ? 'done' : openable ? 'todo' : 'locked';
            return (
              <li key={s.key}>
                <Row
                  state={state}
                  label={`${i + 1}. ${t(s.labelKey)}`}
                  onClick={() => onSelect(s.key)}
                  disabled={!openable}
                />
              </li>
            );
          })}
          <li>
            <div className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#8a96a4]">
              <Printer className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                {t('step.print')}
                <span className="block text-[11.5px]">{tx({ en: 'Available after final submission', hi: 'अंतिम जमा के बाद उपलब्ध' })}</span>
              </span>
            </div>
          </li>
        </ul>
      </nav>

      {checks?.length > 0 && <EligibilityPanel checks={checks} />}
    </div>
  );
}
