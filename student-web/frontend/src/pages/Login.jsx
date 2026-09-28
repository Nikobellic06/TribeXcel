import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LanguageContext';
import AuthLayout from '../components/layout/AuthLayout';
import { Field, TextInput } from '../components/ui/Field';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { apiErrorMessage } from '../api/axios';

const Login = () => {
  const { t, tx } = useLang();
  const { student, login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || '/dashboard';
  if (student) return <Navigate to={redirectTo} replace />;

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginDemo();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err) || t('err.network'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setIdentifier('applicant1@demo.tribexcel.in');
    setPassword('Demo@12345');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError(tx({ en: 'Enter your email or roll number and password.', hi: 'अपना ईमेल या रोल नंबर और पासवर्ड दर्ज करें।' }));
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // If server unreachable or demo user, let them easily fallback
      setError(apiErrorMessage(err) || t('err.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={tx({ en: 'Student login', hi: 'छात्र लॉगिन' })}
      subtitle={tx({ en: 'Use the email or roll number you registered with.', hi: 'पंजीकरण में दिया गया ईमेल या रोल नंबर उपयोग करें।' })}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="space-y-2">
            <Alert tone="error">{error}</Alert>
            <div className="rounded border border-ochre/30 bg-ochre-soft p-3 text-[12.5px] text-ink">
              <p className="font-semibold text-ochre">
                {tx({ en: 'Offline / Testing without backend?', hi: 'ऑफ़लाइन या बिना बैकएंड परीक्षण कर रहे हैं?' })}
              </p>
              <p className="mt-0.5 text-muted">
                {tx({
                  en: 'You can proceed instantly with pre-populated ST applicant credentials.',
                  hi: 'आप पूर्व-निर्धारित एसटी छात्र क्रेडेंशियल्स के साथ तुरंत आगे बढ़ सकते हैं।',
                })}
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="mt-2 inline-flex items-center gap-1.5 rounded bg-navy px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-navy/90"
              >
                {tx({ en: 'Log In with Demo ST Applicant', hi: 'डेमो एसटी छात्र के रूप में लॉगिन करें' })} &rarr;
              </button>
            </div>
          </div>
        )}

        {/* SIH Evaluator / Quick Access Box */}
        <div className="rounded-md border border-line bg-paper p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-muted">
              {tx({ en: 'SIH Evaluator Quick Access', hi: 'एसआईएच मूल्यांकनकर्ता त्वरित पहुँच' })}
            </span>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-[12px] font-bold text-navy hover:underline"
            >
              {tx({ en: '1-Click Demo Login', hi: '1-क्लिक डेमो लॉगिन' })} &rarr;
            </button>
          </div>
          <p className="mt-1 text-[12px] text-muted">
            {tx({
              en: 'Applicant: Sunita Murmu (ST Santhal, Jharkhand • Aadhaar e-KYC Verified)',
              hi: 'आवेदक: सुनीता मुर्मू (एसटी संथाल, झारखंड • आधार ई-केवाईसी सत्यापित)',
            })}
          </p>
        </div>

        <Field label={tx({ en: 'Email or roll number', hi: 'ईमेल या रोल नंबर' })} htmlFor="identifier" required>
          <TextInput id="identifier" value={identifier} onChange={setIdentifier} autoComplete="username" />
        </Field>
        <Field label={tx({ en: 'Password', hi: 'पासवर्ड' })} htmlFor="password" required>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </Field>
        <Button type="submit" className="w-full" icon={LogIn} loading={loading}>
          {t('nav.login')}
        </Button>
        <p className="text-center text-[13px] text-muted">
          {tx({ en: 'New to the portal?', hi: 'पोर्टल पर नए हैं?' })}{' '}
          <Link to="/signup" state={location.state} className="font-semibold text-navy hover:underline">
            {tx({ en: 'Create an account', hi: 'खाता बनाएं' })}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
