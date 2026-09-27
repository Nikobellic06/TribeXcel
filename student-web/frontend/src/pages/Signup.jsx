import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const STATES = ['Odisha', 'Jharkhand', 'Chhattisgarh', 'Madhya Pradesh', 'Other'];

const Signup = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', rollNumber: '',
    dob: '', state: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const required = ['name', 'email', 'phone', 'rollNumber', 'password', 'confirmPassword'];
    for (const field of required) {
      if (!form[field].trim()) {
        setError('Please fill in all required fields');
        return;
      }
    }
    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <SiteHeader />

      <main className="flex-1 py-8 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-[#1c2b3a] tracking-tight">
              Create your account
            </h1>
            <p className="text-[14px] text-[#6b7a8d] mt-1">
              Register to apply for scholarship &amp; fellowship schemes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Enter full name"
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Roll Number *
                </label>
                <input
                  type="text"
                  value={form.rollNumber}
                  onChange={update('rollNumber')}
                  placeholder="Enter roll number"
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="10-digit mobile number"
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={update('dob')}
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  State
                </label>
                <select
                  value={form.state}
                  onChange={update('state')}
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors bg-white"
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full-width Password fields with Eye/EyeOff toggles */}
            <div>
              <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  placeholder="Re-enter your password"
                  className="w-full border border-[#dde1e7] rounded-lg pl-3 pr-10 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a8d] hover:text-[#1c2b3a] p-1 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            {/* Link to Login */}
            <p className="text-[13px] text-[#6b7a8d] text-center pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1a3557] font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Signup;
