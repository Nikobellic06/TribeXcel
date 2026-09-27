import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#dde1e7] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-slate-50 border border-[#dde1e7] flex items-center justify-center shrink-0">
              <Shield size={28} className="text-[#1a3557]" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-[#1c2b3a] leading-tight">
                Scholarship & Fellowship Management System
              </div>
              <div className="text-[11px] text-[#6b7a8d] mt-0.5">
                Ministry of Tribal Affairs · Government of India
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <div className="text-[13px] font-medium text-[#4b5563]">भारत सरकार</div>
            <div className="text-[11px] text-[#6b7a8d]">Government of India</div>
          </div>
        </div>
      </header>

      {/* Tricolour Strip Header */}
      <div className="flex w-full">
        <div className="h-[3px] flex-1 bg-[#FF9933]" />
        <div className="h-[3px] flex-1 bg-[#FFFFFF]" />
        <div className="h-[3px] flex-1 bg-[#138808]" />
      </div>

      {/* ── Main Form Area ────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[380px] bg-white border border-[#dde1e7] rounded-lg p-8 shadow-xs">
          <div className="mb-6">
            <h1 className="text-[16px] font-semibold text-[#1c2b3a]">
              Administrator Sign In
            </h1>
            <p className="text-[12px] text-[#6b7a8d] mt-1">
              Authorised personnel only
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-[12px] font-medium text-[#4b5563] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#dde1e7] rounded px-3 py-2.5 text-[13px] text-[#1c2b3a] outline-none focus:border-[#1a3557] transition-colors"
                placeholder="admin@mota.gov.in"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-[12px] font-medium text-[#4b5563] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#dde1e7] rounded px-3 py-2.5 text-[13px] text-[#1c2b3a] outline-none focus:border-[#1a3557] transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-[12px] text-red-600 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3557] text-white rounded py-2.5 text-[13px] font-medium hover:bg-[#102540] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer>
        {/* Tricolour Strip Footer */}
        <div className="flex w-full">
          <div className="h-[3px] flex-1 bg-[#FF9933]" />
          <div className="h-[3px] flex-1 bg-[#FFFFFF]" />
          <div className="h-[3px] flex-1 bg-[#138808]" />
        </div>

        <div className="bg-white border-t border-[#dde1e7] px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-[11px] text-[#6b7a8d]">
              © 2026 Ministry of Tribal Affairs, Government of India
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#6b7a8d]">
              <a href="#" className="hover:text-[#1a3557] transition-colors">
                Privacy Policy
              </a>
              <span className="text-[#dde1e7]">|</span>
              <a href="#" className="hover:text-[#1a3557] transition-colors">
                Terms of Use
              </a>
              <span className="text-[#dde1e7]">|</span>
              <a href="#" className="hover:text-[#1a3557] transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
