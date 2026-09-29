import { CircleCheck } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import GovHeader from '../GovHeader';
import GovFooter from '../GovFooter';

const POINTS = [
  { en: 'One registration for Pre-Matric, NFST and NOS', hi: 'मैट्रिक-पूर्व, एनएफएसटी और एनओएस हेतु एक पंजीकरण' },
  { en: 'Certificates fetched straight from DigiLocker', hi: 'प्रमाण पत्र सीधे डिजिलॉकर से' },
  { en: 'Save as draft, finish later, track every stage', hi: 'ड्राफ्ट सहेजें, बाद में पूरा करें, हर चरण देखें' },
];

/* Shared frame for login and sign-up. */
export default function AuthLayout({ title, subtitle, children }) {
  const { tx, t } = useLang();
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <GovHeader />
      <main id="main-content" className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-md border border-line bg-white shadow-sm md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative hidden flex-col justify-between bg-navy text-white md:flex">
            <div className="p-8">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#f0c870]">{t('portal.session')}</p>
              <p className="mt-2 font-serif text-[24px] font-bold leading-snug">{t('portal.name')}</p>
              <p className="mt-1 text-[13px] text-slate-300">{t('portal.ministry')}, {t('portal.goi')}</p>
              <ul className="mt-8 space-y-4">
                {POINTS.map((p) => (
                  <li key={p.en} className="flex gap-3 text-[14px] leading-relaxed text-slate-100">
                    <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#f0c870]" aria-hidden="true" />
                    {tx(p)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="motif-band" aria-hidden="true" />
          </div>
          <div className="p-6 sm:p-10">
            <h1 className="font-serif text-[24px] font-bold text-navy">{title}</h1>
            {subtitle && <p className="mt-1 text-[14px] text-muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
      <GovFooter />
    </div>
  );
}
