import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Check
} from 'lucide-react';
import AppShell from '../components/AppShell';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

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

/* Reusable card wrapper */
function Card({ title, children }) {
  return (
    <div className="bg-white border border-[#dde1e7] rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-[#dde1e7]">
        <h2 className="text-[13px] font-semibold text-[#1c2b3a] uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

/* Two-column label/value row used inside Applicant Information */
function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-[12px] text-[#6b7a8d] mb-0.5">{label}</div>
      <div className="text-[13px] font-medium text-[#1c2b3a]">{value || '—'}</div>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remark, setRemark] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data);
      setRemark(res.data?.adminRemarks || '');
    } catch (err) {
      console.error('Failed to fetch application details:', err);
      setError('Failed to load application details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleUpdateStatus = async (newStatus) => {
    if (!app) return;
    setActionLoading(true);
    try {
      await api.patch(`/applications/${app._id}/status`, { status: newStatus });
      await fetchApplication();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!app) return;
    setSavingNote(true);
    setNoteSaved(false);
    try {
      await api.patch(`/applications/${app._id}/status`, {
        status: app.status,
        adminRemarks: remark,
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
      await fetchApplication();
    } catch (err) {
      console.error('Failed to save note:', err);
      setError('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Application Detail">
        <div className="bg-white border border-[#dde1e7] rounded-lg p-10 text-center text-[#9aa3af]">
          Loading application details...
        </div>
      </AppShell>
    );
  }

  if (error || !app) {
    return (
      <AppShell title="Application Detail">
        <div className="mb-4">
          <Link
            to="/queue"
            className="inline-flex items-center gap-1.5 text-[12px] text-[#6b7a8d] hover:text-[#1a3557] transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to Review Queue
          </Link>
        </div>
        <div className="bg-white border border-red-200 text-red-700 rounded-lg p-6 text-[13px]">
          {error || 'Application not found.'}
        </div>
      </AppShell>
    );
  }

  const scorePct = app.aiVerification?.score || 0;
  const scoreBar =
    scorePct >= 70 ? 'bg-green-500' : scorePct >= 40 ? 'bg-amber-500' : 'bg-red-500';

  const documents = app.documents || [];
  const aiChecks = app.aiVerification?.checks || [];

  // Application timeline derivation
  // Note: AI verification timestamp uses submittedAt as simplification
  const isFinalDecision = app.status === 'Selected' || app.status === 'Rejected';
  const timeline = [
    { stage: 'Submitted', date: formatDate(app.submittedAt), done: true },
    { stage: 'AI Verified', date: formatDate(app.submittedAt), done: app.status !== 'Pending' },
    {
      stage: 'Admin Review',
      date: isFinalDecision && app.updatedAt ? formatDate(app.updatedAt) : null,
      done: isFinalDecision,
      current: !isFinalDecision && app.status !== 'Pending',
    },
    {
      stage: 'Decision',
      date: isFinalDecision && app.updatedAt ? formatDate(app.updatedAt) : null,
      done: isFinalDecision,
      current: false,
    },
  ];

  return (
    <AppShell title={app.name}>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="mb-5">
        {/* Back link */}
        <Link
          to="/queue"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#6b7a8d] hover:text-[#1a3557] transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Back to Review Queue
        </Link>

        {/* Name / ID / badge row + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg font-semibold text-[#1c2b3a]">{app.name}</span>
            <span className="text-[13px] text-[#9aa3af]">
              {app.applicationCode || app._id}
            </span>
            <StatusBadge status={app.status} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus('Rejected')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-white border border-[#dde1e7] rounded text-[13px] text-[#4b5563] hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={() => handleUpdateStatus('Eligible')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-[#1a3557] text-white rounded text-[13px] hover:bg-[#102540] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-column grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* a) Applicant Information */}
          <Card title="Applicant Information">
            <div className="grid grid-cols-2 gap-4 px-5 py-4">
              <InfoRow label="Full name"          value={app.name}                   />
              <InfoRow label="Date of birth"      value={formatDate(app.dob)}        />
              <InfoRow label="Category"           value={app.category}               />
              <InfoRow label="Gender"             value={app.gender}                 />
              <InfoRow label="Email"              value={app.email}                  />
              <InfoRow label="Phone"              value={app.phone}                  />
              <InfoRow label="State"              value={app.state}                  />
              <InfoRow label="District"           value={app.district}               />
              <InfoRow label="Scheme"             value={app.scheme}                 />
              <InfoRow label="Course / Programme" value={app.course}                 />
              <InfoRow label="Institution name"   value={app.institution}            />
              <InfoRow label="Submitted on"       value={formatDate(app.submittedAt)}/>
            </div>
          </Card>

          {/* b) Documents */}
          <Card title="Documents">
            <div className="divide-y divide-[#f0f2f5]">
              {documents.length === 0 ? (
                <div className="px-5 py-4 text-[13px] text-[#9aa3af]">No documents attached.</div>
              ) : (
                documents.map((doc, idx) => (
                  <div
                    key={doc.name || idx}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={15} className="text-[#9aa3af] shrink-0" />
                      <span className="text-[13px] text-[#1c2b3a]">{doc.name}</span>
                      {doc.source === 'digilocker' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                          <ShieldCheck size={11} />
                          Verified via DigiLocker
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Manually uploaded
                        </span>
                      )}
                    </div>
                    {doc.fileUrl ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12px] text-[#1a3557] font-medium hover:underline px-1"
                      >
                        View
                      </a>
                    ) : (
                      <button className="text-[12px] text-[#1a3557] font-medium hover:underline px-1 cursor-pointer">
                        View
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* c) AI Verification Result */}
          <Card title="AI Verification Result">
            <div className="px-5 py-4">
              {/* Eligibility checklist */}
              <div className="space-y-2.5 mb-5">
                {aiChecks.length === 0 ? (
                  <div className="text-[13px] text-[#9aa3af]">No AI checks available.</div>
                ) : (
                  aiChecks.map((item, idx) => {
                    const isPassed = item.passed ?? item.pass;
                    return (
                      <div key={item.label || idx} className="flex items-center gap-2.5">
                        {isPassed ? (
                          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-red-500 shrink-0" />
                        )}
                        <span className={`text-[13px] ${isPassed ? 'text-[#1c2b3a]' : 'text-red-600'}`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#f0f2f5] mb-4" />

              {/* Eligibility score */}
              <div className="flex items-end justify-between mb-2">
                <span className="text-[12px] text-[#6b7a8d] uppercase tracking-wide font-medium">
                  Eligibility Score
                </span>
                <span className="text-2xl font-semibold text-[#1c2b3a] leading-none">
                  {scorePct}
                  <span className="text-[14px] font-normal text-[#9aa3af]">/100</span>
                </span>
              </div>
              <div className="h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${scoreBar}`}
                  style={{ width: `${scorePct}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* d) Application Timeline */}
          <Card title="Application Timeline">
            <div className="px-5 py-4">
              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[#dde1e7]" />

                <div className="space-y-5">
                  {timeline.map((step, i) => {
                    const isDone    = step.done;
                    const isCurrent = step.current;

                    return (
                      <div key={i} className="flex items-start gap-3.5 relative">
                        {/* Circle */}
                        <div className={`
                          w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 z-10 flex items-center justify-center
                          ${isDone
                            ? 'bg-[#1a3557] border-[#1a3557]'
                            : isCurrent
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-white border-[#c0c8d2]'}
                        `}>
                          {isDone && (
                            <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                              <path d="M1 3L2.5 4.5L6 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>

                        {/* Label + date */}
                        <div>
                          <div className={`text-[13px] font-medium leading-tight ${
                            isDone || isCurrent ? 'text-[#1c2b3a]' : 'text-[#9aa3af]'
                          }`}>
                            {step.stage}
                          </div>
                          {step.date ? (
                            <div className="text-[11px] text-[#9aa3af] mt-0.5">{step.date}</div>
                          ) : isCurrent ? (
                            <div className="text-[11px] text-blue-500 mt-0.5">In progress</div>
                          ) : (
                            <div className="text-[11px] text-[#c0c8d2] mt-0.5">Pending</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* e) Admin Remarks */}
          <Card title="Admin Remarks">
            <div className="px-5 py-4">
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={4}
                placeholder="Add a note before approving or rejecting…"
                className="w-full border border-[#dde1e7] rounded px-3 py-2 text-[13px] text-[#1c2b3a] bg-white outline-none placeholder-[#b0b8c4] focus:border-[#1a3557] transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <div>
                  {noteSaved && (
                    <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
                      <Check size={14} /> Saved
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-3 py-1.5 bg-white border border-[#dde1e7] rounded text-[13px] text-[#4b5563] hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {savingNote ? 'Saving...' : 'Save note'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
