import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import AdminLayout, { refreshCounts } from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import { Badge, PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { Empty, ErrorState, Loading, Notice } from '../components/ui/States';
import { ApplicantInfo, CrossChecks, EligibilitySummary, ReviewHistory, RuleEvaluation, SchemeInfo } from '../components/review/Sections';
import { AiAnalysisPanel, DocumentsPanel } from '../components/review/Documents';
import OfficerDecision from '../components/review/OfficerDecision';
import { getApplication, rerunAnalysis } from '../api/admin';
import { errorMessage } from '../api/axios';
import { FLAG_SOURCE, SCHEMES } from '../config/labels';
import { formatDate, formatDateTime } from '../utils/format';

const REVIEW_STATUS = {
  Pending: 'Officer decision required',
  Flagged: 'Human review required, officer decision pending',
  Deficient: 'Awaiting applicant correction',
  Eligible: 'Verified, awaiting merit / selection',
  Selected: 'Selected',
  Rejected: 'Closed: rejected',
};
const SEVERITY = { high: 'bad', medium: 'warn', low: 'grey' };
const SECTIONS = [
  ['applicant', 'A. Applicant'],
  ['scheme', 'B. Scheme'],
  ['eligibility', 'C. Eligibility'],
  ['documents', 'D. Documents'],
  ['ai', 'E. AI verification'],
  ['cross', 'F. Cross-checks'],
  ['rules', 'G. Rules'],
  ['decision', 'H. Officer action'],
];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', notFound: false, app: null });
  const [flash, setFlash] = useState('');
  const [rerun, setRerun] = useState({ busy: false, error: '' });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    getApplication(id)
      .then((app) => setState({ loading: false, error: '', notFound: false, app }))
      .catch((err) =>
        setState({ loading: false, app: null, notFound: err?.response?.status === 404, error: errorMessage(err, 'Unable to load application details. Please try again.') })
      );
  }, [id]);

  useEffect(load, [load]);

  const onDecision = (res) => {
    setFlash(`Decision recorded. Status is now "${res.status === 'Eligible' ? 'Verified' : res.status === 'Deficient' ? 'Correction required' : res.status}".`);
    refreshCounts();
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onRerun = async () => {
    setRerun({ busy: true, error: '' });
    try {
      await rerunAnalysis(id);
      setRerun({ busy: false, error: '' });
      load();
    } catch (err) {
      setRerun({ busy: false, error: errorMessage(err, 'The analysis could not be started. Please try again.') });
    }
  };

  const { app } = state;
  const crumbs = [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Applications', to: '/applications' }, { label: app?.applicationCode || 'Application' }];

  if (state.loading && !app) return <AdminLayout title="Application Review" breadcrumb={crumbs}><Loading label="Loading application…" /></AdminLayout>;
  if (!app) {
    return (
      <AdminLayout title="Application Review" breadcrumb={crumbs}>
        <div className="rounded border border-line bg-white">
          {state.notFound ? (
            <Empty title="Application not found" message="It may have been removed, or the link is incorrect." action={<Button to="/applications" variant="secondary">Back to applications</Button>} />
          ) : (
            <ErrorState message={state.error} onRetry={load} />
          )}
        </div>
      </AdminLayout>
    );
  }

  const { review } = app;
  const actionable = app.status === 'Pending' || app.status === 'Flagged';
  const flags = [...(review.flags || [])].sort((a, b) => ['high', 'medium', 'low'].indexOf(a.severity) - ['high', 'medium', 'low'].indexOf(b.severity));

  return (
    <AdminLayout
      title="Application Review"
      breadcrumb={crumbs}
      actions={
        <>
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/applications'))}>Back</Button>
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>Print</Button>
        </>
      }
    >
      {flash && <Notice tone="ok" className="mb-3">{flash}</Notice>}

      <section className="mb-4 rounded border border-line bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="num text-[12px] font-semibold text-muted">{app.applicationCode}</p>
            <h2 className="text-[18px] font-semibold text-ink">{app.name}</h2>
            <p className="text-[12.5px] text-muted">{SCHEMES[app.scheme]?.name || app.scheme}, session {app.session}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={app.status} />
            {actionable && <PriorityBadge priority={review.priority} />}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-[12.5px] md:grid-cols-4">
          <div><dt className="text-muted">Submitted</dt><dd className="num text-ink">{formatDateTime(app.submittedAt)}</dd></div>
          <div><dt className="text-muted">Last action</dt><dd className="num text-ink">{formatDateTime(app.lastActionAt || app.updatedAt)}</dd></div>
          <div><dt className="text-muted">Review status</dt><dd className="font-semibold text-ink">{REVIEW_STATUS[app.status] || app.status}</dd></div>
          <div><dt className="text-muted">Resubmissions</dt><dd className="num text-ink">{app.resubmissionCount || 0}{app.lastResubmittedAt ? `, last on ${formatDate(app.lastResubmittedAt)}` : ''}</dd></div>
        </dl>
        {app.adminRemarks && (
          <p className="border-t border-line px-4 py-2.5 text-[12.5px]"><span className="text-muted">Remarks shown to applicant: </span>{app.adminRemarks}</p>
        )}
      </section>

      {flags.length > 0 && (
        <section className="mb-4 rounded border border-warn-line/60 bg-warn-soft/60" aria-labelledby="attention">
          <h2 id="attention" className="border-b border-warn-line/40 px-4 py-2.5 text-[13.5px] font-semibold text-ink">Why this application needs attention ({flags.length})</h2>
          <ul className="divide-y divide-warn-line/30">
            {flags.map((f, i) => (
              <li key={`${f.code}-${i}`} className="px-4 py-2">
                <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-ink">
                  <Badge tone={SEVERITY[f.severity]}>{FLAG_SOURCE[f.source] || f.source}</Badge>
                  {f.title}
                </p>
                {f.detail && <p className="mt-0.5 break-words text-[12px] text-muted">{f.detail}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Sections" className="no-print mb-4 flex gap-1 overflow-x-auto rounded border border-line bg-white p-1.5">
        {SECTIONS.map(([key, label]) => (
          <a key={key} href={`#${key}`} className="whitespace-nowrap rounded px-2.5 py-1 text-[12px] font-semibold text-navy hover:bg-navy-soft/60">{label}</a>
        ))}
      </nav>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <ApplicantInfo app={app} />
          <SchemeInfo app={app} />
          <EligibilitySummary review={review} />
          <DocumentsPanel app={app} review={review} />
          <AiAnalysisPanel analysis={review.aiAnalysis} onRerun={onRerun} rerunning={rerun.busy} rerunError={rerun.error} />
          <CrossChecks checks={review.crossChecks} aiStatus={review.aiAnalysis?.status} />
          <RuleEvaluation evaluation={review.ruleEvaluation} />
        </div>
        <div className="space-y-4 xl:sticky xl:top-4">
          <OfficerDecision app={app} options={app.decisionOptions} onDone={onDecision} />
          <ReviewHistory history={app.reviewHistory} />
        </div>
      </div>
    </AdminLayout>
  );
}
