import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Fingerprint, LayoutDashboard, Save, Send, ShieldCheck } from 'lucide-react';
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
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setAadhaar('');
      setConsent(false);
      setError('');
    }
  }, [open]);

  const digits = aadhaar.replace(/\s/g, '');
  const pretty = (val) => val.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleVerify = async () => {
    if (!v.isValidAadhaar(digits)) return setError(t('err.aadhaar'));
    if (!consent) return setError(tx({ en: 'Statutory consent is mandatory for authentication.', hi: 'प्रमाणीकरण हेतु वैधानिक सहमति अनिवार्य है।' }));
    setError('');
    setBusy(true);

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
      title={tx({ en: 'Aadhaar Format Validation', hi: 'आधार प्रारूप सत्यापन' })}
      badge={<span className="rounded bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-800 border border-navy-200">{tx({ en: 'Verhoeff Checksum', hi: 'वृहॉफ चेकसम' })}</span>}
      footer={
        <div className="flex w-full justify-between items-center">
          <Button variant="secondary" onClick={onClose} disabled={busy}>{tx({ en: 'Cancel', hi: 'रद्द करें' })}</Button>
          <Button icon={ShieldCheck} onClick={handleVerify} loading={busy} disabled={digits.length !== 12 || !consent}>
            {tx({ en: 'Validate Format', hi: 'प्रारूप सत्यापित करें' })}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-[13px] leading-relaxed text-slate-600">
          {tx({
            en: 'In compliance with the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016, your identity is authenticated for scholarship disbursement. Only the last 4 digits are retained in records.',
            hi: 'आधार अधिनियम 2016 के अनुपालन में, छात्रवृत्ति संवितरण हेतु आपकी पहचान सत्यापित की जाती है। रिकॉर्ड में केवल अंतिम 4 अंक सुरक्षित रखे जाते हैं।',
          })}
        </p>
        <Field label={tx({ en: 'Aadhaar Number (12 Digits)', hi: 'आधार नंबर (12 अंक)' })} htmlFor="aadhaar" required>
          <TextInput id="aadhaar" value={aadhaar} onChange={setAadhaar} transform={pretty} inputMode="numeric" autoComplete="off" placeholder="XXXX XXXX XXXX" />
        </Field>
        <Checkbox id="aadhaar-consent" checked={consent} onChange={setConsent}>
          {tx({
            en: 'I hereby declare that I am submitting my Aadhaar voluntarily to the Ministry of Tribal Affairs for identity verification and DBT linking for the scholarship programme.',
            hi: 'मैं एतद्द्वारा घोषणा करता/करती हूँ कि मैं छात्रवृत्ति योजना हेतु पहचान सत्यापन एवं डीबीटी लिंकिंग के लिए जनजातीय कार्य मंत्रालय को स्वेच्छा से अपना आधार प्रस्तुत कर रहा/रही हूँ।',
          })}
        </Checkbox>
        {error && <p className="text-[12px] text-red-600 font-medium" role="alert">{error}</p>}
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
                  {kyc ? tx({ en: 'Aadhaar format validated', hi: 'आधार प्रारूप सत्यापित' }) : tx({ en: 'Validate Aadhaar format', hi: 'आधार प्रारूप सत्यापित करें' })}
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {kyc
                    ? tx({
                        en: `Aadhaar ending in ${profile.aadhaarLast4} (Verhoeff checksum validated on ${formatDate(profile.formatValidatedAt || profile.aadhaarVerifiedAt, 'en')}).`,
                        hi: `आधार अंतिम 4 अंक: ${profile.aadhaarLast4} (वृहॉफ चेकसम ${formatDate(profile.formatValidatedAt || profile.aadhaarVerifiedAt, 'hi')} को सत्यापित)।`,
                      })
                    : tx({
                        en: 'Format validation confirms valid 12-digit Aadhaar with Verhoeff checksum. Name, date of birth and gender should match your documents.',
                        hi: 'प्रारूप सत्यापन 12-अंकीय आधार और वृहॉफ चेकसम की पुष्टि करता है।',
                      })}
                </p>
                {!kyc && (
                  <Button className="mt-3" size="sm" icon={Fingerprint} onClick={startKyc} loading={saving}>
                    {tx({ en: 'Validate Aadhaar Format', hi: 'आधार प्रारूप सत्यापित करें' })}
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
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="secondary" to="/dashboard" icon={LayoutDashboard}>
                {tx({ en: 'Dashboard', hi: 'डैशबोर्ड' })}
              </Button>
              <Button variant="secondary" to="/schemes" icon={Send}>
                {tx({ en: 'Explore Schemes', hi: 'योजनाएं देखें' })}
              </Button>
              <Button icon={Save} onClick={handleSave} loading={saving}>{t('common.save')}</Button>
            </div>
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
