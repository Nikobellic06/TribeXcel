import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { AiResultBadge } from '../components/ui/Badge';
import { Empty, ErrorState, Loading, Notice } from '../components/ui/States';
import { getSummary, getTrend } from '../api/admin';
import { errorMessage } from '../api/axios';
import { AI_RESULT, FLAG_CODES, SCHEMES, STATUS } from '../config/labels';

const C = { navy: '#1a3557', navy2: '#5b7aa6', ok: '#1f7a45', warn: '#c98a1b', bad: '#b42318', grey: '#9aa6b4' };
const AXIS = { fontSize: 11.5, fill: '#6b7a8d' };
const tooltipStyle = { fontSize: 12, borderRadius: 4, border: '1px solid #dde1e7' };

function Kpi({ label, value, note }) {
  return (
    <div className="rounded border border-line bg-white px-4 py-3">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="num text-[20px] font-semibold text-ink">{value}</p>
      {note && <p className="text-[11.5px] text-muted">{note}</p>}
    </div>
  );
}

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [state, setState] = useState({ loading: true, error: '', s: null, trend: [] });

  const load = useCallback(() => {
    setState((st) => ({ ...st, loading: true, error: '' }));
    Promise.all([getSummary(), getTrend(days)])
      .then(([s, t]) => setState({ loading: false, error: '', s, trend: t.trend.map((d) => ({ ...d, label: d.date.slice(5).split('-').reverse().join('/') })) }))
      .catch((err) => setState((st) => ({ ...st, loading: false, error: errorMessage(err, 'Unable to load analytics. Please try again.') })));
  }, [days]);

  useEffect(load, [load]);
  const { s, trend } = state;

  const schemeData = (s?.schemeWise || []).map((r) => ({ ...r, name: SCHEMES[r.scheme]?.short || r.scheme }));
  const statusData = s ? ['Pending', 'Flagged', 'Deficient', 'Eligible', 'Selected', 'Rejected'].map((k) => ({ name: STATUS[k].label, count: s.byStatus?.[k] || 0 })) : [];
  const issueData = (s?.issueCategories || []).map((r) => ({ name: FLAG_CODES[r.code] || r.code, count: r.count }));

  return (
    <AdminLayout
      title="Analytics"
      breadcrumb={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Analytics' }]}
      actions={<Button variant="secondary" size="sm" icon={RefreshCw} onClick={load} loading={state.loading}>Refresh</Button>}
    >
      {state.error && !s ? (
        <div className="rounded border border-line bg-white"><ErrorState message={state.error} onRetry={load} /></div>
      ) : !s ? (
        <Loading />
      ) : s.total === 0 ? (
        <div className="rounded border border-line bg-white"><Empty title="No applications yet" message="Analytics appear once applications are submitted." /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <Kpi label="Total applications" value={s.total} />
            <Kpi label="Verified" value={s.verified} note={`${s.selected} selected`} />
            <Kpi label="Awaiting officer" value={s.awaitingAction} />
            <Kpi label="Defective" value={s.deficient} />
            <Kpi label="AI flagged" value={s.flagged} />
            <Kpi label="Human review rate" value={`${s.kpis.humanReviewRate}%`} note="Flagged + defective" />
            <Kpi label="Avg. days to action" value={s.kpis.avgProcessingDays} note={`${s.kpis.decided} decided`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Applications by scheme">
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={schemeData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#eef1f4" vertical={false} />
                    <XAxis dataKey="name" tick={AXIS} axisLine={{ stroke: '#dde1e7' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f4f6f8' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="received" name="Received" fill={C.navy} />
                    <Bar dataKey="verified" name="Verified" fill={C.ok} />
                    <Bar dataKey="flagged" name="Flagged" fill={C.warn} />
                    <Bar dataKey="defective" name="Defective" fill={C.navy2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Applications by status">
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={statusData} layout="vertical" margin={{ top: 4, right: 16, left: 40, bottom: 0 }}>
                    <CartesianGrid stroke="#eef1f4" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={AXIS} width={110} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f4f6f8' }} />
                    <Bar dataKey="count" name="Applications" fill={C.navy} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <Panel
            title="Application processing trend"
            subtitle="Applications by submission date, with their current outcome"
            actions={
              <select aria-label="Period" value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-8 rounded border border-line bg-white px-2 text-[12.5px]">
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            }
          >
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={trend} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#eef1f4" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#dde1e7' }} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="linear" dataKey="received" name="Received" stroke={C.navy} strokeWidth={2} dot={false} />
                  <Line type="linear" dataKey="verified" name="Verified" stroke={C.ok} strokeWidth={2} dot={false} />
                  <Line type="linear" dataKey="flagged" name="Flagged" stroke={C.warn} strokeWidth={2} dot={false} />
                  <Line type="linear" dataKey="defective" name="Defective" stroke={C.bad} strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Document and data issue categories" subtitle="Reasons applications were routed for review">
              {issueData.length === 0 ? <Empty title="No issues recorded" className="py-8" /> : (
                <div style={{ height: Math.max(180, issueData.length * 34) }}>
                  <ResponsiveContainer>
                    <BarChart data={issueData} layout="vertical" margin={{ top: 4, right: 16, left: 60, bottom: 0 }}>
                      <CartesianGrid stroke="#eef1f4" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={AXIS} width={150} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f4f6f8' }} />
                      <Bar dataKey="count" name="Applications" fill={C.warn} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <div className="space-y-4">
              <Panel title="AI verification summary" subtitle="Preliminary results only">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {Object.keys(AI_RESULT).map((k) => (
                    <li key={k} className="flex items-center justify-between gap-2 rounded border border-line px-3 py-2">
                      <AiResultBadge result={k} />
                      <span className="num text-[13px] font-semibold">{s.aiSummary?.[k] || 0}</span>
                    </li>
                  ))}
                </ul>
                <Notice className="mt-3">Resubmission rate after correction: {s.kpis.resubmissionRate}%.</Notice>
              </Panel>

              <Panel title="State-wise applications" bodyClass="max-h-64 overflow-y-auto">
                <table className="w-full text-[12.5px]">
                  <thead className="bg-paper text-left text-[11px] uppercase tracking-wide text-muted">
                    <tr><th className="px-3 py-2 font-semibold">State</th><th className="px-3 py-2 text-right font-semibold">Applications</th></tr>
                  </thead>
                  <tbody>
                    {s.stateWise.map((r) => (
                      <tr key={r.state} className="border-t border-line"><td className="px-3 py-1.5">{r.state}</td><td className="num px-3 py-1.5 text-right">{r.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
