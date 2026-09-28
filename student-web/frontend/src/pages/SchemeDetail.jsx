import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronRight, CircleAlert, CircleCheck, CloudDownload, ExternalLink, Globe, GraduationCap, School, Upload } from 'lucide-react';
import GovHeader from '../components/GovHeader';
import GovFooter from '../components/GovFooter';
import Button from '../components/ui/Button';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getScheme, SELECTION_YEAR } from '../config/schemes';
import { getDocumentChecklist } from '../config/documents';
import { formatINR } from '../utils/format';

const ICONS = { school: School, graduation: GraduationCap, globe: Globe };

const HOW_TO_APPLY = [
  { en: 'Register on this portal and log in', hi: 'इस पोर्टल पर पंजीकरण करें और लॉगिन करें' },
  { en: 'Complete your profile and Aadhaar e-KYC once', hi: 'एक बार प्रोफ़ाइल और आधार ई-केवाईसी पूरा करें' },
  { en: 'Fill the 6-step application; it is saved as you go', hi: '6 चरणों का आवेदन भरें; यह साथ-साथ सहेजा जाता है' },
  { en: 'Fetch certificates from DigiLocker and upload the rest', hi: 'प्रमाण पत्र डिजिलॉकर से प्राप्त करें और शेष अपलोड करें' },
  { en: 'Submit, print the acknowledgement and track the status', hi: 'जमा करें, पावती प्रिंट करें और स्थिति देखें' },
];

/* Documents shown on the public page: everything that can ever be asked for, marked when conditional. */
function publicChecklist(schemeId) {
  const base = getDocumentChecklist(schemeId, {});
  const all = getDocumentChecklist(schemeId, {
    category: { isPVTG: 'yes', hasDisability: 'yes' },
    academic: { gradeType: 'cgpa', premierOffer: 'yes', courseLevel: 'postdoc' },
  });
  const baseIds = new Set(base.map((d) => d.id));
  const merged = [...base];
  all.forEach((d) => {
    if (!baseIds.has(d.id)) merged.push({ ...d, conditional: true });
  });
  if (schemeId === 'nos' && !merged.some((d) => d.id === 'ug_marksheet')) {
    merged.push({ ...getDocumentChecklist('nos', { academic: { courseLevel: 'masters' } }).find((d) => d.id === 'ug_marksheet'), conditional: true });
  }
  return merged;
}

export default function SchemeDetail() {
  const { schemeId } = useParams();
  const { tx, t } = useLang();
  const { student } = useAuth();
  const scheme = getScheme(schemeId);

  if (!scheme) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <GovHeader />
        <main id="main-content" className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md rounded-md border border-line bg-white p-8 text-center">
            <CircleAlert className="mx-auto mb-4 h-10 w-10 text-ochre" aria-hidden="true" />
            <h1 className="font-serif text-[22px] font-bold text-ink">{tx({ en: 'Scheme not found', hi: 'योजना नहीं मिली' })}</h1>
            <p className="mb-6 mt-2 text-[14px] text-muted">
              {tx({ en: 'The scheme you are looking for does not exist.', hi: 'आप जिस योजना को खोज रहे हैं वह उपलब्ध नहीं है।' })}
            </p>
            <Button to="/">{t('nav.home')}</Button>
          </div>
        </main>
        <GovFooter />
      </div>
    );
  }

  const Icon = ICONS[scheme.icon] || BookOpen;
  const applyTo = student ? `/apply/${scheme.id}` : '/signup';
  const docs = publicChecklist(scheme.id);

  const facts = [
    [tx({ en: 'Session', hi: 'सत्र' }), SELECTION_YEAR],
    [tx({ en: 'For', hi: 'किसके लिए' }), tx(scheme.level)],
    [tx({ en: 'Apply', hi: 'आवेदन अवधि' }), tx(scheme.window)],
    [tx({ en: 'Income limit', hi: 'आय सीमा' }), scheme.rules.incomeLimit ? tx({ en: `${formatINR(scheme.rules.incomeLimit)} a year`, hi: `${formatINR(scheme.rules.incomeLimit)} प्रति वर्ष` }) : tx({ en: 'None', hi: 'कोई नहीं' })],
    scheme.slots ? [tx({ en: 'Awards a year', hi: 'प्रति वर्ष छात्रवृत्तियाँ' }), scheme.slots.total] : null,
  ].filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <GovHeader />

      <div className="border-b border-line bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-[12px] text-muted sm:px-6">
          <Link to="/" className="hover:text-navy hover:underline">{t('nav.home')}</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <a href="/#available-schemes" className="hover:text-navy hover:underline">{tx({ en: 'Available schemes', hi: 'उपलब्ध योजनाएं' })}</a>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="font-medium text-navy">{tx(scheme.short)}</span>
        </nav>
      </div>

      <main id="main-content" className="flex-1">
        <section className="bg-navy text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-[#d9a441]/50">
                <Icon className="h-7 w-7 text-[#f0c870]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[#f0c870]">{tx(scheme.type)}</p>
                <h1 className="mt-1 font-serif text-[24px] font-bold leading-tight sm:text-[30px]">{tx(scheme.name)}</h1>
                <p className="mt-1 text-[14px] text-slate-200">{t('portal.ministry')}, {t('portal.goi')}</p>
              </div>
            </div>
            <Button to={applyTo} variant="secondary" size="lg" iconRight={ArrowRight} className="shrink-0 border-white bg-white text-navy hover:bg-navy-soft">
              {student ? tx({ en: 'Apply now', hi: 'अभी आवेदन करें' }) : tx({ en: 'Register to apply', hi: 'आवेदन हेतु पंजीकरण करें' })}
            </Button>
          </div>
          <div className="motif-band" aria-hidden="true" />
        </section>

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="rounded-md border border-line bg-white p-6">
              <h2 className="font-serif text-[19px] font-bold text-navy">{tx({ en: 'About the scheme', hi: 'योजना के बारे में' })}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink">{tx(scheme.overview)}</p>
            </section>

            <section className="rounded-md border border-line bg-white p-6">
              <h2 className="font-serif text-[19px] font-bold text-navy">{tx({ en: 'Who can apply', hi: 'कौन आवेदन कर सकता है' })}</h2>
              <ul className="mt-3 space-y-2.5">
                {scheme.eligibility.map((item) => (
                  <li key={item.en} className="flex gap-2.5 text-[14px] leading-relaxed text-ink">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden="true" />
                    {tx(item)}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-md border border-line bg-white p-6">
              <h2 className="font-serif text-[19px] font-bold text-navy">{tx({ en: 'What you get', hi: 'आपको क्या मिलता है' })}</h2>
              <dl className="mt-3 divide-y divide-line overflow-hidden rounded-md border border-line">
                {scheme.benefits.map((b) => (
                  <div key={b.label.en} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr]">
                    <dt className="text-[13px] font-semibold text-navy">{tx(b.label)}</dt>
                    <dd className="text-[13.5px] text-ink">{tx(b.value)}</dd>
                  </div>
                ))}
              </dl>
              {scheme.slots && (
                <div className="mt-4">
                  <p className="text-[13px] font-semibold text-ink">
                    {tx({ en: `${scheme.slots.total} fresh awards every year`, hi: `प्रति वर्ष ${scheme.slots.total} नई छात्रवृत्तियाँ` })}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {scheme.slots.split.map((sl) => (
                      <li key={sl.label.en} className="rounded border border-line bg-paper px-2.5 py-1 text-[12.5px] text-ink">
                        {tx(sl.label)}: <strong>{sl.value}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="rounded-md border border-line bg-white p-6">
              <h2 className="font-serif text-[19px] font-bold text-navy">{tx({ en: 'Documents required', hi: 'आवश्यक दस्तावेज़' })}</h2>
              <ul className="mt-3 divide-y divide-line">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-start justify-between gap-3 py-2.5">
                    <span className="text-[14px] text-ink">
                      {tx(d.label)}
                      {(d.conditional || !d.required) && (
                        <span className="ml-1.5 text-[12px] text-muted">({tx({ en: 'if applicable', hi: 'यदि लागू हो' })})</span>
                      )}
                    </span>
                    <span className={`inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold ${d.digilocker ? 'text-leaf' : 'text-muted'}`}>
                      {d.digilocker ? <CloudDownload className="h-3.5 w-3.5" aria-hidden="true" /> : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
                      {d.digilocker ? 'DigiLocker' : tx({ en: 'Upload', hi: 'अपलोड' })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-md border border-line bg-white p-5 lg:sticky lg:top-6">
              <h2 className="text-[14px] font-bold text-ink">{tx({ en: 'Quick facts', hi: 'मुख्य तथ्य' })}</h2>
              <dl className="mt-3 space-y-2.5 text-[13px]">
                {facts.map(([k, val]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-dashed border-line pb-2 last:border-b-0">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-semibold text-ink">{val}</dd>
                  </div>
                ))}
              </dl>
              <Button to={applyTo} className="mt-4 w-full" iconRight={ArrowRight}>
                {student ? tx({ en: 'Apply now', hi: 'अभी आवेदन करें' }) : tx({ en: 'Register to apply', hi: 'आवेदन हेतु पंजीकरण करें' })}
              </Button>
              {!student && (
                <p className="mt-2 text-center text-[12px] text-muted">
                  {tx({ en: 'Already registered?', hi: 'पहले से पंजीकृत?' })}{' '}
                  <Link to="/login" state={{ from: `/apply/${scheme.id}` }} className="font-semibold text-navy hover:underline">{t('nav.login')}</Link>
                </p>
              )}
            </section>

            <section className="rounded-md border border-line bg-white p-5">
              <h2 className="text-[14px] font-bold text-ink">{tx({ en: 'Verification', hi: 'सत्यापन' })}</h2>
              <ol className="mt-3 space-y-3">
                {scheme.verification.map((v, i) => (
                  <li key={v.en} className="flex items-center gap-3 text-[13px] text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-soft text-[12px] font-bold text-navy">{i + 1}</span>
                    {tx(v)}
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-md border border-line bg-white p-5">
              <h2 className="text-[14px] font-bold text-ink">{tx({ en: 'How to apply', hi: 'आवेदन कैसे करें' })}</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-ink">
                {HOW_TO_APPLY.map((s) => (
                  <li key={s.en}>{tx(s)}</li>
                ))}
              </ol>
              <a
                href="https://tribal.nic.in/ScholarshiP.aspx"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-navy hover:underline"
              >
                {tx({ en: 'Official scheme guidelines', hi: 'आधिकारिक योजना दिशानिर्देश' })}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </section>
          </aside>
        </div>
      </main>

      <GovFooter />
    </div>
  );
}
