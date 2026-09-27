import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const STATES = ['Odisha', 'Jharkhand', 'Chhattisgarh', 'Madhya Pradesh', 'Other'];

const ApplicationForm = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const { student } = useAuth();

  const normalizedSchemeId = schemeId?.toLowerCase();
  const isValidScheme = normalizedSchemeId === 'nfst' || normalizedSchemeId === 'nos';

  const [form, setForm] = useState({
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    dob: student?.dob || '',
    gender: '',
    category: 'Scheduled Tribe',
    state: student?.state || '',
    district: '',
    course: '',
    institution: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || student.name || '',
        email: student.email || prev.email || '',
        phone: prev.phone || student.phone || '',
        dob: prev.dob || student.dob || '',
        state: prev.state || student.state || '',
      }));
    }
  }, [student]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // TODO: once a real backend endpoint exists (e.g. POST /api/student/applications), submit this data there instead of only saving to sessionStorage. sessionStorage is a temporary bridge so the Document Upload step (built next) can access this data before final submission.
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const requiredFields = ['name', 'email', 'phone', 'dob', 'gender', 'state', 'district', 'course', 'institution'];
    for (const field of requiredFields) {
      if (!form[field] || !String(form[field]).trim()) {
        setError('Please fill in all required fields');
        return;
      }
    }

    const applicationDraft = {
      ...form,
      category: 'Scheduled Tribe',
      scheme: normalizedSchemeId,
      schemeId: normalizedSchemeId,
    };

    sessionStorage.setItem('applicationDraft', JSON.stringify(applicationDraft));
    navigate(`/apply/${normalizedSchemeId}/documents`);
  };

  if (!isValidScheme) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
        <SiteHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
          <h1 className="text-[22px] font-bold text-[#1c2b3a] mb-2">Scheme not found</h1>
          <p className="text-[14px] text-[#6b7a8d] mb-6">
            The requested scholarship or fellowship scheme does not exist.
          </p>
          <Link
            to="/schemes"
            className="bg-[#1a3557] hover:bg-[#102540] text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors inline-block"
          >
            Back to Schemes
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const isNfst = normalizedSchemeId === 'nfst';
  const schemeTitle = isNfst ? 'NFST Scheme' : 'NOS Scheme';

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <SiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Banner */}
        <div className="bg-white border border-[#dde1e7] rounded-xl p-5 mb-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557] shrink-0">
              {isNfst ? <GraduationCap className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[12px] text-[#6b7a8d] block leading-tight">Applying for</span>
              <span className="text-[16px] font-semibold text-[#1c2b3a] leading-tight">{schemeTitle}</span>
            </div>
          </div>
          <Link
            to="/schemes"
            className="text-[13px] font-medium text-[#1a3557] hover:underline shrink-0"
          >
            Change scheme
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PERSONAL INFORMATION SECTION */}
          <div className="bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm mb-5">
            <h2 className="text-[16px] font-semibold text-[#1c2b3a] border-b border-[#dde1e7] pb-3 mb-5">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
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

              {/* Email */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] bg-[#f5f7fa] cursor-not-allowed outline-none"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="10-digit mobile number"
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={update('dob')}
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors bg-white"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Gender *
                </label>
                <select
                  value={form.gender}
                  onChange={update('gender')}
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Category (Fixed Badge) */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Category
                </label>
                <div className="bg-green-50 border border-green-200 text-green-700 text-[13px] font-medium px-3 py-2 rounded-lg inline-block w-full text-left">
                  Scheduled Tribe
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  State *
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

              {/* District */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  District *
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={update('district')}
                  placeholder="Enter district name"
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ACADEMIC INFORMATION SECTION */}
          <div className="bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm mb-5">
            <h2 className="text-[16px] font-semibold text-[#1c2b3a] border-b border-[#dde1e7] pb-3 mb-5">
              Academic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Course / Programme */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Course / Programme *
                </label>
                <input
                  type="text"
                  value={form.course}
                  onChange={update('course')}
                  placeholder="e.g. M.Phil Sociology, Ph.D. Physics"
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
              </div>

              {/* Institution Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#4b5563] mb-1.5">
                  Institution Name *
                </label>
                <input
                  type="text"
                  value={form.institution}
                  onChange={update('institution')}
                  placeholder="e.g. Central University of Odisha"
                  className="w-full border border-[#dde1e7] rounded-lg px-3 py-2.5 text-[14px] text-[#1c2b3a] placeholder-[#6b7a8d]/60 focus:border-[#1a3557] focus:ring-1 focus:ring-[#1a3557] outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-2.5 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#1a3557] hover:bg-[#102540] text-white rounded-lg px-6 py-3 text-[14px] font-medium min-h-[44px] inline-flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>Continue to Document Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
};

export default ApplicationForm;
