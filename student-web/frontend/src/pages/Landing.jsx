import { Link } from 'react-router-dom';
import { UserPlus, ShieldCheck, Award, ArrowRight, GraduationCap, Globe } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="py-10 md:py-16 px-4 sm:px-6 text-center max-w-4xl mx-auto">
          <h1 className="text-[28px] md:text-[36px] font-bold text-[#1c2b3a] leading-tight tracking-tight">
            Apply for NFST &amp; NOS Scholarships Online
          </h1>
          <p className="text-[15px] md:text-[16px] text-[#6b7a8d] mt-3 mb-8 max-w-xl mx-auto leading-relaxed">
            Register once, submit your application, upload documents, and track your status — all in one official portal for Tribal Education.
          </p>
          <div>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#1a3557] hover:bg-[#102540] text-white text-[15px] font-medium px-7 py-3.5 rounded-lg min-h-[44px] transition-colors shadow-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#1c2b3a]">
              How It Works
            </h2>
            <p className="text-[14px] text-[#6b7a8d] mt-1">
              Simple 3-step process to get your fellowship or scholarship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#1a3557]/10 flex items-center justify-center text-[#1a3557] mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-bold text-[#1a3557] bg-[#f5f7fa] px-2.5 py-1 rounded-full border border-[#dde1e7] mb-2">
                Step 01
              </span>
              <h3 className="text-[17px] font-semibold text-[#1c2b3a] mb-2">
                Register &amp; Apply
              </h3>
              <p className="text-[14px] text-[#6b7a8d] leading-relaxed">
                Create your student profile with basic details and choose your eligible scheme to start your application.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#1a3557]/10 flex items-center justify-center text-[#1a3557] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-bold text-[#1a3557] bg-[#f5f7fa] px-2.5 py-1 rounded-full border border-[#dde1e7] mb-2">
                Step 02
              </span>
              <h3 className="text-[17px] font-semibold text-[#1c2b3a] mb-2">
                Get Verified
              </h3>
              <p className="text-[14px] text-[#6b7a8d] leading-relaxed">
                Our system checks your documents automatically for seamless and transparent verification.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#1a3557]/10 flex items-center justify-center text-[#1a3557] mb-4">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-bold text-[#1a3557] bg-[#f5f7fa] px-2.5 py-1 rounded-full border border-[#dde1e7] mb-2">
                Step 03
              </span>
              <h3 className="text-[17px] font-semibold text-[#1c2b3a] mb-2">
                Get Selected
              </h3>
              <p className="text-[14px] text-[#6b7a8d] leading-relaxed">
                Track your status online, receive automated notifications, and obtain direct disbursement support.
              </p>
            </div>
          </div>
        </section>

        {/* AVAILABLE SCHEMES SECTION */}
        <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#1c2b3a]">
              Available Schemes
            </h2>
            <p className="text-[14px] text-[#6b7a8d] mt-1">
              National fellowship and overseas scholarship programs for ST students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scheme 1: NFST */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#1c2b3a]">NFST Scheme</h3>
                    <span className="inline-block text-[12px] font-medium text-[#16a34a] bg-green-50 border border-green-200 px-2 py-0.5 rounded mt-0.5">
                      Scheduled Tribe Students
                    </span>
                  </div>
                </div>
                <p className="text-[14px] text-[#6b7a8d] leading-relaxed mb-4">
                  National Fellowship for Higher Education of ST Students pursuing M.Phil. and Ph.D. degrees in Indian Universities and Institutions.
                </p>
              </div>
              <div className="pt-3 border-t border-[#dde1e7]">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1a3557] hover:underline"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Scheme 2: NOS */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#1c2b3a]">NOS Scheme</h3>
                    <span className="inline-block text-[12px] font-medium text-[#16a34a] bg-green-50 border border-green-200 px-2 py-0.5 rounded mt-0.5">
                      Scheduled Tribe Students
                    </span>
                  </div>
                </div>
                <p className="text-[14px] text-[#6b7a8d] leading-relaxed mb-4">
                  National Overseas Scholarship providing financial assistance to selected ST students for pursuing Post Graduate and Ph.D. courses abroad.
                </p>
              </div>
              <div className="pt-3 border-t border-[#dde1e7]">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1a3557] hover:underline"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA BAND */}
        <section className="bg-[#1a3557] text-white py-12 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-[22px] md:text-[26px] font-bold mb-3">
              Ready to apply?
            </h2>
            <p className="text-[14px] md:text-[15px] text-gray-200 mb-6">
              Create your account in minutes to start your fellowship or scholarship application.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-white text-[#1a3557] hover:bg-gray-100 font-semibold px-7 py-3 rounded-lg min-h-[44px] transition-colors shadow-sm"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Landing;
