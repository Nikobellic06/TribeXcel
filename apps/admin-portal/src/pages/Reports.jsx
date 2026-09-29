import { useCallback, useEffect, useState } from 'react';
import { Download, FileSpreadsheet, Filter, RefreshCw, ShieldCheck } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Empty, ErrorState, Loading } from '../components/ui/States';
import { getSummary, listApplications } from '../api/admin';
import { errorMessage } from '../api/axios';
import { FLAG_CODES, SCHEMES, STATUS } from '../config/labels';
import { formatDate, formatDateTime } from '../utils/format';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getSummary(),
      listApplications({ limit: 500 }),
    ])
      .then(([sumRes, appRes]) => {
        setSummary(sumRes);
        setApplications(appRes.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(errorMessage(err, 'Unable to load report data. Please try again.'));
        setLoading(false);
      });
  }, []);

  useEffect(loadData, [loadData]);

  // CSV Export Generators
  const exportFullRegisterCSV = () => {
    if (!applications.length) return;
    const headers = [
      'Application Code',
      'Applicant Name',
      'Scheme Code',
      'Scheme Name',
      'Submission Date',
      'Status',
      'Priority',
      'Course',
      'Annual Family Income',
      'State',
      'District',
      'DigiLocker Verified',
      'Officer Remarks',
    ];

    const rows = applications.map((a) => [
      `"${a.applicationCode}"`,
      `"${a.name || ''}"`,
      `"${a.scheme || ''}"`,
      `"${SCHEMES[a.scheme]?.name || a.scheme}"`,
      `"${a.submittedAt ? new Date(a.submittedAt).toISOString().slice(0, 10) : ''}"`,
      `"${a.status || ''}"`,
      `"${a.review?.priority || 'normal'}"`,
      `"${(a.course || '').replace(/"/g, '""')}"`,
      `"${a.familyIncome || ''}"`,
      `"${a.state || ''}"`,
      `"${a.district || ''}"`,
      `"${(a.documents || []).some((d) => d.source === 'digilocker') ? 'YES' : 'NO'}"`,
      `"${(a.adminRemarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoTA_Scholarship_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPendencyCSV = () => {
    const pendingApps = applications.filter((a) => a.status === 'Pending' || a.status === 'Flagged' || a.status === 'Deficient');
    if (!pendingApps.length) return;

    const headers = [
      'Application Code',
      'Applicant Name',
      'Scheme',
      'Submitted On',
      'Days In Queue',
      'Status',
      'Priority',
      'Attention Reason',
    ];

    const rows = pendingApps.map((a) => {
      const days = a.submittedAt ? Math.floor((Date.now() - new Date(a.submittedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const topFlag = (a.review?.flags || [])[0]?.title || '';
      return [
        `"${a.applicationCode}"`,
        `"${a.name || ''}"`,
        `"${a.scheme || ''}"`,
        `"${a.submittedAt ? new Date(a.submittedAt).toISOString().slice(0, 10) : ''}"`,
        days,
        `"${a.status}"`,
        `"${a.review?.priority || 'normal'}"`,
        `"${topFlag.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoTA_Verification_Pendency_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      title="Administrative Reports"
      breadcrumb={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Reports' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadData} loading={loading}>
            Refresh
          </Button>
          <Button size="sm" icon={Download} onClick={exportFullRegisterCSV} disabled={!applications.length}>
            Export Full Register (CSV)
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded border border-line bg-white">
          <ErrorState message={error} onRetry={loadData} />
        </div>
      )}

      {loading && !summary ? (
        <Loading />
      ) : !summary ? (
        <div className="rounded border border-line bg-white">
          <Empty title="No Report Data Available" message="Reports populate as student applications are submitted." />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Export Action Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-white p-3.5">
            <div className="flex items-center gap-2 text-[13px] text-ink">
              <FileSpreadsheet className="h-5 w-5 text-navy" />
              <div>
                <p className="font-semibold">Official Statutory Audit & Monitoring Exports</p>
                <p className="text-[12px] text-muted">Generate standard tabular records for Ministry reporting</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" icon={Download} onClick={exportPendencyCSV}>
                Export Pendency Report (CSV)
              </Button>
              <Button size="sm" icon={Download} onClick={exportFullRegisterCSV}>
                Export Complete Register (CSV)
              </Button>
            </div>
          </div>

          {/* Scheme-wise Summary Table */}
          <Panel title="1. Applications Received & Status Distribution by Scheme" subtitle="Session 2026-27 statutory summary">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="border-b border-line bg-paper text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3.5 py-2.5 font-semibold">Scheme</th>
                    <th className="px-3.5 py-2.5 font-semibold">Total Received</th>
                    <th className="px-3.5 py-2.5 font-semibold">Verified</th>
                    <th className="px-3.5 py-2.5 font-semibold">Under Scrutiny</th>
                    <th className="px-3.5 py-2.5 font-semibold">Defective</th>
                    <th className="px-3.5 py-2.5 font-semibold">Selected</th>
                    <th className="px-3.5 py-2.5 font-semibold">Verification Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(summary.schemeWise || []).map((row) => {
                    const verifiedRate = row.received > 0 ? Math.round(((row.verified || 0) / row.received) * 100) : 0;
                    return (
                      <tr key={row.scheme} className="hover:bg-paper/60">
                        <td className="px-3.5 py-3">
                          <p className="font-semibold text-ink">{SCHEMES[row.scheme]?.name || row.scheme}</p>
                          <p className="text-[11.5px] text-muted">{SCHEMES[row.scheme]?.short || row.scheme}</p>
                        </td>
                        <td className="px-3.5 py-3 font-semibold text-ink">{row.received}</td>
                        <td className="px-3.5 py-3 text-ok font-medium">{row.verified}</td>
                        <td className="px-3.5 py-3 text-warn font-medium">{row.flagged}</td>
                        <td className="px-3.5 py-3 text-bad font-medium">{row.defective}</td>
                        <td className="px-3.5 py-3 text-navy font-semibold">{row.selected || 0}</td>
                        <td className="px-3.5 py-3 font-mono font-medium text-ink">{verifiedRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Pendency and Defect Analysis */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="2. Processing Status Breakdown" subtitle="Current status across all submitted files">
              <table className="w-full text-left text-[12.5px]">
                <thead className="border-b border-line bg-paper text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Application State</th>
                    <th className="px-3 py-2 font-semibold">Count</th>
                    <th className="px-3 py-2 font-semibold">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {['Pending', 'Flagged', 'Deficient', 'Eligible', 'Selected', 'Rejected'].map((key) => {
                    const count = summary.byStatus?.[key] || 0;
                    const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                    return (
                      <tr key={key} className="hover:bg-paper/50">
                        <td className="px-3 py-2.5">
                          <StatusBadge status={key} />
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-ink">{count}</td>
                        <td className="px-3 py-2.5 text-muted font-mono">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>

            <Panel title="3. Automated Audit & Issue Breakdown" subtitle="Most frequent flags detected during automated checking">
              {(summary.issueCategories || []).length === 0 ? (
                <p className="p-4 text-[12.5px] text-muted text-center">No major anomalies reported by validation checks.</p>
              ) : (
                <table className="w-full text-left text-[12.5px]">
                  <thead className="border-b border-line bg-paper text-[11px] uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Flag / Discrepancy Category</th>
                      <th className="px-3 py-2 font-semibold">Affected Files</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {(summary.issueCategories || []).map((iss) => (
                      <tr key={iss.code} className="hover:bg-paper/50">
                        <td className="px-3 py-2.5 font-medium text-ink">
                          {FLAG_CODES[iss.code] || iss.code}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-warn">
                          {iss.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
