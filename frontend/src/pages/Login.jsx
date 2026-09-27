import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Enter your email/roll number and password');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <SiteHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-[#1c2b3a] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[14px] text-[#6b7a8d] mt-1">
              Log in to continue your application
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                Email or Roll Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or roll number"
                className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-[#dde1e7] rounded-lg pl-3 pr-10 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8d] hover:text-[#1c2b3a] p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-2.5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3557] hover:bg-[#102540] text-white rounded-lg py-3 text-[14px] font-medium disabled:opacity-50 min-h-[44px] cursor-pointer transition-colors shadow-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>

            {/* Link to Signup */}
            <p className="text-[13px] text-[#6b7a8d] text-center pt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#1a3557] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Login;
