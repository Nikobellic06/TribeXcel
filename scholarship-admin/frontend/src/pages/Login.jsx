import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Landmark, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/axios';
import Button from '../components/ui/Button';
import { Input, Label } from '../components/ui/Form';
import { Notice } from '../components/ui/States';

export default function Login() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const next = params.get('next');
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  if (admin) return <Navigate to={target} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your official email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header>
        <div className="bg-navy-deep text-[11.5px] text-slate-300">
          <div className="mx-auto flex h-7 max-w-5xl items-center justify-between px-4">
            <span>Government of India</span>
            <span>Ministry of Tribal Affairs</span>
          </div>
        </div>
        <div className="bg-navy">
          <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-warn-line/70 bg-white/10">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold leading-tight">Scholarship Administration Portal</span>
              <span className="block text-[12px] leading-tight text-slate-300">National Scholarship &amp; Fellowship Scheme for ST Students</span>
            </span>
          </div>
        </div>
        <div className="tricolour" />
      </header>

      <main id="main-content" className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl overflow-hidden rounded border border-line bg-white md:grid-cols-[1fr_1.1fr]">
          <div className="hidden border-r border-line bg-navy-soft/50 p-7 md:block">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-navy-2">Authorised officials only</p>
            <h2 className="mt-2 text-[18px] font-semibold text-ink">Application verification and selection</h2>
            <ul className="mt-5 space-y-3 text-[13px] leading-relaxed text-ink">
              <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />Review applications for Pre-Matric, NFST and NOS schemes.</li>
              <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />AI-assisted checks and rule evaluation are preliminary. The officer records the final decision.</li>
              <li className="flex gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />Every decision is recorded with the officer&apos;s name and time.</li>
            </ul>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-[18px] font-semibold text-ink">Officer login</h1>
            <p className="mt-0.5 text-[12.5px] text-muted">Sign in with your official credentials.</p>
            {params.get('expired') && <Notice tone="warn" className="mt-4">Your session has ended. Please sign in again.</Notice>}
            <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
              {error && <Notice tone="bad">{error}</Notice>}
              <div>
                <Label htmlFor="email" required>Official email</Label>
                <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@tribal.gov.in" />
              </div>
              <div>
                <Label htmlFor="password" required>Password</Label>
                <div className="relative">
                  <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-navy" aria-label={show ? 'Hide password' : 'Show password'}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full" icon={Lock} loading={loading}>Login</Button>
              <p className="text-[12px] text-muted">
                Forgot your password? Password resets are done by the portal administrator. Contact your nodal system administrator.
              </p>
            </form>
            <div className="mt-6 border-t border-line pt-4 text-[11.5px] leading-relaxed text-muted">
              <p className="font-semibold text-ink">Security notice</p>
              <p className="mt-0.5">
                This is a Government of India system for authorised use only. Do not share your credentials. Repeated failed
                logins are temporarily blocked, and application decisions are recorded against your account.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-line bg-white py-3 text-center text-[11.5px] text-muted">
        Ministry of Tribal Affairs, Government of India (Smart India Hackathon prototype, SIH26239)
      </footer>
    </div>
  );
}
