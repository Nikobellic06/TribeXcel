import { useEffect, useState } from 'react';
import { Shield, RefreshCw, Filter, Search } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loading, Empty, ErrorState } from '../components/ui/States';
import Pagination from '../components/ui/Pagination';
import { getAuditLogs } from '../api/admin';
import { formatDateTime } from '../utils/format';

const ACTION_TONE = {
  APPLICATION_SUBMISSION: 'navy',
  APPLICATION_RESUBMISSION: 'warn',
  APPLICATION_DECISION: 'ok',
  DOCUMENT_UPLOAD: 'grey',
  DOCUMENT_VERIFIED: 'ok',
  DOCUMENT_DEFICIENT: 'warn',
  PROFILE_UPDATE: 'grey',
  AADHAAR_KYC_VERIFIED: 'ok',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [limit] = useState(25);

  const fetchLogs = () => {
    setLoading(true);
    setError('');
    const params = { page, limit };
    if (actionFilter) params.action = actionFilter;

    getAuditLogs(params)
      .then((res) => {
        setLogs(res.logs || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err.message || 'Unable to load audit logs.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AdminLayout
      title="System Audit Trail"
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Audit Trail' }]}
      actions={
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchLogs} loading={loading}>
          Refresh
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-white p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-navy" />
            <span className="text-[13px] font-semibold text-ink">
              Official Immutable Vigilance &amp; Compliance Audit Trail
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="rounded border border-line bg-paper px-2.5 py-1 text-[12px] font-medium text-ink"
            >
              <option value="">All Actions</option>
              <option value="APPLICATION_SUBMISSION">Application Submissions</option>
              <option value="APPLICATION_RESUBMISSION">Application Resubmissions</option>
              <option value="APPLICATION_DECISION">Officer Decisions</option>
              <option value="DOCUMENT_UPLOAD">Document Uploads</option>
              <option value="DOCUMENT_VERIFIED">Document Validations</option>
              <option value="DOCUMENT_DEFICIENT">Document Deficiencies</option>
              <option value="AADHAAR_KYC_VERIFIED">Aadhaar e-KYC</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="rounded border border-line bg-white">
            <ErrorState message={error} onRetry={fetchLogs} />
          </div>
        ) : loading ? (
          <Loading label="Loading audit logs..." />
        ) : logs.length === 0 ? (
          <div className="rounded border border-line bg-white p-8">
            <Empty title="No audit events found" message="No events matched your current filters." />
          </div>
        ) : (
          <Panel title={`Recorded Events (${total})`} bodyClass="overflow-x-auto">
            <table className="w-full min-w-[850px] text-[12px]">
              <thead className="bg-paper text-left text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Timestamp</th>
                  <th className="px-3 py-2 font-semibold">Actor &amp; Role</th>
                  <th className="px-3 py-2 font-semibold">Action</th>
                  <th className="px-3 py-2 font-semibold">Target Entity</th>
                  <th className="px-3 py-2 font-semibold">IP Address</th>
                  <th className="px-3 py-2 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((log) => {
                  const tone = ACTION_TONE[log.action] || 'grey';
                  return (
                    <tr key={log._id} className="hover:bg-paper/50">
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted font-mono text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-ink">{log.actor?.name || log.actor?.id || 'System'}</p>
                        <p className="text-[11px] text-muted capitalize">{log.actor?.role || 'Service'}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={tone}>{log.action}</Badge>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11.5px] text-ink">
                        {log.target?.entityType} {log.target?.entityId ? `#${String(log.target.entityId).slice(-6)}` : ''}
                      </td>
                      <td className="px-3 py-2.5 text-muted font-mono text-[11px]">
                        {log.clientIp || '127.0.0.1'}
                      </td>
                      <td className="px-3 py-2.5 max-w-xs truncate text-[11.5px] text-muted" title={JSON.stringify(log.metadata)}>
                        {log.metadata ? Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="border-t border-line px-3 py-2">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </Panel>
        )}
      </div>
    </AdminLayout>
  );
}
