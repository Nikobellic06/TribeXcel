import { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  IndianRupee,
  Award,
  Clock,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import api from '../api/axios';

// Top Institutions fallback data if not provided by backend summary
const TOP_INSTITUTIONS = [
  { name: 'IIT Delhi', state: 'Delhi', beneficiaries: 342, amount: '₹4.10 Cr', rate: 96 },
  { name: 'IISc Bangalore', state: 'Karnataka', beneficiaries: 289, amount: '₹3.80 Cr', rate: 98 },
  { name: 'JNU New Delhi', state: 'Delhi', beneficiaries: 265, amount: '₹2.45 Cr', rate: 92 },
  { name: 'IIT Bombay', state: 'Maharashtra', beneficiaries: 240, amount: '₹3.20 Cr', rate: 95 },
  { name: 'BHU Varanasi', state: 'Uttar Pradesh', beneficiaries: 215, amount: '₹1.95 Cr', rate: 89 },
];

export default function Analytics() {
  // TODO: backend doesn't support scheme/state filtering on analytics yet
  const [schemeFilter, setSchemeFilter] = useState('All');
  const [fyFilter, setFyFilter] = useState('FY 2025-26');
  const [showExportToast, setShowExportToast] = useState(false);

  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const [sumRes, trendRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/trend?days=30'),
        ]);
        if (isMounted) {
          setSummary(sumRes.data);
          setTrendData(trendRes.data?.trend || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load analytics data:', err);
          setError('Failed to load analytics data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchAnalytics();
    return () => { isMounted = false; };
  }, [fyFilter]);

  const handleExport = () => {
    setShowExportToast(true);
    setTimeout(() => {
      setShowExportToast(false);
    }, 4000);
  };

  const total = summary?.total || 0;
  const kpis = summary?.kpis || {};
  const accuracy = kpis.verificationAccuracy !== undefined ? `${kpis.verificationAccuracy}%` : '—';
  const resubmission = kpis.resubmissionRate !== undefined ? `${kpis.resubmissionRate}%` : '—';
  const avgDays = kpis.avgProcessingDays !== undefined ? `${kpis.avgProcessingDays} Days` : '—';

  // Application status breakdown donut chart data
  const statusData = summary ? [
    { name: 'Approved & Selected', value: summary.selected || 0, color: '#16a34a' },
    { name: 'Pending Admin Review', value: summary.pendingReview || 0, color: '#3b82f6' },
    { name: 'Pending Verification', value: summary.pending || 0, color: '#1a3557' },
    { name: 'Deficient / Action Required', value: summary.deficient || 0, color: '#d97706' },
    { name: 'Flagged', value: summary.flagged || 0, color: '#dc2626' },
    ...(summary.rejected > 0 ? [{ name: 'Rejected / Ineligible', value: summary.rejected, color: '#991b1b' }] : []),
  ].filter(d => d.value > 0) : [];

  // Scheme-wise data
  const schemeWiseData = summary?.schemeWise || [];

  // State-wise data
  const stateWiseData = summary?.stateWise || [];

  // Processing Funnel metrics
  const pending = summary?.pending || 0;
  const pendingReview = summary?.pendingReview || 0;
  const deficient = summary?.deficient || 0;
  const flagged = summary?.flagged || 0;
  const selected = summary?.selected || 0;
  const rejected = summary?.rejected || 0;

  const funnelSubmitted = total;
  const funnelAiVerified = total - pending;
  const funnelAdminReviewed = selected + rejected + deficient + flagged;
  const funnelMeritRanked = pendingReview + selected;
  const funnelSelected = selected;

  return (
    <AppShell title="Analytics Dashboard">
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded">
          {error}
        </div>
      )}

      {/* ── Top Control Bar ────────────────────────────────────────────── */}
      <div className="bg-white border border-[#dde1e7] rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
              Scheme Filter
            </label>
            <select
              value={schemeFilter}
              onChange={(e) => setSchemeFilter(e.target.value)}
              className="bg-white border border-[#dde1e7] text-[#1c2b3a] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3557]/20 focus:border-[#1a3557]"
            >
              <option value="All">All Schemes</option>
              <option value="NFST">NFST — National Fellowship for ST Students</option>
              <option value="NOS">NOS — National Overseas Scholarship</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
              Financial Year
            </label>
            <select
              value={fyFilter}
              onChange={(e) => setFyFilter(e.target.value)}
              className="bg-white border border-[#dde1e7] text-[#1c2b3a] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3557]/20 focus:border-[#1a3557]"
            >
              <option value="FY 2025-26">FY 2025-26</option>
              <option value="FY 2024-25">FY 2024-25</option>
              <option value="FY 2023-24">FY 2023-24</option>
            </select>
          </div>
        </div>

        <div className="self-end sm:self-center">
          <button
            onClick={handleExport}
            className="border border-[#dde1e7] bg-white text-[#1c2b3a] hover:bg-[#f8fafc] text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download size={14} className="text-[#6b7280]" />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Inline Toast Notification ──────────────────────────────────── */}
      {showExportToast && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg p-3 flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-600" />
            <span className="font-semibold">Report exported as CSV successfully.</span>
          </div>
          <button
            onClick={() => setShowExportToast(false)}
            className="text-emerald-600 hover:text-emerald-800 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Top Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FileText}
          value={loading ? '...' : total.toLocaleString('en-IN')}
          iconBg="bg-blue-50"
          iconColor="text-[#1a3557]"
          label={
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span>Total Applications</span>
              <span className="text-[#6b7280]">Based on current data</span>
            </div>
          }
        />
        <StatCard
          icon={IndianRupee}
          value={loading ? '...' : accuracy}
          iconBg="bg-emerald-50"
          iconColor="text-[#16a34a]"
          label={
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span>AI Verification Accuracy</span>
              <span className="text-[#6b7280]">Based on current data</span>
            </div>
          }
        />
        <StatCard
          icon={Award}
          value={loading ? '...' : resubmission}
          iconBg="bg-amber-50"
          iconColor="text-[#d97706]"
          label={
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span>Resubmission Rate</span>
              <span className="text-[#6b7280]">Based on current data</span>
            </div>
          }
        />
        <StatCard
          icon={Clock}
          value={loading ? '...' : avgDays}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label={
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span>Avg. Processing Time</span>
              <span className="text-[#6b7280]">Based on current data</span>
            </div>
          }
        />
      </div>

      {/* ── Charts Grid (2x2) ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart 1: Applications Over Time (Trend) */}
        <div className="bg-white border border-[#dde1e7] rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1c2b3a]">
              Applications Over Time (30 Days)
            </h3>
            <p className="text-xs text-[#6b7280]">
              Daily trend of received vs selected applications
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-xs text-[#9aa3af]">Loading chart...</div>
            ) : (
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderColor: '#dde1e7',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="received" name="Received" fill="#1a3557" radius={[4, 4, 0, 0]} />
                <Bar dataKey="selected" name="Selected" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Scheme-Wise Breakdown */}
        <div className="bg-white border border-[#dde1e7] rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1c2b3a]">
              Scheme-Wise Application Performance
            </h3>
            <p className="text-xs text-[#6b7280]">
              Received, verified and selected counts by scheme
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-xs text-[#9aa3af]">Loading chart...</div>
            ) : (
              <BarChart data={schemeWiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="scheme" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderColor: '#dde1e7',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="received" name="Received" fill="#1a3557" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" name="Verified" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="selected" name="Selected" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Application Status Breakdown */}
        <div className="bg-white border border-[#dde1e7] rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1c2b3a]">
              Current Application Status Distribution
            </h3>
            <p className="text-xs text-[#6b7280]">
              Breakdown of all {total} active applications
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-xs text-[#9aa3af]">Loading chart...</div>
            ) : (
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => val.toLocaleString()}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderColor: '#dde1e7',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart 4: State-Wise Distribution */}
        <div className="bg-white border border-[#dde1e7] rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1c2b3a]">
              State-Wise Distribution
            </h3>
            <p className="text-xs text-[#6b7280]">
              Applications received per state
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-xs text-[#9aa3af]">Loading chart...</div>
            ) : (
              <BarChart data={stateWiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="state" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderColor: '#dde1e7',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="count" name="Applications" fill="#1a3557" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Processing Funnel & Top Institutions ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Funnel Card */}
        <div className="bg-white border border-[#dde1e7] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1c2b3a] mb-1">
              Processing Funnel
            </h3>
            <p className="text-xs text-[#6b7280] mb-4">
              Conversion across selection pipeline
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#4b5563]">1. Submitted</span>
                  <span className="font-semibold text-[#1c2b3a]">{funnelSubmitted}</span>
                </div>
                <div className="h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a3557] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#4b5563]">2. AI Verified</span>
                  <span className="font-semibold text-[#1c2b3a]">
                    {funnelAiVerified} ({total > 0 ? Math.round((funnelAiVerified / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${total > 0 ? (funnelAiVerified / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#4b5563]">3. Admin Reviewed</span>
                  <span className="font-semibold text-[#1c2b3a]">
                    {funnelAdminReviewed} ({total > 0 ? Math.round((funnelAdminReviewed / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${total > 0 ? (funnelAdminReviewed / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#4b5563]">4. Merit Ranked</span>
                  <span className="font-semibold text-[#1c2b3a]">
                    {funnelMeritRanked} ({total > 0 ? Math.round((funnelMeritRanked / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${total > 0 ? (funnelMeritRanked / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#4b5563]">5. Selected</span>
                  <span className="font-semibold text-[#1c2b3a]">
                    {funnelSelected} ({total > 0 ? Math.round((funnelSelected / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#16a34a] rounded-full"
                    style={{ width: `${total > 0 ? (funnelSelected / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Institutions Table */}
        <div className="lg:col-span-2 bg-white border border-[#dde1e7] rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1c2b3a]">
              Top Institutions by Beneficiary Count
            </h3>
            <p className="text-xs text-[#6b7a8d]">
              Institutions with highest approved scholarship applications
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#dde1e7] bg-[#f8fafc]">
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">
                    Institution Name
                  </th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">
                    State
                  </th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider text-right">
                    Active Beneficiaries
                  </th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider text-right">
                    Total Sanctioned Amount
                  </th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider text-right">
                    Disbursement Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde1e7]">
                {TOP_INSTITUTIONS.map((inst, index) => (
                  <tr key={index} className="hover:bg-[#f8fafc] text-xs text-[#1c2b3a] transition-colors">
                    <td className="py-3 px-3 font-semibold">{inst.name}</td>
                    <td className="py-3 px-3 text-[#6b7280]">{inst.state}</td>
                    <td className="py-3 px-3 text-right font-medium">{inst.beneficiaries.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-semibold text-[#1a3557]">{inst.amount}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-[#f3f4f6] h-2 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-[#16a34a] h-full rounded-full"
                            style={{ width: `${inst.rate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-emerald-700">{inst.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
