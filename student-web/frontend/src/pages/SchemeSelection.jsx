import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CircleCheck, Globe, GraduationCap, PencilLine, School } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import PortalLayout from '../components/layout/PortalLayout';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import { SCHEME_LIST, SELECTION_YEAR } from '../config/schemes';
import { fetchDrafts, fetchMyApplications } from '../api/student';
import { formatINR } from '../utils/format';

const ICONS = { school: School, graduation: GraduationCap, globe: Globe };

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
  const [apps, setApps] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

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
                action = <Button to={`/apply/${s.id}/documents`} icon={PencilLine}>{tx({ en: 'Correct and resubmit', hi: 'सुधारें और पुनः जमा करें' })}</Button>;
              } else if (app) {
                action = <Button to="/applications" variant="secondary" icon={CircleCheck}>{tx({ en: 'Track application', hi: 'आवेदन की स्थिति देखें' })}</Button>;
              } else if (draft) {
                action = <Button to={`/apply/${s.id}`} iconRight={ArrowRight}>{tx({ en: 'Continue draft', hi: 'ड्राफ्ट जारी रखें' })}</Button>;
              } else {
                action = <Button to={`/apply/${s.id}`} iconRight={ArrowRight}>{tx({ en: 'Start application', hi: 'आवेदन शुरू करें' })}</Button>;
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
                      </div>
                      <h2 className="mt-1 text-[17px] font-bold leading-snug text-ink">{tx(s.name)}</h2>
                      <p className="mt-1 text-[13px] text-muted">
                        {tx(s.level)}. {tx({ en: 'Apply', hi: 'आवेदन' })}: {tx(s.window)}
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
                      {tx({ en: 'Eligibility, benefits and documents', hi: 'पात्रता, लाभ और दस्तावेज़' })}
                    </Link>
                    {action}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PortalLayout>
  );
}
