import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { LayoutDashboard, Printer } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import PortalLayout from '../components/layout/PortalLayout';
import Emblem from '../components/layout/Emblem';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import StatusBadge from '../components/ui/StatusBadge';
import { getSchemeByCode } from '../config/schemes';
import { fetchMyApplication } from '../api/student';
import { apiErrorMessage } from '../api/axios';
import { fileHref, formatDate, formatINR, maskAccount } from '../utils/format';

const NEXT_STEP = {
  PRE_MATRIC: {
    en: 'Give a printed copy of this acknowledgement to your school nodal officer. The school, district and State will verify your application online.',
    hi: 'इस पावती की मुद्रित प्रति अपने विद्यालय नोडल अधिकारी को दें। विद्यालय, जिला और राज्य आपके आवेदन का ऑनलाइन सत्यापन करेंगे।',
  },
  NFST: {
    en: 'Your university nodal officer will verify the application online. Keep your original certificates ready for verification.',
    hi: 'आपके विश्वविद्यालय के नोडल अधिकारी आवेदन का ऑनलाइन सत्यापन करेंगे। सत्यापन हेतु मूल प्रमाण पत्र तैयार रखें।',
  },
  NOS: {
    en: 'The Ministry will scrutinise your application. Keep your offer letter and original documents ready in case you are called for an interview.',
    hi: 'मंत्रालय आपके आवेदन की जाँच करेगा। साक्षात्कार हेतु बुलाए जाने की स्थिति में प्रस्ताव पत्र और मूल दस्तावेज़ तैयार रखें।',
  },
};

function Row({ label, value }) {
  if (!value) return null;
  return (
    <tr className="border-b border-line last:border-b-0">
      <th scope="row" className="w-[38%] bg-paper px-3 py-2 text-left align-top text-[12px] font-medium text-muted">{label}</th>
      <td className="px-3 py-2 text-[13px] font-medium text-ink">{value}</td>
    </tr>
  );
}

export default function Acknowledgement() {
  const { id } = useParams();
  const location = useLocation();
  const { t, tx, lang } = useLang();
  const [app, setApp] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyApplication(id)
      .then(setApp)
      .catch((err) => setError(apiErrorMessage(err) || t('err.network')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <PortalLayout>
        <Alert tone="error">{error}</Alert>
      </PortalLayout>
    );
  }
  if (!app) {
    return (
      <PortalLayout>
        <PageLoader label={t('common.loading')} />
      </PortalLayout>
    );
  }

  const scheme = getSchemeByCode(app.scheme);
  const s = app.schemeData?.sections || {};
  const personal = s.personal || {};
  const category = s.category || {};
  const bank = s.bank || {};
  const docs = app.documents || [];
  const photo = docs.find((d) => d.docType === 'photo' && d.fileUrl);
  const signature = docs.find((d) => d.docType === 'signature' && d.fileUrl);

  return (
    <PortalLayout>
      <div className="space-y-4">
        {location.state?.justSubmitted && (
          <div className="no-print">
            <Alert tone="success" title={tx({ en: 'Application submitted successfully', hi: 'आवेदन सफलतापूर्वक जमा हुआ' })}>
              {tx({ en: 'Save or print this acknowledgement for your records.', hi: 'अपने रिकॉर्ड हेतु यह पावती सहेजें या प्रिंट करें।' })}
            </Alert>
          </div>
        )}

        <div className="no-print flex flex-wrap gap-2">
          <Button icon={Printer} onClick={() => window.print()}>{t('common.print')}</Button>
          <Button variant="secondary" icon={LayoutDashboard} to="/dashboard">{t('nav.dashboard')}</Button>
        </div>

        <article className="print-sheet overflow-hidden rounded-md border border-line bg-white">
          <header className="flex items-center gap-4 px-6 py-5">
            <Emblem />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-navy">जनजातीय कार्य मंत्रालय, भारत सरकार</p>
              <p className="text-[13px] font-semibold text-ink">Ministry of Tribal Affairs, Government of India</p>
              <p className="text-[12px] text-muted">{t('portal.name')}</p>
            </div>
          </header>
          <div className="tricolour" />

          <div className="space-y-6 px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-[20px] font-bold text-navy">{tx({ en: 'Application acknowledgement', hi: 'आवेदन पावती' })}</h1>
                <p className="mt-1 text-[13px] text-ink">{scheme ? tx(scheme.name) : app.scheme}</p>
                <p className="text-[12px] text-muted">{tx({ en: 'Session', hi: 'सत्र' })} {app.session || '2026-27'}</p>
              </div>
              <div className="flex gap-3">
                {photo && (
                  <img src={fileHref(photo.fileUrl)} alt={tx({ en: 'Applicant photograph', hi: 'आवेदक का फ़ोटो' })} className="h-28 w-24 border border-line object-cover" />
                )}
              </div>
            </div>

            <div className="grid gap-3 rounded-md border border-navy/20 bg-navy-soft/50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-[12px] text-muted">{tx({ en: 'Application number', hi: 'आवेदन संख्या' })}</p>
                <p className="text-[16px] font-bold tracking-wide text-navy">{app.applicationCode}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted">{tx({ en: 'Submitted on', hi: 'जमा तिथि' })}</p>
                <p className="text-[14px] font-semibold text-ink">{formatDate(app.submittedAt || app.createdAt, lang)}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted">{tx({ en: 'Current status', hi: 'वर्तमान स्थिति' })}</p>
                <StatusBadge status={app.status} className="mt-0.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-line">
                <tbody>
                  <Row label={tx({ en: 'Applicant name', hi: 'आवेदक का नाम' })} value={app.name} />
                  <Row label={tx({ en: "Father's / mother's name", hi: 'पिता / माता का नाम' })} value={[personal.fatherName, personal.motherName].filter(Boolean).join(' / ')} />
                  <Row label={tx({ en: 'Date of birth', hi: 'जन्मतिथि' })} value={formatDate(app.dob, lang)} />
                  <Row label={tx({ en: 'Gender', hi: 'लिंग' })} value={app.gender} />
                  <Row label={tx({ en: 'Category', hi: 'श्रेणी' })} value={[app.category || 'Scheduled Tribe', category.tribeName].filter(Boolean).join(', ')} />
                  <Row label={tx({ en: 'Mobile / email', hi: 'मोबाइल / ईमेल' })} value={[app.phone, app.email].filter(Boolean).join(' / ')} />
                  <Row label={tx({ en: 'Address', hi: 'पता' })} value={[personal.addressLine, app.district, app.state, personal.pincode].filter(Boolean).join(', ')} />
                  <Row label={tx({ en: 'Course', hi: 'पाठ्यक्रम' })} value={app.course} />
                  <Row label={tx({ en: 'School / university', hi: 'विद्यालय / विश्वविद्यालय' })} value={app.institution} />
                  <Row label={tx({ en: 'Annual family income', hi: 'वार्षिक पारिवारिक आय' })} value={category.familyIncome && category.isOrphan !== 'yes' ? formatINR(category.familyIncome) : ''} />
                  <Row label={tx({ en: 'Bank account', hi: 'बैंक खाता' })} value={bank.accountNumber ? `${maskAccount(bank.accountNumber)}, ${bank.ifsc}, ${bank.bankName}` : ''} />
                </tbody>
              </table>
            </div>

            {docs.length > 0 && (
              <div>
                <h2 className="text-[14px] font-bold text-navy">{tx({ en: 'Documents submitted', hi: 'जमा किए गए दस्तावेज़' })}</h2>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-ink">
                  {docs.map((d, i) => (
                    <li key={`${d.docType || d.name}-${i}`}>
                      {d.name}{' '}
                      <span className="text-muted">({d.source === 'digilocker' ? 'DigiLocker' : tx({ en: 'uploaded', hi: 'अपलोड' })})</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="rounded-md border border-line bg-paper p-4 text-[13px] leading-relaxed text-ink">
              <p className="font-semibold">{tx({ en: 'What happens next', hi: 'आगे क्या होगा' })}</p>
              <p className="mt-1 text-muted">{tx(NEXT_STEP[app.scheme] || NEXT_STEP.NFST)}</p>
            </div>

            <div className="flex items-end justify-between gap-6 border-t border-line pt-5 text-[12px] text-muted">
              <p className="max-w-md">
                {tx({
                  en: 'This is a system-generated acknowledgement and does not need a signature. It does not confirm eligibility or selection.',
                  hi: 'यह कंप्यूटर द्वारा बनाई गई पावती है, इस पर हस्ताक्षर आवश्यक नहीं है। यह पात्रता या चयन की पुष्टि नहीं करती।',
                })}
              </p>
              {signature && (
                <div className="text-center">
                  <img src={fileHref(signature.fileUrl)} alt="" className="h-12 max-w-[160px] object-contain" />
                  <p className="mt-1 border-t border-line pt-1">{tx({ en: 'Applicant signature', hi: 'आवेदक के हस्ताक्षर' })}</p>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </PortalLayout>
  );
}
