import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Globe, CheckCircle } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const SchemeSelection = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <SiteHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Back to Dashboard Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6b7a8d] hover:text-[#1a3557] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#1c2b3a] tracking-tight">
            Choose a Scheme
          </h1>
          <p className="text-[14px] text-[#6b7a8d] mt-1">
            Select the scholarship or fellowship you're eligible for to begin your application.
          </p>
        </div>

        {/* Scheme Cards Stacked Vertically */}
        <div className="space-y-6">
          {/* NFST Card */}
          <div className="bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557] shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#1c2b3a]">NFST Scheme</h2>
                  <span className="inline-block text-[12px] font-medium text-[#16a34a] bg-green-50 border border-green-200 px-2 py-0.5 rounded mt-0.5">
                    Scheduled Tribe Students
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[14px] text-[#6b7a8d] leading-relaxed mb-6">
              National Fellowship for Higher Education of ST Students pursuing M.Phil. and Ph.D. degrees in Indian Universities and Institutions.
            </p>

            {/* Eligibility Section */}
            <div className="bg-[#f5f7fa] border border-[#dde1e7] rounded-lg p-4 mb-6">
              <h3 className="text-[13px] font-semibold text-[#1c2b3a] mb-2.5">
                Eligibility Requirements:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-[13px] text-[#4b5563]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>Scheduled Tribe category</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#4b5563]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>Pursuing M.Phil or Ph.D</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#4b5563]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>Enrolled in a recognised Indian institution</span>
                </li>
              </ul>
            </div>

            {/* Apply Button */}
            <div>
              <Link
                to="/apply/nfst"
                className="inline-flex items-center justify-center bg-[#1a3557] hover:bg-[#102540] text-white rounded-lg px-6 py-3 text-[14px] font-medium min-h-[44px] transition-colors shadow-sm w-full sm:w-auto"
              >
                Apply for this Scheme
              </Link>
            </div>
          </div>

          {/* NOS Card */}
          <div className="bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557] shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#1c2b3a]">NOS Scheme</h2>
                  <span className="inline-block text-[12px] font-medium text-[#16a34a] bg-green-50 border border-green-200 px-2 py-0.5 rounded mt-0.5">
                    Scheduled Tribe Students
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[14px] text-[#6b7a8d] leading-relaxed mb-6">
              National Overseas Scholarship providing financial assistance to selected ST students for pursuing Post Graduate and Ph.D. courses abroad.
            </p>

            {/* Eligibility Section */}
            <div className="bg-[#f5f7fa] border border-[#dde1e7] rounded-lg p-4 mb-6">
              <h3 className="text-[13px] font-semibold text-[#1c2b3a] mb-2.5">
                Eligibility Requirements:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-[13px] text-[#4b5563]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>Scheduled Tribe category</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#4b5563]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>Admission secured in an overseas institution</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#4b5563]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                  <span>Family income within prescribed limit</span>
                </li>
              </ul>
            </div>

            {/* Apply Button */}
            <div>
              <Link
                to="/apply/nos"
                className="inline-flex items-center justify-center bg-[#1a3557] hover:bg-[#102540] text-white rounded-lg px-6 py-3 text-[14px] font-medium min-h-[44px] transition-colors shadow-sm w-full sm:w-auto"
              >
                Apply for this Scheme
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default SchemeSelection;
