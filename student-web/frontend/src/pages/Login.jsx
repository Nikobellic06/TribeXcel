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
  const { student, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || '/dashboard';
  if (student) return <Navigate to={redirectTo} replace />;

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
        {error && <Alert tone="error">{error}</Alert>}
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
