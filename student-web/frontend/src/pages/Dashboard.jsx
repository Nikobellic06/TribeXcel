import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, CircleAlert, FileText, Fingerprint, PencilLine, Send } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PortalLayout from '../components/layout/PortalLayout';
import ApplicationTracker from '../components/ApplicationTracker';
import StatusBadge from '../components/ui/StatusBadge';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import { SCHEME_LIST, getSchemeByCode, SELECTION_YEAR } from '../config/schemes';
import { STEPS } from '../config/steps';
import { fetchDrafts, fetchMyApplications } from '../api/student';
import { formatDate } from '../utils/format';

const FAQ = [
  {
    q: { en: 'Which documents should I keep ready?', hi: 'मुझे कौन-से दस्तावेज़ तैयार रखने चाहिए?' },
    a: {
      en: 'ST certificate, income certificate (Pre-Matric and NOS), Class 10 certificate, marksheets, admission or offer letter, a passport photo and your signature. Certificates available in DigiLocker can be fetched directly while applying.',
      hi: 'एसटी प्रमाण पत्र, आय प्रमाण पत्र (मैट्रिक-पूर्व एवं एनओएस), कक्षा 10 प्रमाण पत्र, अंकतालिकाएँ, प्रवेश या प्रस्ताव पत्र, पासपोर्ट फ़ोटो और हस्ताक्षर। डिजिलॉकर में उपलब्ध प्रमाण पत्र आवेदन के समय सीधे प्राप्त किए जा सकते हैं।',
    },
  },
  {
    q: { en: 'Can I save the form and finish it later?', hi: 'क्या मैं फ़ॉर्म सहेजकर बाद में पूरा कर सकता/सकती हूँ?' },
    a: {
      en: 'Yes. Every step is saved as a draft. Open the scheme again from this dashboard to continue where you stopped.',
      hi: 'हाँ। हर चरण ड्राफ्ट के रूप में सहेजा जाता है। जहाँ छोड़ा था वहीं से जारी रखने हेतु इस डैशबोर्ड से योजना पुनः खोलें।',
    },
  },
  {
    q: { en: 'What happens if my application is returned?', hi: 'यदि मेरा आवेदन लौटाया जाए तो क्या होगा?' },
    a: {
      en: 'The status changes to "Action needed" with the officer\'s remarks. Open the application, correct the details or documents and submit again.',
      hi: 'स्थिति "कार्रवाई आवश्यक" हो जाती है और अधिकारी की टिप्पणी दिखती है। आवेदन खोलें, विवरण या दस्तावेज़ सुधारें और पुनः जमा करें।',
    },
  },
];

function Stat({ label, value, tone = 'navy' }) {
  const color = { navy: 'text-navy', leaf: 'text-leaf', ochre: 'text-[#8a5a12]' }[tone];
  return (
    <div className="rounded-md border border-line bg-white px-4 py-3.5">
      <p className="text-[12px] text-muted">{label}</p>
      <p className={`mt-0.5 font-serif text-[26px] font-bold leading-tight ${color}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { t, tx, lang } = useLang();
  const { student } = useAuth();
  const [apps, setApps] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.allSettled([fetchMyApplications(), fetchDrafts()]).then(([a, d]) => {
      if (a.status === 'fulfilled') setApps(a.value);
      else setLoadError(true);
      if (d.status === 'fulfilled') setDrafts(d.value);
      setLoading(false);
    });
  }, []);

  const firstName = (student?.name || '').split(' ')[0];
  const actionNeeded = apps.filter((a) => a.status === 'Deficient');
  const appliedCodes = new Set(apps.map((a) => a.scheme));
  const openDrafts = drafts.filter((d) => !appliedCodes.has(d.scheme) || actionNeeded.some((a) => a.scheme === d.scheme));

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-ochre">{t('portal.session')}</p>
            <h1 className="font-serif text-[26px] font-bold text-navy">
              {tx({ en: `Namaste, ${firstName}`, hi: `नमस्ते, ${firstName}` })}
            </h1>
            <p className="mt-0.5 text-[14px] text-muted">
              {tx({ en: 'Apply for a scheme, continue a saved form or track your applications.', hi: 'योजना हेतु आवेदन करें, सहेजा गया फ़ॉर्म जारी रखें या अपने आवेदनों की स्थिति देखें।' })}
            </p>
          </div>
          <Button to="/schemes" icon={Send}>{t('nav.apply')}</Button>
        </div>

        {!student?.aadhaarVerified && (
          <Alert
            tone="warn"
            title={tx({ en: 'Aadhaar e-KYC pending', hi: 'आधार ई-केवाईसी लंबित' })}
            action={<Button size="sm" variant="secondary" to="/profile" icon={Fingerprint}>{tx({ en: 'Complete', hi: 'पूरा करें' })}</Button>}
          >
            {tx({ en: 'Complete it once in your profile. It is needed to submit any application.', hi: 'इसे प्रोफ़ाइल में एक बार पूरा करें। किसी भी आवेदन को जमा करने हेतु यह आवश्यक है।' })}
          </Alert>
        )}

        {loadError && <Alert tone="error">{t('err.network')}</Alert>}

        {loading ? (
          <PageLoader label={t('common.loading')} />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Stat label={tx({ en: 'Submitted', hi: 'जमा किए' })} value={apps.length} />
              <Stat label={tx({ en: 'Drafts', hi: 'ड्राफ्ट' })} value={openDrafts.length} tone="leaf" />
              <Stat label={tx({ en: 'Action needed', hi: 'कार्रवाई आवश्यक' })} value={actionNeeded.length} tone="ochre" />
            </div>

            {actionNeeded.map((app) => {
              const scheme = getSchemeByCode(app.scheme);
              return (
                <Alert
                  key={app._id}
                  tone="warn"
                  title={tx({ en: `${tx(scheme?.short) || app.scheme}: correction requested`, hi: `${tx(scheme?.short) || app.scheme}: सुधार का अनुरोध` })}
                  action={scheme && <Button size="sm" to={`/apply/${scheme.id}/documents`} icon={PencilLine}>{tx({ en: 'Correct', hi: 'सुधारें' })}</Button>}
                >
                  {app.adminRemarks || tx({ en: 'The verifying officer has asked you to correct your application.', hi: 'सत्यापन अधिकारी ने आवेदन सुधारने को कहा है।' })}
                </Alert>
              );
            })}

            {openDrafts.length > 0 && (
              <section>
                <h2 className="mb-3 text-[15px] font-bold text-ink">{tx({ en: 'Continue where you left off', hi: 'जहाँ छोड़ा था वहीं से जारी रखें' })}</h2>
                <ul className="grid gap-3 md:grid-cols-2">
                  {openDrafts.map((d) => {
                    const scheme = getSchemeByCode(d.scheme);
                    if (!scheme) return null;
                    const done = (d.completedSteps || []).length;
                    const pct = Math.round((done / (STEPS.length - 1)) * 100);
                    return (
                      <li key={d.scheme} className="rounded-md border border-line bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-ink">{tx(scheme.name)}</p>
                            <p className="mt-0.5 text-[12px] text-muted">
                              {tx({ en: `Last saved ${formatDate(d.updatedAt, 'en')}`, hi: `अंतिम बार सहेजा ${formatDate(d.updatedAt, 'hi')}` })}
                            </p>
                          </div>
                          <StatusBadge status="Draft" />
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                            <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[12px] text-muted">{tx({ en: `${done} of 5 steps`, hi: `5 में से ${done} चरण` })}</span>
                        </div>
                        <Button size="sm" className="mt-3" to={`/apply/${scheme.id}`} iconRight={ArrowRight}>{t('common.continue')}</Button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-ink">{t('nav.applications')}</h2>
                {apps.length > 0 && (
                  <Link to="/applications" className="text-[13px] font-semibold text-navy hover:underline">
                    {tx({ en: 'View all', hi: 'सभी देखें' })}
                  </Link>
                )}
              </div>
              {apps.length === 0 ? (
                <div className="rounded-md border border-dashed border-line bg-white px-5 py-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-[#9aa6b4]" aria-hidden="true" />
                  <p className="mt-2 text-[14px] font-semibold text-ink">{tx({ en: 'No application submitted yet', hi: 'अभी तक कोई आवेदन जमा नहीं किया' })}</p>
                  <p className="mt-1 text-[13px] text-muted">{tx({ en: 'Pick a scheme below to start.', hi: 'शुरू करने हेतु नीचे से योजना चुनें।' })}</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {apps.slice(0, 3).map((app) => {
                    const scheme = getSchemeByCode(app.scheme);
                    return (
                      <li key={app._id} className="rounded-md border border-line bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-ink">{scheme ? tx(scheme.name) : app.scheme}</p>
                            <p className="mt-0.5 text-[12px] text-muted">
                              {app.applicationCode}, {tx({ en: 'submitted', hi: 'जमा' })} {formatDate(app.submittedAt || app.createdAt, lang)}
                            </p>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="mt-4">
                          <ApplicationTracker status={app.status} schemeCode={app.scheme} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-[15px] font-bold text-ink">
                {tx({ en: `Schemes open for ${SELECTION_YEAR}`, hi: `${SELECTION_YEAR} हेतु खुली योजनाएं` })}
              </h2>
              <ul className="grid gap-3 md:grid-cols-3">
                {SCHEME_LIST.map((s) => (
                  <li key={s.id} className="flex flex-col rounded-md border border-line bg-white p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-ochre">{tx(s.short)}</p>
                    <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">{tx(s.level)}</p>
                    <p className="mt-1 text-[12px] text-muted">{tx({ en: 'Window', hi: 'आवेदन अवधि' })}: {tx(s.window)}</p>
                    <div className="mt-auto flex gap-3 pt-3 text-[13px] font-semibold">
                      <Link to={`/apply/${s.id}`} className="text-navy hover:underline">{tx({ en: 'Apply', hi: 'आवेदन करें' })}</Link>
                      <Link to={`/schemes/${s.id}`} className="text-muted hover:text-navy hover:underline">{tx({ en: 'Details', hi: 'विवरण' })}</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-md border border-line bg-white">
              <h2 className="flex items-center gap-2 border-b border-line px-4 py-3 text-[15px] font-bold text-ink">
                <CircleAlert className="h-4 w-4 text-navy" aria-hidden="true" />
                {tx({ en: 'Frequently asked questions', hi: 'अक्सर पूछे जाने वाले प्रश्न' })}
              </h2>
              <div className="divide-y divide-line">
                {FAQ.map((item) => (
                  <details key={item.q.en} className="group px-4 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-medium text-ink">
                      {tx(item.q)}
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{tx(item.a)}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
