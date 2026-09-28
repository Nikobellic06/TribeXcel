import { useEffect, useState } from 'react';
import { FileText, PencilLine, Printer, Send } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import PortalLayout from '../components/layout/PortalLayout';
import ApplicationTracker from '../components/ApplicationTracker';
import StatusBadge from '../components/ui/StatusBadge';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import { getSchemeByCode } from '../config/schemes';
import { fetchMyApplications } from '../api/student';
import { formatDate } from '../utils/format';

const STATUS_NOTE = {
  Pending: { en: 'Your application is with the verifying officer.', hi: 'आपका आवेदन सत्यापन अधिकारी के पास है।' },
  Eligible: { en: 'Verified and found eligible. Awaiting the final selection list.', hi: 'सत्यापित एवं पात्र पाया गया। अंतिम चयन सूची की प्रतीक्षा।' },
  Flagged: { en: 'Under closer review by the Ministry. No action is needed from you right now.', hi: 'मंत्रालय द्वारा विस्तृत समीक्षा जारी। अभी आपको कुछ करने की आवश्यकता नहीं।' },
  Deficient: { en: 'The officer has asked for a correction. Please update and resubmit.', hi: 'अधिकारी ने सुधार माँगा है। कृपया अद्यतन करके पुनः जमा करें।' },
  Selected: { en: 'Congratulations, you have been selected. Payment will be made to your bank account by DBT.', hi: 'बधाई हो, आपका चयन हुआ है। भुगतान डीबीटी से आपके बैंक खाते में होगा।' },
  Rejected: { en: 'Your application was not selected this session.', hi: 'इस सत्र में आपका आवेदन चयनित नहीं हुआ।' },
};

export default function MyApplications() {
  const { t, tx, lang } = useLang();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMyApplications()
      .then(setApps)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-[24px] font-bold text-navy">{t('nav.applications')}</h1>
            <p className="mt-1 text-[14px] text-muted">
              {tx({ en: 'Track every application and respond when an officer asks for a correction.', hi: 'हर आवेदन की स्थिति देखें और अधिकारी द्वारा सुधार माँगे जाने पर उत्तर दें।' })}
            </p>
          </div>
          <Button to="/schemes" variant="secondary" icon={Send}>{t('nav.apply')}</Button>
        </div>

        {error && <Alert tone="error">{t('err.network')}</Alert>}

        {loading ? (
          <PageLoader label={t('common.loading')} />
        ) : apps.length === 0 && !error ? (
          <div className="rounded-md border border-dashed border-line bg-white px-5 py-12 text-center">
            <FileText className="mx-auto h-9 w-9 text-[#9aa6b4]" aria-hidden="true" />
            <p className="mt-3 text-[15px] font-semibold text-ink">{tx({ en: 'No applications yet', hi: 'अभी तक कोई आवेदन नहीं' })}</p>
            <Button to="/schemes" className="mt-4">{t('nav.apply')}</Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {apps.map((app) => {
              const scheme = getSchemeByCode(app.scheme);
              const docs = app.documents || [];
              const fromDl = docs.filter((d) => d.source === 'digilocker').length;
              return (
                <li key={app._id} className="overflow-hidden rounded-md border border-line bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold uppercase tracking-wide text-ochre">
                        {scheme ? tx(scheme.short) : app.scheme}, {app.session || '2026-27'}
                      </p>
                      <p className="mt-0.5 text-[15px] font-semibold text-ink">{scheme ? tx(scheme.name) : app.scheme}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="space-y-4 px-5 py-4">
                    <ApplicationTracker status={app.status} schemeCode={app.scheme} />
                    <p className="text-[13px] leading-relaxed text-muted">{tx(STATUS_NOTE[app.status] || STATUS_NOTE.Pending)}</p>

                    {app.adminRemarks && (
                      <Alert tone={app.status === 'Deficient' ? 'warn' : 'info'} title={tx({ en: 'Remarks from the officer', hi: 'अधिकारी की टिप्पणी' })}>
                        {app.adminRemarks}
                      </Alert>
                    )}

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] sm:grid-cols-4">
                      <div>
                        <dt className="text-muted">{tx({ en: 'Application number', hi: 'आवेदन संख्या' })}</dt>
                        <dd className="font-semibold text-ink">{app.applicationCode}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">{tx({ en: 'Submitted on', hi: 'जमा तिथि' })}</dt>
                        <dd className="font-semibold text-ink">{formatDate(app.submittedAt || app.createdAt, lang)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">{tx({ en: 'Course', hi: 'पाठ्यक्रम' })}</dt>
                        <dd className="font-semibold text-ink">{app.course}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">{tx({ en: 'Documents', hi: 'दस्तावेज़' })}</dt>
                        <dd className="font-semibold text-ink">
                          {docs.length}
                          {fromDl > 0 && <span className="font-normal text-muted"> ({fromDl} DigiLocker)</span>}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-line bg-paper px-5 py-3">
                    <Button size="sm" variant="secondary" icon={Printer} to={`/applications/${app._id}/acknowledgement`}>
                      {tx({ en: 'Acknowledgement', hi: 'पावती' })}
                    </Button>
                    {app.status === 'Deficient' && scheme && (
                      <Button size="sm" icon={PencilLine} to={`/apply/${scheme.id}/documents`}>
                        {tx({ en: 'Correct and resubmit', hi: 'सुधारें और पुनः जमा करें' })}
                      </Button>
                    )}
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
