import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CircleCheck, FileCheck, Globe, GraduationCap, PencilLine, School, ShieldAlert } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import PortalLayout from '../components/layout/PortalLayout';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PageLoader from '../components/ui/PageLoader';
import { SCHEME_LIST, SELECTION_YEAR } from '../config/schemes';
import { fetchDrafts, fetchMyApplications } from '../api/student';
import { formatINR } from '../utils/format';

const ICONS = { school: School, graduation: GraduationCap, globe: Globe };

const DOC_COUNTS = {
  'pre-matric': 5,
  'nfst': 5,
  'nos': 6,
};

function keyFacts(s, tx) {
  const r = s.rules;
  const facts = [];
  if (r.incomeLimit) facts.push(tx({ en: `Income up to ${formatINR(r.incomeLimit)}`, hi: `आय ${formatINR(r.incomeLimit)} तक` }));
  else facts.push(tx({ en: 'No income limit', hi: 'कोई आय सीमा नहीं' }));
  if (r.minMarks) facts.push(tx({ en: `${r.minMarks}% in qualifying degree`, hi: `योग्यता डिग्री में ${r.minMarks}%` }));
  if (r.maxAge) facts.push(tx({ en: `Age up to ${r.maxAge}`, hi: `आयु ${r.maxAge} तक` }));
  if (r.maxAgeByLevel) facts.push(tx({ en: 'Age 32 / 35 / 38 by level', hi: 'स्तर अनुसार आयु 32 / 35 / 38' }));
  if (r.allowedClasses) facts.push(tx({ en: 'Class IX or X', hi: 'कक्षा IX या X' }));
  if (s.slots) facts.push(tx({ en: `${s.slots.total} awards a year`, hi: `प्रति वर्ष ${s.slots.total} छात्रवृत्तियाँ` }));
  return facts;
}

export default function SchemeSelection() {
  const { t, tx } = useLang();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmScheme, setConfirmScheme] = useState(null);

  useEffect(() => {
    Promise.allSettled([fetchMyApplications(), fetchDrafts()]).then(([a, d]) => {
      if (a.status === 'fulfilled') setApps(a.value);
      if (d.status === 'fulfilled') setDrafts(d.value);
      setLoading(false);
    });
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-5">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wide text-ochre">{t('portal.session')}</p>
          <h1 className="font-serif text-[24px] font-bold text-navy">{t('nav.apply')}</h1>
          <p className="mt-1 max-w-2xl text-[14px] text-muted">
            {tx({
              en: 'Choose the scheme that matches your class or course. You can apply for one application per scheme each session.',
              hi: 'अपनी कक्षा या पाठ्यक्रम के अनुसार योजना चुनें। प्रत्येक सत्र में हर योजना हेतु एक आवेदन किया जा सकता है।',
            })}
          </p>
        </div>

        {loading ? (
          <PageLoader label={t('common.loading')} />
        ) : (
          <ul className="space-y-4">
            {SCHEME_LIST.map((s) => {
              const Icon = ICONS[s.icon] || BookOpen;
              const app = apps.find((a) => a.scheme === s.code && (a.session || SELECTION_YEAR) === SELECTION_YEAR);
              const draft = drafts.find((d) => d.scheme === s.code);
              let action;
              if (app && app.status === 'Deficient') {
                action = (
                  <Button to={`/apply/${s.id}/documents`} icon={PencilLine}>
                    {tx({ en: 'Correct and resubmit', hi: 'सुधारें और पुनः जमा करें' })}
                  </Button>
                );
              } else if (app) {
                action = (
                  <Button to="/applications" variant="secondary" icon={CircleCheck}>
                    {tx({ en: 'Track application', hi: 'आवेदन की स्थिति देखें' })}
                  </Button>
                );
              } else if (draft) {
                action = (
                  <Button onClick={() => setConfirmScheme(s)} iconRight={ArrowRight}>
                    {tx({ en: 'Continue draft', hi: 'ड्राफ्ट जारी रखें' })}
                  </Button>
                );
              } else {
                action = (
                  <Button onClick={() => setConfirmScheme(s)} iconRight={ArrowRight}>
                    {tx({ en: 'Start application', hi: 'आवेदन शुरू करें' })}
                  </Button>
                );
              }
              return (
                <li key={s.id} className="overflow-hidden rounded-md border border-line bg-white">
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-navy-soft text-navy">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-ochre">{tx(s.type)}</p>
                        {app ? <StatusBadge status={app.status} /> : draft ? <StatusBadge status="Draft" /> : null}
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11.5px] font-semibold text-slate-700">
                          <FileCheck className="h-3.5 w-3.5 text-navy" />
                          {DOC_COUNTS[s.id] || 5} {tx({ en: 'Documents', hi: 'दस्तावेज़' })}
                        </span>
                      </div>
                      <h2 className="mt-1 text-[17px] font-bold leading-snug text-ink">{tx(s.name)}</h2>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">
                        {tx(s.overview)}
                      </p>
                      <p className="mt-1.5 text-[12.5px] font-semibold text-navy">
                        {tx(s.level)} • {tx({ en: 'Application Window', hi: 'आवेदन अवधि' })}: {tx(s.window)}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {keyFacts(s, tx).map((f) => (
                          <li key={f} className="rounded border border-line bg-paper px-2 py-1 text-[12px] text-ink">{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper px-5 py-3 sm:px-6">
                    <Link to={`/schemes/${s.id}`} className="text-[13px] font-semibold text-navy hover:underline">
                      {tx({ en: 'View Statutory Guidelines & Benefits', hi: 'सांविधिक दिशानिर्देश एवं लाभ देखें' })}
                    </Link>
                    {action}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Confirmation Modal Before Entering Application */}
        {confirmScheme && (
          <Modal
            open={Boolean(confirmScheme)}
            onClose={() => setConfirmScheme(null)}
            title={tx({
              en: `Proceed to ${tx(confirmScheme.short)} Application?`,
              hi: `क्या आप ${tx(confirmScheme.short)} आवेदन के लिए आगे बढ़ना चाहते हैं?`,
            })}
          >
            <div className="space-y-4">
              <p className="text-[13.5px] text-ink leading-relaxed">
                {tx({
                  en: `You are about to initiate an application for "${tx(confirmScheme.name)}" for Academic Session ${SELECTION_YEAR}.`,
                  hi: `आप शैक्षणिक सत्र ${SELECTION_YEAR} हेतु "${tx(confirmScheme.name)}" के लिए आवेदन शुरू करने जा रहे हैं।`,
                })}
              </p>

              <div className="rounded-md border border-line bg-paper p-3 text-[12.5px] text-muted space-y-1.5">
                <p className="font-semibold text-ink">
                  {tx({ en: 'Please ensure you have:', hi: 'कृपया सुनिश्चित करें कि आपके पास है:' })}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{tx({ en: 'Scheduled Tribe (ST) Certificate issued by competent revenue authority', hi: 'सक्षम राजस्व प्राधिकारी द्वारा जारी अनुसूचित जनजाति (एसटी) प्रमाण पत्र' })}</li>
                  <li>{tx({ en: 'Aadhaar Card and active mobile number linked for DBT authentication', hi: 'डीबीटी प्रमाणीकरण हेतु आधार कार्ड एवं सक्रिय मोबाइल नंबर' })}</li>
                  <li>{tx({ en: 'Academic marksheets and institutional admission/bonafide record', hi: 'शैक्षणिक अंकतालिकाएं और संस्थान प्रवेश/बोनाफाइड रिकॉर्ड' })}</li>
                  <li>{tx({ en: 'Active bank account details (IFSC, Account Number)', hi: 'सक्रिय बैंक खाता विवरण (आईएफएससी, खाता संख्या)' })}</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setConfirmScheme(null)}>
                  {tx({ en: 'Cancel', hi: 'रद्द करें' })}
                </Button>
                <Button
                  iconRight={ArrowRight}
                  onClick={() => {
                    const id = confirmScheme.id;
                    setConfirmScheme(null);
                    navigate(`/apply/${id}`);
                  }}
                >
                  {tx({ en: 'Proceed to Application', hi: 'आवेदन प्रारंभ करें' })}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PortalLayout>
  );
}
