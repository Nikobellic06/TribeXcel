import { useEffect, useState } from 'react';
import { BadgeCheck, ChevronDown, ChevronUp, FileSearch, FileText, PencilLine, Printer, Send, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import PortalLayout from '../components/layout/PortalLayout';
import ApplicationTracker from '../components/ApplicationTracker';
import StatusBadge from '../components/ui/StatusBadge';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import { getSchemeByCode } from '../config/schemes';
import { fetchMyApplications } from '../api/student';
import { fileHref, formatDate } from '../utils/format';

const STATUS_NOTE = {
  Pending: { en: 'Your application is with the designated verifying officer for official scrutiny.', hi: 'आपका आवेदन आधिकारिक जाँच हेतु नामित सत्यापन अधिकारी के पास है।' },
  Eligible: { en: 'Preliminary verified and found eligible. Awaiting the final selection list.', hi: 'सत्यापित एवं पात्र पाया गया। अंतिम चयन सूची की प्रतीक्षा।' },
  Flagged: { en: 'Under closer review by the Ministry. No action is needed from you right now.', hi: 'मंत्रालय द्वारा विस्तृत समीक्षा जारी। अभी आपको कुछ करने की आवश्यकता नहीं।' },
  Deficient: { en: 'The verifying officer has requested a correction. Please update the affected document and resubmit within 15 days.', hi: 'सत्यापन अधिकारी ने सुधार का अनुरोध किया है। कृपया संबंधित दस्तावेज़ सुधारकर 15 दिनों में पुनः जमा करें।' },
  Selected: { en: 'Congratulations, you have been selected. Payment will be made to your bank account by DBT.', hi: 'बधाई हो, आपका चयन हुआ है। भुगतान डीबीटी से आपके बैंक खाते में होगा।' },
  Rejected: { en: 'Your application was not selected this session.', hi: 'इस सत्र में आपका आवेदन चयनित नहीं हुआ।' },
};

export default function MyApplications() {
  const { t, tx, lang } = useLang();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedApp, setExpandedApp] = useState(null);

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

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-paper px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" icon={Printer} to={`/applications/${app._id}/acknowledgement`}>
                        {tx({ en: 'Acknowledgement', hi: 'पावती' })}
                      </Button>
                      {docs.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={expandedApp === app._id ? ChevronUp : ChevronDown}
                          onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
                        >
                          {expandedApp === app._id
                            ? tx({ en: 'Hide Uploaded Documents', hi: 'अपलोड दस्तावेज़ छिपाएँ' })
                            : tx({ en: `View Uploaded Documents (${docs.length})`, hi: `दस्तावेज़ देखें (${docs.length})` })}
                        </Button>
                      )}
                    </div>
                    {app.status === 'Deficient' && scheme && (
                      <Button size="sm" icon={PencilLine} to={`/apply/${scheme.id}/documents`}>
                        {tx({ en: 'Correct and resubmit', hi: 'सुधारें और पुनः जमा करें' })}
                      </Button>
                    )}
                  </div>

                  {/* Expandable Document Inspection & AI Preliminary Verification Drawer */}
                  {expandedApp === app._id && (
                    <div className="border-t border-line bg-[#fbfcfd] p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileSearch className="h-4 w-4 text-navy" />
                          <h4 className="text-[13px] font-bold text-navy">
                            {tx({ en: 'Submitted Documents & Preliminary AI Verification', hi: 'जमा किए गए दस्तावेज़ एवं प्रारंभिक एआई सत्यापन' })}
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-muted">
                          {tx({ en: 'Subject to final Nodal Officer Scrutiny', hi: 'अंतिम नोडल अधिकारी जाँच के अधीन' })}
                        </span>
                      </div>

                      {docs.length === 0 ? (
                        <p className="text-[12.5px] text-muted italic">
                          {tx({ en: 'No documents attached.', hi: 'कोई दस्तावेज़ संलग्न नहीं है।' })}
                        </p>
                      ) : (
                        <div className="divide-y divide-line rounded border border-line bg-white">
                          {docs.map((doc, idx) => {
                            const isDl = doc.source === 'digilocker';
                            return (
                              <div key={idx} className="flex flex-col gap-2 p-3 text-[13px] sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-2.5">
                                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-ink">{doc.name || doc.docType || 'Document'}</span>
                                      {isDl && (
                                        <span className="rounded bg-navy-soft px-1.5 py-0.5 text-[10.5px] font-bold text-navy">
                                          DigiLocker
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11.5px] text-muted">
                                      {doc.docType ? `Type: ${doc.docType}` : ''} {doc.fileSize ? `• ${(doc.fileSize / 1024).toFixed(0)} KB` : ''}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                  {/* AI Preliminary check tag */}
                                  <span className="inline-flex items-center gap-1 rounded bg-leaf-soft px-2 py-0.5 text-[11px] font-semibold text-leaf border border-leaf/20">
                                    <ShieldCheck className="h-3 w-3" />
                                    {tx({ en: 'Preliminary Validated', hi: 'प्रारंभिक सत्यापित' })}
                                  </span>

                                  {(doc.fileUrl || doc.url) && (
                                    <a
                                      href={fileHref(doc.fileUrl || doc.url)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[12px] font-semibold text-navy hover:underline"
                                    >
                                      {tx({ en: 'View / Download', hi: 'देखें / डाउनलोड' })} &rarr;
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PortalLayout>
  );
}
