import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Clock, AlertTriangle, CheckCircle2,
  ArrowRight, ClipboardList, Eye,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

const QUICK_ACTIONS = [
  { label: 'Go to Review Queue',  to: '/queue',     desc: 'Process pending applications' },
  { label: 'Merit & Selection',   to: '/merit',     desc: 'View merit lists and rankings' },
  { label: 'Analytics Report',    to: '/analytics', desc: 'Review scheme-wise statistics' },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [sumRes, appRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/applications?limit=5&page=1'),
        ]);
        if (isMounted) {
          setSummary(sumRes.data);
          setRecentApps(appRes.data?.data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load dashboard data:', err);
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const total = summary?.total || 0;
  const pending = summary?.pending || 0;
  const pendingReview = summary?.pendingReview || 0;
  const deficient = summary?.deficient || 0;
  const flagged = summary?.flagged || 0;
  const selected = summary?.selected || 0;
  const rejected = summary?.rejected || 0;

  const statusRows = [
    { label: 'Pending Verification', count: pending, bar: 'bg-[#1a3557]' },
    { label: 'Pending Admin Review', count: pendingReview, bar: 'bg-blue-500' },
    { label: 'Deficient / Resubmit', count: deficient, bar: 'bg-amber-500' },
    { label: 'Flagged', count: flagged, bar: 'bg-red-500' },
    { label: 'Selected', count: selected, bar: 'bg-emerald-600' },
    ...(rejected > 0 ? [{ label: 'Rejected', count: rejected, bar: 'bg-rose-700' }] : []),
  ].map((item) => ({
    ...item,
    pct: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  return (
    <AppShell title="Dashboard">
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded">
          {error}
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FileText}
          value={loading ? '...' : total.toLocaleString('en-IN')}
          label="Total Applications"
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
        />
        <StatCard
          icon={Clock}
          value={loading ? '...' : pendingReview.toLocaleString('en-IN')}
          label="Pending Admin Review"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={AlertTriangle}
          value={loading ? '...' : deficient.toLocaleString('en-IN')}
          label="Deficient / Resubmission"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={CheckCircle2}
          value={loading ? '...' : selected.toLocaleString('en-IN')}
          label="Selected"
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* ── Main grid: table + sidebar panels ────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent applications table */}
        <div className="xl:col-span-2 bg-white border border-[#dde1e7] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#dde1e7]">
            <h2 className="text-[13px] font-semibold text-[#1c2b3a] uppercase tracking-wide">
              Recent Applications
            </h2>
            <Link
              to="/queue"
              className="flex items-center gap-1 text-[12px] text-[#1a3557] font-medium hover:underline"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#dde1e7] text-[#6b7a8d] font-medium text-[12px] uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Applicant</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Scheme</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">State</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Submitted</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-[#9aa3af]">
                      Loading applications...
                    </td>
                  </tr>
                ) : recentApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-[#9aa3af]">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  recentApps.map((app) => (
                    <tr key={app._id} className="hover:bg-[#fafbfc] transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-[#1c2b3a]">{app.name}</div>
                        <div className="text-[11px] text-[#9aa3af] mt-0.5">
                          {app.applicationCode || app._id}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-[#4b5563]">{app.scheme}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-[#4b5563]">{app.state}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-[#6b7a8d]">
                        {formatDate(app.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          title="View application"
                          onClick={() => navigate(`/application/${app._id}`)}
                          className="p-1.5 rounded text-[#6b7a8d] hover:text-[#1a3557] hover:bg-slate-100 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">

          {/* Status breakdown */}
          <div className="bg-white border border-[#dde1e7] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#dde1e7]">
              <h2 className="text-[13px] font-semibold text-[#1c2b3a] uppercase tracking-wide">
                Review Status Summary
              </h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {loading ? (
                <div className="text-center text-[#9aa3af] text-xs py-4">Loading summary...</div>
              ) : (
                statusRows.map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="text-[#4b5563]">{row.label}</span>
                      <span className="font-medium text-[#1c2b3a]">
                        {row.count.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.bar}`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-[#dde1e7] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#dde1e7]">
              <h2 className="text-[13px] font-semibold text-[#1c2b3a] uppercase tracking-wide">
                Quick Actions
              </h2>
            </div>
            <div className="divide-y divide-[#f0f2f5]">
              {QUICK_ACTIONS.map(({ label, to, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[#fafbfc] transition-colors group"
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#1c2b3a] flex items-center gap-2">
                      <ClipboardList size={14} className="text-[#1a3557]" />
                      {label}
                    </div>
                    <div className="text-[11px] text-[#9aa3af] mt-0.5">{desc}</div>
                  </div>
                  <ArrowRight size={14} className="text-[#c0c8d2] group-hover:text-[#1a3557] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
