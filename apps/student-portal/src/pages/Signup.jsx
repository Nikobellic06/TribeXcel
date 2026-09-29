import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LanguageContext';
import AuthLayout from '../components/layout/AuthLayout';
import { Field, TextInput, SelectInput, binder } from '../components/ui/Field';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { STATES } from '../config/options';
import { apiErrorMessage } from '../api/axios';
import * as v from '../utils/validation';

const EMPTY = { name: '', email: '', rollNumber: '', phone: '', dob: '', state: '', password: '', confirmPassword: '' };

const Signup = () => {
  const { t, tx } = useLang();
  const { student, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Always route newly registered users to dashboard where they can review profile status and choose schemes
  const redirectTo = '/dashboard';
  if (student) return <Navigate to="/dashboard" replace />;

  const setValue = (k, val) => setForm((f) => ({ ...f, [k]: val }));
  const bind = binder(form, errors, setValue);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = {};
    if (v.required(form.name)) errs.name = 'err.required';
    const emailErr = v.email(form.email);
    if (emailErr) errs.email = emailErr;
    if (v.required(form.rollNumber)) errs.rollNumber = 'err.required';
    const mobileErr = v.mobile(form.phone);
    if (mobileErr) errs.phone = mobileErr;
    if (form.password.length < 6) errs.password = 'auth.passwordShort';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'auth.passwordMatch';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await signup({ ...form, email: form.email.trim(), rollNumber: form.rollNumber.trim() });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err) || t('err.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={tx({ en: 'Create your account', hi: 'अपना खाता बनाएं' })}
      subtitle={tx({ en: 'Register once and apply for any open scheme.', hi: 'एक बार पंजीकरण करें और किसी भी खुली योजना हेतु आवेदन करें।' })}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={tx({ en: 'Full name (as in Aadhaar)', hi: 'पूरा नाम (आधार अनुसार)' })} htmlFor="name" required error={errors.name} className="sm:col-span-2">
            <TextInput {...bind('name')} autoComplete="name" />
          </Field>
          <Field label={tx({ en: 'Email address', hi: 'ईमेल पता' })} htmlFor="email" required error={errors.email}>
            <TextInput {...bind('email')} type="email" autoComplete="email" />
          </Field>
          <Field label={tx({ en: 'Mobile number', hi: 'मोबाइल नंबर' })} htmlFor="phone" required error={errors.phone}>
            <TextInput {...bind('phone')} transform={(x) => x.replace(/\D/g, '').slice(0, 10)} inputMode="numeric" autoComplete="tel" />
          </Field>
          <Field
            label={tx({ en: 'Roll / enrolment number', hi: 'रोल / नामांकन संख्या' })}
            htmlFor="rollNumber"
            required
            error={errors.rollNumber}
            hint={tx({ en: 'From your school or university ID. You can log in with it.', hi: 'विद्यालय या विश्वविद्यालय पहचान पत्र से। इससे लॉगिन भी कर सकते हैं।' })}
          >
            <TextInput {...bind('rollNumber')} autoComplete="off" />
          </Field>
          <Field label={tx({ en: 'Date of birth', hi: 'जन्मतिथि' })} htmlFor="dob" optional>
            <TextInput {...bind('dob')} type="date" />
          </Field>
          <Field label={tx({ en: 'State / UT', hi: 'राज्य / संघ राज्य क्षेत्र' })} htmlFor="state" optional className="sm:col-span-2">
            <SelectInput {...bind('state')} options={STATES} />
          </Field>
          <Field label={tx({ en: 'Password', hi: 'पासवर्ड' })} htmlFor="password" required error={errors.password} hint={tx({ en: 'At least 6 characters.', hi: 'कम से कम 6 अक्षर।' })}>
            <PasswordInput {...bind('password')} autoComplete="new-password" />
          </Field>
          <Field label={tx({ en: 'Confirm password', hi: 'पासवर्ड की पुष्टि करें' })} htmlFor="confirmPassword" required error={errors.confirmPassword}>
            <PasswordInput {...bind('confirmPassword')} autoComplete="new-password" />
          </Field>
        </div>
        <Button type="submit" className="w-full" icon={UserPlus} loading={loading}>
          {tx({ en: 'Register', hi: 'पंजीकरण करें' })}
        </Button>
        <p className="text-center text-[13px] text-muted">
          {tx({ en: 'Already registered?', hi: 'पहले से पंजीकृत?' })}{' '}
          <Link to="/login" state={location.state} className="font-semibold text-navy hover:underline">
            {t('nav.login')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
