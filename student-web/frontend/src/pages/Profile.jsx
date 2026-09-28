import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Fingerprint, Save, ShieldCheck } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PortalLayout from '../components/layout/PortalLayout';
import { Field, FormSection, TextInput, TextArea, SelectInput, RadioGroup, Checkbox, binder } from '../components/ui/Field';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PageLoader from '../components/ui/PageLoader';
import { GENDERS, STATES } from '../config/options';
import { fetchProfile, updateProfile, verifyAadhaarKyc } from '../api/student';
import { apiErrorMessage } from '../api/axios';
import { formatDate, toInputDate } from '../utils/format';
import * as v from '../utils/validation';
import { DEMO_OTP } from '../config/demo';

function toForm(s = {}) {
  return {
    name: s.name || '',
    fatherName: s.fatherName || '',
    motherName: s.motherName || '',
    dob: toInputDate(s.dob),
    gender: s.gender || '',
    email: s.email || '',
    phone: s.phone || '',
    altPhone: s.altPhone || '',
    addressLine: s.address?.line || '',
    district: s.address?.district || '',
    state: s.address?.state || s.state || '',
    pincode: s.address?.pincode || '',
  };
}

function validate(f) {
  const errors = {};
  const rules = {
    name: v.required,
    dob: v.required,
    gender: v.required,
    phone: v.mobile,
    altPhone: v.optionalMobile,
    pincode: (val) => (v.isBlank(val) ? null : v.pincode(val)),
  };
  Object.entries(rules).forEach(([k, fn]) => {
    const e = fn(f[k]);
    if (e) errors[k] = e;
  });
  return errors;
}

function AadhaarKycModal({ open, onClose, onVerified }) {
  const { t, tx } = useLang();
  const [aadhaar, setAadhaar] = useState('');
  const [consent, setConsent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setAadhaar('');
      setConsent(false);
      setOtpSent(false);
      setOtp('');
      setError('');
    }
  }, [open]);

  const digits = aadhaar.replace(/\s/g, '');
  const pretty = (val) => val.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');

  const sendOtp = () => {
    if (!v.isValidAadhaar(digits)) return setError(t('err.aadhaar'));
    if (!consent) return setError(tx({ en: 'Please give consent to continue.', hi: 'आगे बढ़ने हेतु सहमति दें।' }));
    setError('');
    setOtpSent(true);
    return undefined;
  };

  const verify = async () => {
    if (otp !== DEMO_OTP) {
      setError(tx({ en: `Incorrect OTP. In demo mode the OTP is ${DEMO_OTP}.`, hi: `गलत ओटीपी। डेमो मोड में ओटीपी ${DEMO_OTP} है।` }));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const student = await verifyAadhaarKyc({ aadhaarNumber: digits, consent: true });
      onVerified(student);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err) || t('err.network'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissable={!busy}
      title={tx({ en: 'Aadhaar e-KYC', hi: 'आधार ई-केवाईसी' })}
      badge={<span className="rounded bg-ochre-soft px-1.5 py-0.5 text-[11px] font-semibold text-[#8a5a12]">{tx({ en: 'Demo', hi: 'डेमो' })}</span>}
      footer={
        otpSent ? (
          <Button icon={ShieldCheck} onClick={verify} loading={busy}>{tx({ en: 'Verify', hi: 'सत्यापित करें' })}</Button>
        ) : (
          <Button onClick={sendOtp}>{tx({ en: 'Send OTP', hi: 'ओटीपी भेजें' })}</Button>
        )
      }
    >
      <div className="space-y-4">
        <p className="text-[13px] leading-relaxed text-muted">
          {tx({
            en: 'An OTP is sent to the mobile number registered with Aadhaar. After verification your name, date of birth and gender are locked. Only the last 4 digits of Aadhaar are stored.',
            hi: 'आधार में पंजीकृत मोबाइल नंबर पर ओटीपी भेजा जाता है। सत्यापन के बाद आपका नाम, जन्मतिथि और लिंग लॉक हो जाते हैं। आधार के केवल अंतिम 4 अंक सहेजे जाते हैं।',
          })}
        </p>
        <Field label={tx({ en: 'Aadhaar number', hi: 'आधार नंबर' })} htmlFor="aadhaar" required>
          <TextInput id="aadhaar" value={aadhaar} onChange={setAadhaar} transform={pretty} inputMode="numeric" autoComplete="off" readOnly={otpSent} placeholder="XXXX XXXX XXXX" />
        </Field>
        {!otpSent && (
          <Checkbox id="aadhaar-consent" checked={consent} onChange={setConsent}>
            {tx({
              en: 'I consent to the Ministry of Tribal Affairs using my Aadhaar number for authentication with UIDAI for this scholarship.',
              hi: 'मैं इस छात्रवृत्ति हेतु यूआईडीएआई के साथ प्रमाणीकरण के लिए जनजातीय कार्य मंत्रालय द्वारा मेरे आधार नंबर के उपयोग की सहमति देता/देती हूँ।',
            })}
          </Checkbox>
        )}
        {otpSent && (
          <Field label={tx({ en: 'OTP', hi: 'ओटीपी' })} htmlFor="aadhaar-otp" required hint={tx({ en: `Demo mode: use ${DEMO_OTP}`, hi: `डेमो मोड: ${DEMO_OTP} उपयोग करें` })}>
            <TextInput id="aadhaar-otp" value={otp} onChange={setOtp} transform={(x) => x.replace(/\D/g, '').slice(0, 6)} inputMode="numeric" autoComplete="one-time-code" />
          </Field>
        )}
        {error && <p className="text-[12px] text-alert" role="alert">{error}</p>}
      </div>
    </Modal>
  );
}

export default function Profile() {
  const { t, tx, lang } = useLang();
  const { student, updateStudent } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(toForm(student));
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [kycOpen, setKycOpen] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        setProfile(p);
        setForm(toForm(p));
        updateStudent(p);
      })
      .catch(() => {
        setProfile(student);
        setMessage({ tone: 'warn', text: t('err.network') });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = (k, val) => {
    setForm((f) => ({ ...f, [k]: val }));
    setMessage(null);
  };
  const bind = binder(form, errors, setValue);
  const kyc = Boolean(profile?.aadhaarVerified);

  const completeness = useMemo(() => {
    const keys = ['name', 'fatherName', 'motherName', 'dob', 'gender', 'phone', 'addressLine', 'district', 'state', 'pincode'];
    const filled = keys.filter((k) => !v.isBlank(form[k])).length + (kyc ? 2 : 0);
    return Math.round((filled / (keys.length + 2)) * 100);
  }, [form, kyc]);

  const handleSave = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setMessage({ tone: 'error', text: t('err.fixBelow') });
      return false;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: form.name,
        fatherName: form.fatherName,
        motherName: form.motherName,
        dob: form.dob,
        gender: form.gender,
        phone: form.phone,
        altPhone: form.altPhone,
        state: form.state,
        address: { line: form.addressLine, district: form.district, state: form.state, pincode: form.pincode },
      });
      setProfile(updated);
      updateStudent(updated);
      setForm(toForm(updated));
      setMessage({ tone: 'success', text: tx({ en: 'Profile saved.', hi: 'प्रोफ़ाइल सहेजी गई।' }) });
      return true;
    } catch (err) {
      setMessage({ tone: 'error', text: apiErrorMessage(err) || t('err.network') });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const startKyc = async () => {
    const ok = await handleSave();
    if (ok) setKycOpen(true);
  };

  if (loading) {
    return (
      <PortalLayout>
        <PageLoader label={t('common.loading')} />
      </PortalLayout>
    );
  }

  const verifiedTag = kyc ? tx({ en: 'Aadhaar', hi: 'आधार' }) : null;

  return (
    <PortalLayout>
      <div className="space-y-5">
        <div>
          <h1 className="font-serif text-[24px] font-bold text-navy">{t('nav.profile')}</h1>
          <p className="mt-1 text-[14px] text-muted">
            {tx({ en: 'These details are used to pre-fill every scheme application.', hi: 'इन विवरणों से हर योजना का आवेदन पहले से भर जाता है।' })}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
          {/* e-KYC card */}
          <section className={`rounded-md border p-5 ${kyc ? 'border-leaf/30 bg-leaf-soft/50' : 'border-ochre/30 bg-ochre-soft/60'}`}>
            <div className="flex items-start gap-3">
              {kyc ? <BadgeCheck className="h-6 w-6 shrink-0 text-leaf" aria-hidden="true" /> : <Fingerprint className="h-6 w-6 shrink-0 text-ochre" aria-hidden="true" />}
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-bold text-ink">
                  {kyc ? tx({ en: 'Aadhaar e-KYC completed', hi: 'आधार ई-केवाईसी पूर्ण' }) : tx({ en: 'Complete Aadhaar e-KYC', hi: 'आधार ई-केवाईसी पूरा करें' })}
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {kyc
                    ? tx({
                        en: `Aadhaar XXXX XXXX ${profile.aadhaarLast4}, verified on ${formatDate(profile.aadhaarVerifiedAt, 'en')}. Name, date of birth and gender are locked.`,
                        hi: `आधार XXXX XXXX ${profile.aadhaarLast4}, ${formatDate(profile.aadhaarVerifiedAt, 'hi')} को सत्यापित। नाम, जन्मतिथि और लिंग लॉक हैं।`,
                      })
                    : tx({
                        en: 'Required before you can submit any application. Fill your name, date of birth and gender exactly as in Aadhaar first.',
                        hi: 'किसी भी आवेदन को जमा करने से पहले आवश्यक। पहले अपना नाम, जन्मतिथि और लिंग आधार के अनुसार भरें।',
                      })}
                </p>
                {!kyc && (
                  <Button className="mt-3" size="sm" icon={Fingerprint} onClick={startKyc} loading={saving}>
                    {tx({ en: 'Verify with Aadhaar OTP', hi: 'आधार ओटीपी से सत्यापित करें' })}
                  </Button>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-5">
            <p className="text-[13px] font-semibold text-ink">{tx({ en: 'Profile completeness', hi: 'प्रोफ़ाइल पूर्णता' })}</p>
            <p className="mt-1 font-serif text-[28px] font-bold text-navy">{completeness}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${completeness}%` }} />
            </div>
          </section>
        </div>

        {message && <Alert tone={message.tone}>{message.text}</Alert>}

        <section className="space-y-8 rounded-md border border-line bg-white p-5 sm:p-6">
          <FormSection title={tx({ en: 'Personal details', hi: 'व्यक्तिगत विवरण' })}>
            <Field label={tx({ en: 'Full name (as in Aadhaar)', hi: 'पूरा नाम (आधार अनुसार)' })} required htmlFor="name" error={errors.name} verified={verifiedTag}>
              <TextInput {...bind('name')} readOnly={kyc} autoComplete="name" />
            </Field>
            <Field label={tx({ en: 'Date of birth', hi: 'जन्मतिथि' })} required htmlFor="dob" error={errors.dob} verified={verifiedTag}>
              <TextInput {...bind('dob')} type="date" readOnly={kyc} />
            </Field>
            <Field label={tx({ en: "Father's name", hi: 'पिता का नाम' })} htmlFor="fatherName">
              <TextInput {...bind('fatherName')} />
            </Field>
            <Field label={tx({ en: "Mother's name", hi: 'माता का नाम' })} htmlFor="motherName">
              <TextInput {...bind('motherName')} />
            </Field>
            <Field label={tx({ en: 'Gender', hi: 'लिंग' })} required htmlFor="gender" error={errors.gender} verified={verifiedTag}>
              <RadioGroup {...bind('gender')} options={GENDERS} disabled={kyc} />
            </Field>
          </FormSection>

          <FormSection title={tx({ en: 'Contact', hi: 'संपर्क' })}>
            <Field label={tx({ en: 'Email (login ID)', hi: 'ईमेल (लॉगिन आईडी)' })} htmlFor="email">
              <TextInput {...bind('email')} readOnly />
            </Field>
            <Field label={tx({ en: 'Roll / enrolment number', hi: 'रोल / नामांकन संख्या' })} htmlFor="rollNumber">
              <TextInput id="rollNumber" value={profile?.rollNumber || ''} readOnly />
            </Field>
            <Field label={tx({ en: 'Mobile number', hi: 'मोबाइल नंबर' })} required htmlFor="phone" error={errors.phone}>
              <TextInput {...bind('phone')} transform={(x) => x.replace(/\D/g, '').slice(0, 10)} inputMode="numeric" />
            </Field>
            <Field label={tx({ en: 'Alternate mobile', hi: 'वैकल्पिक मोबाइल' })} optional htmlFor="altPhone" error={errors.altPhone}>
              <TextInput {...bind('altPhone')} transform={(x) => x.replace(/\D/g, '').slice(0, 10)} inputMode="numeric" />
            </Field>
          </FormSection>

          <FormSection title={tx({ en: 'Permanent address', hi: 'स्थायी पता' })}>
            <Field label={tx({ en: 'House / village, post office, block', hi: 'मकान / गाँव, डाकघर, ब्लॉक' })} htmlFor="addressLine" className="md:col-span-2">
              <TextArea {...bind('addressLine')} rows={2} />
            </Field>
            <Field label={tx({ en: 'State / UT', hi: 'राज्य / संघ राज्य क्षेत्र' })} htmlFor="state">
              <SelectInput {...bind('state')} options={STATES} />
            </Field>
            <Field label={tx({ en: 'District', hi: 'जिला' })} htmlFor="district">
              <TextInput {...bind('district')} />
            </Field>
            <Field label={tx({ en: 'PIN code', hi: 'पिन कोड' })} htmlFor="pincode" error={errors.pincode}>
              <TextInput {...bind('pincode')} transform={(x) => x.replace(/\D/g, '').slice(0, 6)} inputMode="numeric" />
            </Field>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-muted">
              {profile?.createdAt && tx({ en: `Registered on ${formatDate(profile.createdAt, lang)}`, hi: `पंजीकरण तिथि ${formatDate(profile.createdAt, lang)}` })}
            </p>
            <Button icon={Save} onClick={handleSave} loading={saving}>{t('common.save')}</Button>
          </div>
        </section>
      </div>

      <AadhaarKycModal
        open={kycOpen}
        onClose={() => setKycOpen(false)}
        onVerified={(s) => {
          setProfile(s);
          setForm(toForm(s));
          updateStudent(s);
          setMessage({ tone: 'success', text: tx({ en: 'Aadhaar e-KYC completed.', hi: 'आधार ई-केवाईसी पूर्ण हुआ।' }) });
        }}
      />
    </PortalLayout>
  );
}
