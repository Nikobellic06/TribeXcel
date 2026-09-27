import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  HelpCircle,
  PlusCircle,
  ChevronRight,
  Check,
  FileCheck,
  AlertTriangle,
  AlertCircle,
  Award,
  Download,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import api from '../api/axios';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const Dashboard = () => {
  const { student } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/student/applications');
        setApplications(response.data?.applications || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load application details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const hasApplication = applications.length > 0;
  const application = hasApplication ? applications[0] : null;

  // Step states for Progress Tracker:
  // Step 1 "Account Created" — always complete (student logged in)
  // Step 2 "Application Submitted" — complete if application exists
  // Step 3 "Verification" — complete if status is anything other than "Pending"
  // Step 4 "Selection" — complete only if status is exactly "Selected"
  const step1State = 'complete';
  const step2State = hasApplication ? 'complete' : 'current';
  const step3State = hasApplication
    ? application.status !== 'Pending'
      ? 'complete'
      : 'current'
    : 'locked';
  const step4State = hasApplication
    ? application.status === 'Selected'
      ? 'complete'
      : application.status !== 'Pending'
      ? 'current'
      : 'locked'
    : 'locked';

  const renderStepCircle = (state) => {
    if (state === 'complete') {
      return (
        <div className="w-7 h-7 rounded-full bg-[#1a3557] text-white flex items-center justify-center shadow-xs shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      );
    }
    if (state === 'current') {
      return (
        <div className="w-7 h-7 rounded-full border-2 border-[#1a3557] bg-white flex items-center justify-center shadow-xs shrink-0" />
      );
    }
    return (
      <div className="w-7 h-7 rounded-full border-2 border-[#dde1e7] bg-white flex items-center justify-center shrink-0" />
    );
  };

  const getStepLabelClass = (state) => {
    return state === 'locked'
      ? 'text-[13px] font-medium text-[#9aa3af]'
      : 'text-[13px] font-medium text-[#1c2b3a]';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Eligible':
        return 'bg-blue-50 text-blue-700';
      case 'Deficient':
        return 'bg-amber-50 text-amber-700';
      case 'Flagged':
        return 'bg-red-50 text-red-700';
      case 'Selected':
        return 'bg-green-50 text-green-700';
      case 'Rejected':
      case 'Pending':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <SiteHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#1c2b3a] tracking-tight">
            Welcome, {student?.name || 'Student'}
          </h1>
          <p className="text-[13px] text-[#6b7a8d] mt-1">
            Roll No: <span className="font-medium text-[#1c2b3a]">{student?.rollNumber || 'N/A'}</span>
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white border border-[#dde1e7] rounded-xl p-8 shadow-sm mb-6 text-center text-[14px] text-[#6b7a8d]">
            Loading...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Progress Tracker Card */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-[16px] font-semibold text-[#1c2b3a] mb-6 border-b border-[#dde1e7] pb-3">
                Application Progress
              </h2>

              {/* Desktop Tracker (sm breakpoint and above) */}
              <div className="hidden sm:block relative px-4 py-2">
                {/* Horizontal Connecting Line */}
                <div className="absolute top-[20px] left-[12.5%] right-[12.5%] h-[2px] -translate-y-1/2 z-0 flex">
                  <div className={`w-1/3 h-full ${step2State !== 'locked' ? 'bg-[#1a3557]' : 'bg-[#dde1e7]'}`} />
                  <div className={`w-1/3 h-full ${step3State === 'complete' || step3State === 'current' ? 'bg-[#1a3557]' : 'bg-[#dde1e7]'}`} />
                  <div className={`w-1/3 h-full ${step4State === 'complete' || step4State === 'current' ? 'bg-[#1a3557]' : 'bg-[#dde1e7]'}`} />
                </div>

                <div className="grid grid-cols-4 relative z-10 text-center">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className="mb-2">{renderStepCircle(step1State)}</div>
                    <span className={getStepLabelClass(step1State)}>Account Created</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className="mb-2">{renderStepCircle(step2State)}</div>
                    <span className={getStepLabelClass(step2State)}>Application Submitted</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className="mb-2">{renderStepCircle(step3State)}</div>
                    <span className={getStepLabelClass(step3State)}>Verification</span>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center">
                    <div className="mb-2">{renderStepCircle(step4State)}</div>
                    <span className={getStepLabelClass(step4State)}>Selection</span>
                  </div>
                </div>
              </div>

              {/* Mobile Tracker (below sm breakpoint) */}
              <div className="sm:hidden relative pl-3 py-2 space-y-6">
                {/* Vertical Connecting Line */}
                <div className="absolute top-[26px] bottom-[26px] left-[26px] w-[2px] z-0 flex flex-col">
                  <div className={`h-1/3 w-full ${step2State !== 'locked' ? 'bg-[#1a3557]' : 'bg-[#dde1e7]'}`} />
                  <div className={`h-1/3 w-full ${step3State === 'complete' || step3State === 'current' ? 'bg-[#1a3557]' : 'bg-[#dde1e7]'}`} />
                  <div className={`h-1/3 w-full ${step4State === 'complete' || step4State === 'current' ? 'bg-[#1a3557]' : 'bg-[#dde1e7]'}`} />
                </div>

                {/* Step 1 */}
                <div className="flex items-center gap-4 relative z-10">
                  {renderStepCircle(step1State)}
                  <span className={getStepLabelClass(step1State)}>Account Created</span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4 relative z-10">
                  {renderStepCircle(step2State)}
                  <span className={getStepLabelClass(step2State)}>Application Submitted</span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4 relative z-10">
                  {renderStepCircle(step3State)}
                  <span className={getStepLabelClass(step3State)}>Verification</span>
                </div>

                {/* Step 4 */}
                <div className="flex items-center gap-4 relative z-10">
                  {renderStepCircle(step4State)}
                  <span className={getStepLabelClass(step4State)}>Selection</span>
                </div>
              </div>
            </div>

            {/* Application Status Card */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm mb-6">
              <h2 className="text-[16px] font-semibold text-[#1c2b3a] mb-6 border-b border-[#dde1e7] pb-3">
                Application Status
              </h2>

              {!hasApplication ? (
                /* CASE A — Empty State */
                <div className="flex flex-col items-center justify-center text-center py-8 px-4">
                  <div className="p-4 rounded-full bg-[#f5f7fa] border border-[#dde1e7] mb-4">
                    <FileText className="w-[40px] h-[40px] text-[#c0c8d2]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#1c2b3a] mb-1">
                    You haven't started an application yet
                  </h3>
                  <p className="text-[13px] text-[#6b7a8d] max-w-sm mb-6 leading-relaxed">
                    Select a scholarship or fellowship scheme below to begin your online application process.
                  </p>
                  <Link
                    to="/schemes"
                    className="inline-flex items-center gap-2 bg-[#1a3557] hover:bg-[#102540] text-white text-[14px] font-medium px-5 py-2.5 rounded-lg min-h-[44px] transition-colors shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Start Application
                  </Link>
                </div>
              ) : (
                /* CASE B — Real Application Details */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0f2f5]">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-[16px] font-semibold text-[#1c2b3a]">
                          {application.scheme ? `${application.scheme} Scheme` : 'Scholarship Scheme'}
                        </h3>
                        <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full ${getStatusBadgeClass(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[13px] text-[#6b7a8d] flex-wrap">
                        <span>Application ID: <span className="font-medium text-[#1c2b3a]">{application.applicationCode}</span></span>
                        {(application.submittedAt || application.createdAt) && (
                          <>
                            <span>•</span>
                            <span>Submitted on {formatDate(application.submittedAt || application.createdAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contextual Message & Actions */}
                  {application.status === 'Deficient' && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-[13px] text-amber-700">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>Some documents need attention. Please review and resubmit.</span>
                      </div>
                      <Link
                        to={`/apply/${application.scheme?.toLowerCase()}/documents`}
                        className="bg-white border border-[#dde1e7] text-[#4b5563] hover:bg-gray-50 rounded-lg px-4 py-2 text-[13px] font-medium min-h-[38px] inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 text-center shadow-xs"
                      >
                        Update Documents
                      </Link>
                    </div>
                  )}

                  {application.status === 'Eligible' && (
                    <div className="bg-blue-50/40 border border-blue-100 rounded-lg p-4 text-[13px] text-[#6b7a8d]">
                      Your application has passed initial verification and is awaiting admin review.
                    </div>
                  )}

                  {application.status === 'Selected' && (
                    <div className="space-y-4">
                      <div className="bg-green-50/70 border border-green-200/90 rounded-lg p-4 flex items-center gap-2.5 text-[14px] text-green-800 font-medium">
                        <Award className="w-5 h-5 shrink-0 text-green-600" />
                        <span>Congratulations! You have been selected for the {application.scheme} Fellowship.</span>
                      </div>

                      {/* Post-Selection Fellowship & Disbursement Tracking */}
                      <div className="border border-[#dde1e7] rounded-xl p-5 bg-[#fafbfc]">
                        <h4 className="text-[13px] font-semibold text-[#1c2b3a] uppercase tracking-wide mb-3 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#1a3557]" />
                          Post-Selection Fellowship &amp; Disbursement Tracking
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[12px] mb-4">
                          <div className="bg-white p-3 rounded-lg border border-[#dde1e7]">
                            <span className="text-[#6b7a8d] block mb-1">Award Number</span>
                            <span className="font-semibold text-[#1c2b3a]">
                              {application.fellowship?.awardNumber || `MOTA/${application.scheme}/2026/${application.applicationCode?.slice(-4)}`}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-[#dde1e7]">
                            <span className="text-[#6b7a8d] block mb-1">Monthly Fellowship Stipend</span>
                            <span className="font-semibold text-emerald-700">
                              Rs. {Number(application.fellowship?.monthlyStipend || 31000).toLocaleString('en-IN')} / mo
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-[#dde1e7]">
                            <span className="text-[#6b7a8d] block mb-1">Disbursement Status</span>
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ● {application.fellowship?.disbursementStatus || 'Active (PFMS DBT)'}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-[#dde1e7]">
                            <span className="text-[#6b7a8d] block mb-1">PFMS Payment Gateway</span>
                            <span className="font-semibold text-[#1c2b3a]">
                              {application.fellowship?.pfmsReference || `PFMS-DBT-ST-${application.applicationCode?.slice(-6)}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#dde1e7]">
                          <span className="text-[12px] text-[#6b7a8d]">
                            Next Annual Progress Report (APR) renewal due in 11 months.
                          </span>
                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a3557] hover:bg-[#102540] text-white rounded text-[12px] font-medium transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Formal Grant Award Letter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.status === 'Flagged' && (
                    <div className="bg-red-50/60 border border-red-200/80 rounded-lg p-4 flex items-center gap-2.5 text-[13px] text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>Your application has been flagged for manual review by an administrator.</span>
                    </div>
                  )}

                  {application.status === 'Rejected' && (
                    <div className="bg-gray-50 border border-[#dde1e7] rounded-lg p-4 text-[13px] text-[#6b7a8d]">
                      Your application was not selected for this scheme.
                    </div>
                  )}

                  {application.status === 'Pending' && (
                    <div className="bg-gray-50 border border-[#dde1e7] rounded-lg p-4 text-[13px] text-[#6b7a8d]">
                      Your application is being processed.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Two Side-by-Side Cards (Grid on Desktop, Stack on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Documents You'll Need Card (First/Left Column) */}
          <div className="bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-[#dde1e7] pb-3 text-[#1c2b3a]">
              <FileCheck className="w-[18px] h-[18px] text-[#1a3557]" />
              <h2 className="text-[16px] font-semibold">Documents You'll Need</h2>
            </div>
            <ul className="space-y-3 pt-1">
              <li className="flex items-center gap-2.5 text-[13px] text-[#4b5563]">
                <FileCheck className="w-4 h-4 text-[#6b7a8d] shrink-0" />
                <span>Caste Certificate</span>
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-[#4b5563]">
                <FileCheck className="w-4 h-4 text-[#6b7a8d] shrink-0" />
                <span>Income Certificate</span>
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-[#4b5563]">
                <FileCheck className="w-4 h-4 text-[#6b7a8d] shrink-0" />
                <span>Latest Marksheet</span>
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-[#4b5563]">
                <FileCheck className="w-4 h-4 text-[#6b7a8d] shrink-0" />
                <span>Admission Letter</span>
              </li>
            </ul>
          </div>

          {/* Need Help Card (Second/Right Column) */}
          <div className="bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-[#dde1e7] pb-3 text-[#1c2b3a]">
              <HelpCircle className="w-5 h-5 text-[#1a3557]" />
              <h2 className="text-[16px] font-semibold">Need Help?</h2>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] flex items-center justify-between text-[13px] sm:text-[14px] text-[#1c2b3a] hover:border-[#1a3557]/30 transition-colors">
                <span className="font-medium">Which documents do I need to prepare before applying?</span>
                <ChevronRight className="w-4 h-4 text-[#6b7a8d] shrink-0" />
              </div>
              <div className="p-3.5 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] flex items-center justify-between text-[13px] sm:text-[14px] text-[#1c2b3a] hover:border-[#1a3557]/30 transition-colors">
                <span className="font-medium">How long does verification take after submission?</span>
                <ChevronRight className="w-4 h-4 text-[#6b7a8d] shrink-0" />
              </div>
              <div className="p-3.5 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] flex items-center justify-between text-[13px] sm:text-[14px] text-[#1c2b3a] hover:border-[#1a3557]/30 transition-colors">
                <span className="font-medium">Who can I contact for scholarship application support?</span>
                <ChevronRight className="w-4 h-4 text-[#6b7a8d] shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Dashboard;
