import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { AiResultBadge, PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { Empty, ErrorState, Loading, Notice } from '../components/ui/States';
import { getReviewQueue, getSummary, listApplications } from '../api/admin';
import { errorMessage } from '../api/axios';
import { AI_RESULT, SCHEMES, STATUS } from '../config/labels';
import { daysSince, formatDate } from '../utils/format';

function StatCard({ label, value, to, note, tone = 'text-ink' }) {
  return (
    <Link to={to} className="block rounded border border-line bg-white px-4 py-3 hover:border-navy/40">
      <p className="text-[12px] text-muted">{label}</p>
      <p className={`num mt-0.5 text-[22px] font-semibold leading-tight ${tone}`}>{value ?? '—'}</p>
      {note && <p className="text-[11.5px] text-muted">{note}</p>}
    </Link>
  );
}

function Bar({ label, value, total, color = 'bg-navy' }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[12.5px]">
        <span className="text-ink">{label}</span>
        <span className="num text-muted">{value} ({pct}%)</span>
      </div>
      <div className="mt-1 h-2 rounded-sm bg-paper">
        <div className={`h-2 rounded-sm ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const STATUS_COLOR = { Pending: 'bg-navy-2', Flagged: 'bg-warn-line', Deficient: 'bg-[#c98a1b]', Eligible: 'bg-ok', Selected: 'bg-[#155c34]', Rejected: 'bg-bad' };

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: '', summary: null, queue: [], recent: [] });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    Promise.all([getSummary(), getReviewQueue({ limit: 5 }), listApplications({ limit: 6, page: 1 })])
      .then(([summary, queue, recent]) => setState({ loading: false, error: '', summary, queue: queue.data, recent: recent.data }))
      .catch((err) => setState((s) => ({ ...s, loading: false, error: errorMessage(err, 'Unable to load the dashboard. Please try again.') })));
  }, []);

  useEffect(load, [load]);
  const { loading, error, summary: s, queue, recent } = state;

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumb={[{ label: 'Home' }, { label: 'Dashboard' }]}
      actions={<Button variant="secondary" size="sm" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>}
    >
      {error && !s ? (
        <div className="rounded border border-line bg-white"><ErrorState message={error} onRetry={load} /></div>
      ) : !s ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total applications" value={s.total} to="/applications" note={`${s.drafts} draft(s) not submitted`} />
            <StatCard label="Pending review" value={s.pending} to="/applications/pending" tone="text-navy-2" />
            <StatCard label="AI flagged" value={s.flagged} to="/applications/flagged" tone="text-warn" note="Human review required" />
            <StatCard label="Defective" value={s.deficient} to="/applications/defective" tone="text-warn" note="Correction required" />
            <StatCard label="Verified" value={s.verified} to="/applications/verified" tone="text-ok" note={`${s.selected} selected`} />
            <StatCard label="Rejected" value={s.rejected} to="/applications/rejected" tone="text-bad" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Panel title="Application processing overview" subtitle="Where every submitted application stands today">
              <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  ['Submitted', s.total, 'All received'],
                  ['Awaiting officer', s.awaitingAction, `${s.pending} pending, ${s.flagged} flagged`],
                  ['Correction required', s.deficient, 'With applicant'],
                  ['Verified', s.verified, 'Officer verified'],
                  ['Closed', s.selected + s.rejected, `${s.selected} selected, ${s.rejected} rejected`],
                ].map(([label, value, note], i) => (
                  <li key={label} className="rounded border border-line px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{i + 1}. {label}</p>
                    <p className="num text-[20px] font-semibold text-ink">{value}</p>
                    <p className="text-[11.5px] text-muted">{note}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[12px] text-muted">
                Human review rate {s.kpis.humanReviewRate}%. Average time to officer action {s.kpis.avgProcessingDays} day(s) across {s.kpis.decided} decided application(s).
              </p>
            </Panel>

            <Panel title="AI verification summary" subtitle="Preliminary results only; officers make every decision">
              <ul className="space-y-2">
                {Object.keys(AI_RESULT).map((key) => (
                  <li key={key} className="flex items-center justify-between gap-2 text-[12.5px]">
                    <AiResultBadge result={key} />
                    <span className="num font-semibold text-ink">{s.aiSummary?.[key] || 0}</span>
                  </li>
                ))}
              </ul>
              <Notice className="mt-3">
                &quot;Not run&quot; and &quot;Analysis unavailable&quot; mean no AI result exists. Rule evaluation still applies to every application.
              </Notice>
            </Panel>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Scheme-wise applications" bodyClass="overflow-x-auto">
              <table className="w-full min-w-[520px] text-[12.5px]">
                <thead className="bg-paper text-left text-[11px] uppercase tracking-wide text-muted">
                  <tr>{['Scheme', 'Received', 'Pending', 'Flagged', 'Defective', 'Verified', 'Rejected'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {s.schemeWise.length === 0 ? (
                    <tr><td colSpan={7}><Empty title="No applications yet" className="py-6" /></td></tr>
                  ) : (
                    s.schemeWise.map((r) => (
                      <tr key={r.scheme} className="border-t border-line">
                        <td className="px-3 py-2 font-semibold text-ink">{SCHEMES[r.scheme]?.short || r.scheme}</td>
                        {['received', 'pending', 'flagged', 'defective', 'verified', 'rejected'].map((k) => <td key={k} className="num px-3 py-2">{r[k]}</td>)}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Panel>

            <Panel title="Application status distribution">
              <div className="space-y-2.5">
                {['Pending', 'Flagged', 'Deficient', 'Eligible', 'Selected', 'Rejected'].map((k) => (
                  <Bar key={k} label={STATUS[k].label} value={s.byStatus?.[k] || 0} total={s.total} color={STATUS_COLOR[k]} />
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Priority review queue" subtitle="Highest priority first, oldest first" actions={<Link to="/queue" className="text-[12.5px] font-semibold text-navy hover:underline">Open queue</Link>} bodyClass="">
              {queue.length === 0 ? (
                <Empty title="No applications awaiting review" message="Every submitted application has an officer decision." />
              ) : (
                <ul className="divide-y divide-line">
                  {queue.map((a) => (
                    <li key={a._id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink">
                          <Link to={`/application/${a._id}`} className="hover:underline">{a.applicationCode}</Link>
                          <span className="font-normal text-muted">, {a.name}, {SCHEMES[a.scheme]?.short}</span>
                        </p>
                        <p className="text-[12px] text-muted">{a.reviewFlags?.[0]?.title || 'No issues detected by rules or data checks'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={a.reviewPriority} />
                        <span className="num text-[11.5px] text-muted" title="Days since submission">{daysSince(a.submittedAt)}d</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Recent applications" actions={<Link to="/applications" className="text-[12.5px] font-semibold text-navy hover:underline">View all</Link>} bodyClass="overflow-x-auto">
              {recent.length === 0 ? <Empty title="No applications received" /> : (
                <table className="w-full min-w-[520px] text-[12.5px]">
                  <thead className="bg-paper text-left text-[11px] uppercase tracking-wide text-muted">
                    <tr>{['Application No.', 'Applicant', 'Scheme', 'Date', 'Status', ''].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {recent.map((a) => (
                      <tr key={a._id} className="border-t border-line">
                        <td className="num whitespace-nowrap px-3 py-2 font-semibold">{a.applicationCode}</td>
                        <td className="px-3 py-2">{a.name}</td>
                        <td className="px-3 py-2">{SCHEMES[a.scheme]?.short || a.scheme}</td>
                        <td className="num whitespace-nowrap px-3 py-2">{formatDate(a.submittedAt)}</td>
                        <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                        <td className="px-3 py-2 text-right"><Link to={`/application/${a._id}`} className="font-semibold text-navy hover:underline">View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </div>
          {loading && <p className="text-[12px] text-muted">Refreshing…</p>}
        </div>
      )}
    </AdminLayout>
  );
}
