import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AppShell from '../components/AppShell';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

const PER_PAGE = 10;

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

export default function ReviewQueue() {
  const navigate = useNavigate();
  const [scheme, setScheme]       = useState('All');
  const [status, setStatus]       = useState('All');
  const [state, setState]         = useState('All');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState([]);
  const [page, setPage]           = useState(1);

  const [rows, setRows]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PER_PAGE };
      if (scheme !== 'All') params.scheme = scheme;
      if (status !== 'All') params.status = status;
      if (state !== 'All')  params.state  = state;
      if (search.trim())    params.search = search.trim();

      const res = await api.get('/applications', { params });
      setRows(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch review queue:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [scheme, status, state, search, page]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r._id));

  const toggleRow = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(allChecked ? selected.filter((id) => !rows.find((r) => r._id === id)) : [...new Set([...selected, ...rows.map((r) => r._id)])]);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      await fetchQueue();
    } catch (err) {
      console.error(`Failed to update status to ${newStatus}:`, err);
      setError('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkStatus = async (newStatus) => {
    if (selected.length === 0) return;
    setActionLoading(true);
    try {
      await api.patch('/applications/bulk-status', { ids: selected, status: newStatus });
      setSelected([]);
      await fetchQueue();
    } catch (err) {
      console.error(`Failed bulk update to ${newStatus}:`, err);
      setError('Failed to perform bulk status update.');
    } finally {
      setActionLoading(false);
    }
  };

  const SelectField = ({ value, onChange, children }) => (
    <select
      value={value}
      onChange={(e) => { onChange(e.target.value); setPage(1); }}
      className="border border-[#dde1e7] rounded px-3 py-2 text-[13px] text-[#1c2b3a] bg-white outline-none focus:border-[#1a3557] transition-colors cursor-pointer"
    >
      {children}
    </select>
  );

  return (
    <AppShell title="Review Queue">
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        <SelectField value={scheme} onChange={setScheme}>
          <option value="All">Scheme: All</option>
          <option value="NFST">NFST</option>
          <option value="NOS">NOS</option>
        </SelectField>
        <SelectField value={status} onChange={setStatus}>
          <option value="All">Status: All</option>
          <option value="Eligible">Eligible</option>
          <option value="Pending">Pending</option>
          <option value="Deficient">Deficient</option>
          <option value="Flagged">Flagged</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </SelectField>
        <SelectField value={state} onChange={setState}>
          <option value="All">State: All</option>
          <option value="Odisha">Odisha</option>
          <option value="Jharkhand">Jharkhand</option>
          <option value="Chhattisgarh">Chhattisgarh</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="West Bengal">West Bengal</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Delhi">Delhi</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Maharashtra">Maharashtra</option>
        </SelectField>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa3af]" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or application ID…"
            className="w-full border border-[#dde1e7] rounded pl-8 pr-3 py-2 text-[13px] text-[#1c2b3a] bg-white outline-none placeholder-[#b0b8c4] focus:border-[#1a3557] transition-colors"
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-4 py-2.5 bg-[#eef2f7] border border-[#c8d4e3] rounded text-[13px]">
          <span className="font-medium text-[#1a3557]">
            {selected.length} application{selected.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatus('Rejected')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-white border border-[#dde1e7] rounded text-[13px] text-[#4b5563] hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={() => handleBulkStatus('Eligible')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-[#1a3557] text-white rounded text-[13px] hover:bg-[#102540] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Approve
            </button>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white border border-[#dde1e7] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#dde1e7] text-[#6b7a8d] font-medium text-[12px] uppercase tracking-wide">
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded border-[#c0c8d2] cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3">Applicant</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Scheme</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">State</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Submitted</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Score</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[#9aa3af]">
                    Loading applications...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[#9aa3af]">
                    No applications match the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id} className="hover:bg-[#fafbfc] transition-colors">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(row._id)}
                        onChange={() => toggleRow(row._id)}
                        className="rounded border-[#c0c8d2] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1c2b3a]">{row.name}</div>
                      <div className="text-[11px] text-[#9aa3af] mt-0.5">
                        {row.applicationCode || row._id}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-[#4b5563]">{row.scheme}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#4b5563]">{row.state}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-[#6b7a8d]">
                      {formatDate(row.submittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell font-medium text-[#1c2b3a]">
                      {row.aiVerification?.score !== undefined ? row.aiVerification.score : '--'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          title="View"
                          onClick={() => navigate(`/application/${row._id}`)}
                          className="p-1.5 rounded text-[#6b7a8d] hover:text-[#1a3557] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Approve"
                          onClick={() => handleUpdateStatus(row._id, 'Eligible')}
                          disabled={actionLoading}
                          className="p-1.5 rounded text-[#6b7a8d] hover:text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          title="Reject"
                          onClick={() => handleUpdateStatus(row._id, 'Rejected')}
                          disabled={actionLoading}
                          className="p-1.5 rounded text-[#6b7a8d] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#dde1e7] bg-[#f9fafb] flex items-center justify-between text-[12px] text-[#6b7a8d]">
          <span>
            Showing {total === 0 ? 0 : (page - 1) * PER_PAGE + 1}–
            {Math.min(page * PER_PAGE, total)} of {total}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1.5 rounded border border-[#dde1e7] bg-white text-[#6b7a8d] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-1.5 rounded border border-[#dde1e7] bg-white text-[#6b7a8d] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
