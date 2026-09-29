import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { AiResultBadge, PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { Input, Label, Select } from '../components/ui/Form';
import { Empty, ErrorState, Loading } from '../components/ui/States';
import { listApplications } from '../api/admin';
import { errorMessage } from '../api/axios';
import { AI_RESULT, PRIORITY, SCHEMES, STATUS, STATUS_OPTIONS, VIEWS } from '../config/labels';
import { formatDate } from '../utils/format';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'scheme', 'status', 'aiResult', 'priority', 'category', 'dateFrom', 'dateTo'];

export default function Applications() {
  const { view = 'all' } = useParams();
  const [params, setParams] = useSearchParams();
  const applied = useMemo(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ''])), [params]);
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [draft, setDraft] = useState(applied);
  const [state, setState] = useState({ loading: true, error: '', data: [], total: 0, totalPages: 1 });

  useEffect(() => setDraft(applied), [applied]);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    const query = { view, page, limit: PAGE_SIZE };
    Object.entries(applied).forEach(([k, v]) => v && (query[k] = v));
    listApplications(query)
      .then((r) => setState({ loading: false, error: '', data: r.data, total: r.total, totalPages: r.totalPages }))
      .catch((err) => setState((s) => ({ ...s, loading: false, error: errorMessage(err, 'Unable to load applications. Please try again.') })));
  }, [view, page, applied]);

  useEffect(load, [load]);

  if (!VIEWS[view]) return <Navigate to="/applications" replace />;
  const meta = VIEWS[view];

  const apply = (e) => {
    e?.preventDefault();
    const next = {};
    Object.entries(draft).forEach(([k, v]) => v && (next[k] = v));
    setParams(next);
  };
  const clear = () => setParams({});
  const setPage = (p) => {
    const next = Object.fromEntries(params.entries());
    next.page = String(p);
    setParams(next);
  };
  const activeCount = Object.values(applied).filter(Boolean).length;
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <AdminLayout title={meta.title} breadcrumb={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Applications', to: '/applications' }, ...(view === 'all' ? [] : [{ label: meta.title }])]}>
      <form onSubmit={apply} className="mb-4 rounded border border-line bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <Label htmlFor="f-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <Input id="f-search" value={draft.search} onChange={set('search')} placeholder="Application number, applicant name, email or mobile" className="pl-8" />
            </div>
          </div>
          <div>
            <Label htmlFor="f-scheme">Scheme</Label>
            <Select id="f-scheme" value={draft.scheme} onChange={set('scheme')}>
              <option value="">All schemes</option>
              {Object.entries(SCHEMES).map(([k, v]) => <option key={k} value={k}>{v.short}</option>)}
            </Select>
          </div>
          {view === 'all' ? (
            <div>
              <Label htmlFor="f-status">Application status</Label>
              <Select id="f-status" value={draft.status} onChange={set('status')}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((k) => <option key={k} value={k}>{STATUS[k].label}</option>)}
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="f-priority">Review priority</Label>
              <Select id="f-priority" value={draft.priority} onChange={set('priority')}>
                <option value="">All priorities</option>
                {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="f-ai">AI verification</Label>
            <Select id="f-ai" value={draft.aiResult} onChange={set('aiResult')}>
              <option value="">All results</option>
              {Object.entries(AI_RESULT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
          {view === 'all' && (
            <div>
              <Label htmlFor="f-priority">Review priority</Label>
              <Select id="f-priority" value={draft.priority} onChange={set('priority')}>
                <option value="">All priorities</option>
                {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="f-category">Category</Label>
            <Select id="f-category" value={draft.category} onChange={set('category')}>
              <option value="">All categories</option>
              <option value="Scheduled Tribe">Scheduled Tribe</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="f-from">Submitted from</Label>
              <Input id="f-from" type="date" value={draft.dateFrom} onChange={set('dateFrom')} />
            </div>
            <div>
              <Label htmlFor="f-to">Submitted to</Label>
              <Input id="f-to" type="date" value={draft.dateTo} onChange={set('dateTo')} />
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          {activeCount > 0 && <span className="mr-auto text-[12px] text-muted">{activeCount} filter(s) applied</span>}
          <Button variant="secondary" icon={X} onClick={clear} disabled={activeCount === 0}>Clear filters</Button>
          <Button type="submit" icon={Filter}>Apply filters</Button>
        </div>
      </form>

      <div className="rounded border border-line bg-white">
        {state.error ? (
          <ErrorState message={state.error} onRetry={load} />
        ) : state.loading && state.data.length === 0 ? (
          <Loading />
        ) : state.data.length === 0 ? (
          <Empty
            title={activeCount ? 'No applications match the selected filters.' : 'No applications in this list.'}
            message={activeCount ? 'Change or clear the filters to see more applications.' : undefined}
            action={activeCount ? <Button variant="secondary" onClick={clear}>Clear filters</Button> : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-[12.5px]">
                <thead className="bg-paper text-left text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    {['Application No.', 'Applicant name', 'Scheme', 'Category', 'Submitted', 'AI verification', 'Current status', 'Last updated', 'Action'].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={state.loading ? 'opacity-60' : ''}>
                  {state.data.map((a) => {
                    const actionable = a.status === 'Pending' || a.status === 'Flagged';
                    return (
                      <tr key={a._id} className="border-t border-line align-top hover:bg-paper/60">
                        <td className="num whitespace-nowrap px-3 py-2.5 font-semibold text-ink">
                          {a.applicationCode}
                          {a.reviewPriority && a.reviewPriority !== 'normal' && actionable && <div className="mt-1"><PriorityBadge priority={a.reviewPriority} /></div>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-medium text-ink">{a.name}</span>
                          <span className="block text-[11.5px] text-muted">{[a.district, a.state].filter(Boolean).join(', ')}</span>
                        </td>
                        <td className="px-3 py-2.5">{SCHEMES[a.scheme]?.short || a.scheme}</td>
                        <td className="px-3 py-2.5">{a.category === 'Scheduled Tribe' ? 'ST' : a.category}</td>
                        <td className="num whitespace-nowrap px-3 py-2.5">{formatDate(a.submittedAt)}</td>
                        <td className="px-3 py-2.5"><AiResultBadge result={a.aiPreliminary} /></td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={a.status} />
                          {a.resubmissionCount > 0 && <span className="mt-1 block text-[11px] text-muted">Resubmitted ({a.resubmissionCount})</span>}
                        </td>
                        <td className="num whitespace-nowrap px-3 py-2.5">{formatDate(a.lastActionAt || a.updatedAt)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <Link to={`/application/${a._id}`} className="font-semibold text-navy hover:underline">{actionable ? 'Review' : 'View'}</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={state.totalPages} total={state.total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
