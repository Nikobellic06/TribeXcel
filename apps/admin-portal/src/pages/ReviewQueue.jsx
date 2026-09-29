import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { AiResultBadge, Badge, PriorityBadge, RuleResultBadge, StatusBadge } from '../components/ui/Badge';
import { Select } from '../components/ui/Form';
import { Empty, ErrorState, Loading, Notice } from '../components/ui/States';
import { getReviewQueue } from '../api/admin';
import { errorMessage } from '../api/axios';
import { FLAG_SOURCE, PRIORITY, SCHEMES } from '../config/labels';
import { daysSince, formatDate } from '../utils/format';

const PAGE_SIZE = 10;
const SEVERITY_TONE = { high: 'bad', medium: 'warn', low: 'grey' };
const TAB = 'px-3 py-1.5 text-[12.5px] font-semibold border-b-2';

export default function ReviewQueue() {
  const [params, setParams] = useSearchParams();
  const priority = params.get('priority') || '';
  const scheme = params.get('scheme') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [state, setState] = useState({ loading: true, error: '', data: [], total: 0, totalPages: 1 });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    getReviewQueue({ priority: priority || undefined, scheme: scheme || undefined, page, limit: PAGE_SIZE })
      .then((r) => setState({ loading: false, error: '', ...r }))
      .catch((err) => setState((s) => ({ ...s, loading: false, error: errorMessage(err, 'Unable to load the review queue. Please try again.') })));
  }, [priority, scheme, page]);

  useEffect(load, [load]);

  const update = (patch) => {
    const next = { priority, scheme, ...patch };
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)));
  };

  return (
    <AdminLayout title="Review Queue" breadcrumb={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Review Queue' }]}>
      <Notice className="mb-4">
        Applications awaiting an officer decision, highest priority first and oldest first within each priority. Each item lists why it needs attention and where the finding came from.
      </Notice>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-line">
        <div className="flex" role="tablist" aria-label="Priority">
          {[['', 'All'], ...Object.entries(PRIORITY).map(([k, v]) => [k, v.label])].map(([k, label]) => (
            <button
              key={k || 'all'}
              type="button"
              role="tab"
              aria-selected={priority === k}
              onClick={() => update({ priority: k, page: '' })}
              className={`${TAB} ${priority === k ? 'border-navy text-navy' : 'border-transparent text-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mb-2 w-48">
          <Select aria-label="Scheme" value={scheme} onChange={(e) => update({ scheme: e.target.value, page: '' })}>
            <option value="">All schemes</option>
            {Object.entries(SCHEMES).map(([k, v]) => <option key={k} value={k}>{v.short}</option>)}
          </Select>
        </div>
      </div>

      {state.error ? (
        <div className="rounded border border-line bg-white"><ErrorState message={state.error} onRetry={load} /></div>
      ) : state.loading && state.data.length === 0 ? (
        <Loading />
      ) : state.data.length === 0 ? (
        <div className="rounded border border-line bg-white">
          <Empty title="No applications awaiting review" message={priority || scheme ? 'Nothing matches this priority or scheme.' : 'Every submitted application has an officer decision.'} />
        </div>
      ) : (
        <div className="rounded border border-line bg-white">
          <ul className={`divide-y divide-line ${state.loading ? 'opacity-60' : ''}`}>
            {state.data.map((a) => {
              const flags = (a.reviewFlags || []).filter((f) => f.severity !== 'low' || a.reviewFlags.length <= 2);
              return (
                <li key={a._id} className="px-4 py-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink">
                        <span className="num">{a.applicationCode}</span>
                        <span className="font-normal text-muted">, {a.name}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {SCHEMES[a.scheme]?.name || a.scheme}. Submitted {formatDate(a.submittedAt)} ({daysSince(a.submittedAt)} day(s) ago)
                        {a.resubmissionCount > 0 ? '. Correction resubmitted' : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={a.reviewPriority} />
                      <StatusBadge status={a.status} />
                    </div>
                  </div>

                  <div className="mt-2.5 grid gap-3 lg:grid-cols-[1fr_260px]">
                    <div>
                      {flags.length === 0 ? (
                        <p className="text-[12.5px] text-muted">No issues were detected by the rule evaluation or data checks. Officer verification is still required.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {flags.slice(0, 4).map((f, i) => (
                            <li key={`${f.code}-${i}`} className="rounded border border-line bg-paper/60 px-3 py-2">
                              <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-ink">
                                <Badge tone={SEVERITY_TONE[f.severity]}>{FLAG_SOURCE[f.source] || f.source}</Badge>
                                {f.title}
                              </p>
                              {f.detail && <p className="mt-0.5 break-words text-[12px] text-muted">{f.detail}</p>}
                            </li>
                          ))}
                          {flags.length > 4 && <li className="text-[12px] text-muted">{flags.length - 4} more finding(s) on the application page.</li>}
                        </ul>
                      )}
                    </div>
                    <div className="space-y-2 text-[12px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted">Rule evaluation</span>
                        <RuleResultBadge result={a.rulePreliminary} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted">AI result (preliminary)</span>
                        <AiResultBadge result={a.aiPreliminary} />
                      </div>
                      <Button to={`/application/${a._id}`} size="sm" className="mt-1 w-full" icon={ArrowRight}>Review application</Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination page={page} totalPages={state.totalPages} total={state.total} pageSize={PAGE_SIZE} onChange={(p) => update({ page: String(p) })} />
        </div>
      )}
      <p className="mt-3 text-[12px] text-muted">
        Looking for a specific application? <Link to="/applications" className="font-semibold text-navy hover:underline">Search all applications</Link>.
      </p>
    </AdminLayout>
  );
}
