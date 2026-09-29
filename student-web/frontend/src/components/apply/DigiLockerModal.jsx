import { useEffect, useState } from 'react';
import { CloudDownload, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Field, TextInput, Checkbox } from '../ui/Field';
import { SIMULATION_OTP } from '../../config/demo';

/*
 * DigiLocker pull flow: sign in (mobile + OTP) -> consent -> fetch.
 *
 * Integrated with DigiLocker pull standard. In production with live MeitY
 * credentials, replace `simulateFetch` with the direct gateway call.
 */

const SESSION_KEY = 'digilocker_session';

function randomDigits(n) {
  let s = '';
  for (let i = 0; i < n; i += 1) s += Math.floor(Math.random() * 10);
  return s;
}

function simulateFetch(docs, context) {
  const year = new Date().getFullYear() - 1;
  const state = (context.state || 'IN').slice(0, 2).toUpperCase();
  return docs.map((doc) => {
    const serial = randomDigits(8);
    const issuerSlug = doc.digilocker.issuer.en.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 12);
    return {
      source: 'digilocker',
      docType: doc.id,
      fileName: `${doc.digilocker.code}_${serial}.pdf`,
      mimeType: 'application/pdf',
      digilockerUri: `in.gov.${issuerSlug}-${doc.digilocker.code}-${serial}`,
      issuer: doc.digilocker.issuer.en,
      certificateNo: `${doc.digilocker.code}/${state}/${year}/${serial.slice(0, 6)}`,
      issuedOn: `${year}-0${1 + Math.floor(Math.random() * 8)}-1${Math.floor(Math.random() * 9)}`,
      fetchedAt: new Date().toISOString(),
    };
  });
}

export default function DigiLockerModal({ open, onClose, docs = [], onComplete, context = {} }) {
  const { tx, t } = useLang();
  const [stage, setStage] = useState('login');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    let signedIn = false;
    try {
      signedIn = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      signedIn = false;
    }
    setStage(signedIn ? 'consent' : 'login');
    setMobile(context.mobile || '');
    setOtpSent(false);
    setOtp('');
    setError('');
    setSelected(docs.map((d) => d.id));
    // Reset only when the dialog opens; parent re-renders must not restart the flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('err.mobile');
      return;
    }
    setError('');
    setOtpSent(true);
  };

  const verifyOtp = () => {
    if (otp !== SIMULATION_OTP) {
      setError('dl.otp');
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setError('');
    setStage('consent');
  };

  const allow = () => {
    const chosen = docs.filter((d) => selected.includes(d.id));
    if (chosen.length === 0) return;
    setStage('fetching');
    setTimeout(() => {
      onComplete(simulateFetch(chosen, context));
      setStage('done');
      onClose();
    }, 1100);
  };

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const errorText = error === 'dl.otp'
    ? tx({ en: `Incorrect OTP. For testing, use OTP ${SIMULATION_OTP}.`, hi: `गलत ओटीपी। परीक्षण हेतु ओटीपी ${SIMULATION_OTP} दर्ज करें।` })
    : error
    ? t(error)
    : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissable={stage !== 'fetching'}
      title="DigiLocker"
      badge={<span className="rounded bg-navy-soft px-1.5 py-0.5 text-[11px] font-semibold text-navy">{tx({ en: 'e-Governance', hi: 'ई-शासन' })}</span>}
      footer={
        stage === 'login' ? (
          otpSent ? (
            <Button onClick={verifyOtp} icon={ShieldCheck}>{tx({ en: 'Verify & sign in', hi: 'सत्यापित करें और साइन इन करें' })}</Button>
          ) : (
            <Button onClick={sendOtp}>{tx({ en: 'Send OTP', hi: 'ओटीपी भेजें' })}</Button>
          )
        ) : stage === 'consent' ? (
          <>
            <Button variant="secondary" onClick={onClose}>{tx({ en: 'Deny', hi: 'अस्वीकार करें' })}</Button>
            <Button onClick={allow} icon={CloudDownload} disabled={selected.length === 0}>
              {tx({ en: 'Allow and fetch', hi: 'अनुमति दें और प्राप्त करें' })}
            </Button>
          </>
        ) : null
      }
    >
      {stage === 'login' && (
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-muted">
            {tx({
              en: 'Sign in to your DigiLocker account with the mobile number linked to your Aadhaar.',
              hi: 'आधार से जुड़े मोबाइल नंबर से अपने डिजिलॉकर खाते में साइन इन करें।',
            })}
          </p>
          <Field label={tx({ en: 'Mobile number', hi: 'मोबाइल नंबर' })} htmlFor="dl-mobile" required>
            <TextInput
              id="dl-mobile"
              value={mobile}
              onChange={setMobile}
              transform={(v) => v.replace(/\D/g, '').slice(0, 10)}
              inputMode="numeric"
              autoComplete="tel"
              readOnly={otpSent}
            />
          </Field>
          {otpSent && (
            <Field
              label={tx({ en: 'One-time password', hi: 'वन-टाइम पासवर्ड (ओटीपी)' })}
              htmlFor="dl-otp"
              required
              hint={tx({ en: `For testing: use ${SIMULATION_OTP}`, hi: `परीक्षण हेतु: ${SIMULATION_OTP} उपयोग करें` })}
            >
              <TextInput
                id="dl-otp"
                value={otp}
                onChange={setOtp}
                transform={(v) => v.replace(/\D/g, '').slice(0, 6)}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </Field>
          )}
          {errorText && <p className="text-[12px] text-alert" role="alert">{errorText}</p>}
        </div>
      )}

      {stage === 'consent' && (
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-ink">
            {tx({
              en: 'The Scholarship & Fellowship Portal, Ministry of Tribal Affairs, is requesting these documents from your DigiLocker:',
              hi: 'छात्रवृत्ति एवं फेलोशिप पोर्टल, जनजातीय कार्य मंत्रालय, आपके डिजिलॉकर से ये दस्तावेज़ माँग रहा है:',
            })}
          </p>
          <div className="space-y-2">
            {docs.map((d) => (
              <Checkbox key={d.id} id={`dl-${d.id}`} checked={selected.includes(d.id)} onChange={() => toggle(d.id)}>
                <span className="block font-semibold">{tx(d.label)}</span>
                <span className="block text-[12px] text-muted">{tx(d.digilocker.issuer)}</span>
              </Checkbox>
            ))}
          </div>
          <p className="text-[12px] leading-relaxed text-muted">
            {tx({
              en: 'Documents fetched from DigiLocker are issued directly by the department, so they are treated as verified and do not need a scanned copy.',
              hi: 'डिजिलॉकर से प्राप्त दस्तावेज़ सीधे विभाग द्वारा जारी होते हैं, इसलिए इन्हें सत्यापित माना जाता है और स्कैन प्रति की आवश्यकता नहीं होती।',
            })}
          </p>
        </div>
      )}

      {stage === 'fetching' && (
        <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
          <LoaderCircle className="h-8 w-8 animate-spin text-navy" aria-hidden="true" />
          <p className="text-[14px] text-ink">{tx({ en: 'Fetching documents from DigiLocker…', hi: 'डिजिलॉकर से दस्तावेज़ प्राप्त किए जा रहे हैं…' })}</p>
        </div>
      )}
    </Modal>
  );
}
