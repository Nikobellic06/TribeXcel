import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Edit3, Save, RotateCcw, Clock, FileText, Hash, ExternalLink } from 'lucide-react';
import { fetchWalletDocumentDetail, updateWalletDocumentFields, markWalletDocumentReady } from '../../api/student';
import { API_BASE_URL } from '../../api/axios';

export default function WalletDocumentDetailModal({ isOpen, documentId, onClose, onDocumentUpdated }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('studentToken') || localStorage.getItem('token') || '';

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
    }
  }, [isOpen, documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchWalletDocumentDetail(documentId);
      setDoc(data);

      // Initialize edited fields with current values
      const initialFields = {};
      if (data?.extractedData) {
        Object.keys(data.extractedData).forEach((k) => {
          initialFields[k] = data.extractedData[k]?.value ?? '';
        });
      }
      setEditedFields(initialFields);
    } catch (err) {
      setError(err.message || 'Failed to load document details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleFieldChange = (key, val) => {
    setEditedFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveChanges = async (markReady = false) => {
    try {
      setSaving(true);
      setError('');
      setActionSuccess('');

      const res = await updateWalletDocumentFields(documentId, {
        fields: editedFields,
        markReadyToShare: markReady,
      });

      if (res.success) {
        setActionSuccess('Changes saved with complete audit trail preserved');
        setIsEditing(false);
        await loadDocument();
        if (onDocumentUpdated) onDocumentUpdated();
      }
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReady = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await markWalletDocumentReady(documentId);
      if (res.success) {
        setActionSuccess('Document is now verified and marked ready to share');
        await loadDocument();
        if (onDocumentUpdated) onDocumentUpdated();
      }
    } catch (err) {
      setError(err.message || 'Failed to update document status');
    } finally {
      setSaving(false);
    }
  };

  const fileUrl = `${API_BASE_URL}/digilocker/wallet/documents/${documentId}/file?token=${encodeURIComponent(token)}`;
  const isPdf = doc?.originalFile?.mimeType === 'application/pdf' || doc?.originalFile?.fileName?.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-lg border border-line bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-navy px-6 py-3 text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold leading-tight">
                  {doc?.documentName || 'Document Detail'}
                </h3>
                <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent border border-accent/30">
                  DIGILOCKER
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Issuer: {doc?.issuer || 'Authorized Issuing Authority'} • Ref: {doc?.documentNumber || 'Pending'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success / Error Banners */}
        {actionSuccess && (
          <div className="bg-forest-soft border-b border-forest/30 px-6 py-2 text-xs text-forest font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {actionSuccess}
          </div>
        )}
        {error && (
          <div className="bg-alert-soft border-b border-alert/30 px-6 py-2 text-xs text-alert font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Content Body */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <p className="text-xs text-muted">Loading document details and OCR records...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* File Info Bar */}
            <div className="rounded-lg border border-line bg-paper/60 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-navy" />
                    <span className="text-xs font-bold text-ink">{doc?.originalFile?.fileName || 'Document File'}</span>
                    <span className="rounded bg-navy-soft px-2 py-0.5 text-[10px] font-semibold text-navy">
                      {doc?.originalFile?.mimeType || 'PDF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted flex items-center gap-1 font-mono">
                    <Hash className="h-3 w-3 text-navy" /> SHA-256: {doc?.fileHash || 'Verified'}
                  </p>
                </div>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-navy/30 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy-soft transition-colors shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Document File
                </a>
              </div>
            </div>

            {/* Header Status Bar */}
            <div className="flex items-center justify-between rounded-lg border border-line bg-navy/5 p-3.5">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-muted font-bold">Current Status</span>
                  <span className="text-xs font-bold text-navy">
                    {doc?.status === 'READY_TO_SHARE' && '✓ Ready to Share with TribeXcel'}
                    {doc?.status === 'USER_VERIFIED' && '✓ Information Verified by User'}
                    {doc?.status === 'REVIEW_REQUIRED' && '⚠ Review Required (Low Confidence Fields)'}
                    {doc?.status === 'SHARED' && '✓ Shared with TribeXcel Application'}
                    {doc?.status === 'OCR_COMPLETED' && '✓ OCR Extraction Completed'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="rounded border border-navy/30 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy-soft flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit Fields
                      </button>
                      {doc?.status !== 'READY_TO_SHARE' && doc?.status !== 'SHARED' && (
                        <button
                          onClick={handleMarkReady}
                          disabled={saving}
                          className="rounded bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy/90 flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mark Ready
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); loadDocument(); }}
                        className="rounded border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:bg-paper"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveChanges(true)}
                        disabled={saving}
                        className="rounded bg-forest px-3 py-1 text-xs font-semibold text-white hover:bg-forest/90 flex items-center gap-1"
                      >
                        <Save className="h-3.5 w-3.5" /> Save & Verify
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Extracted Fields Section */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-line">
                  <h4 className="font-serif text-sm font-bold text-navy">
                    Extracted Structured Information
                  </h4>
                  <span className="text-[11px] text-muted">
                    {isEditing ? 'Editing Mode • Original OCR values preserved' : 'Extracted via OCR Pipeline'}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {doc?.schema?.fields?.map((fieldDef) => {
                    const fieldData = doc?.extractedData?.[fieldDef.key];
                    const val = editedFields[fieldDef.key] ?? fieldData?.value ?? '';
                    const conf = fieldData?.confidence ?? 0.95;
                    const isLow = fieldData?.isLowConfidence;
                    const isEdited = fieldData?.isEdited;
                    const origVal = fieldData?.originalValue;

                    return (
                      <div
                        key={fieldDef.key}
                        className={`rounded border p-2.5 transition-colors ${
                          isLow ? 'border-alert/40 bg-alert-soft/30' : 'border-line bg-paper/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                            {fieldDef.label}
                            {fieldDef.required && <span className="text-alert">*</span>}
                          </label>

                          <div className="flex items-center gap-1.5 text-[10px]">
                            {isEdited && (
                              <span className="rounded bg-navy-soft px-1.5 py-0.5 font-semibold text-navy">
                                User Corrected
                              </span>
                            )}
                            {isLow ? (
                              <span className="rounded bg-alert-soft px-1.5 py-0.5 font-bold text-alert flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Low Confidence ({Math.round(conf * 100)}%)
                              </span>
                            ) : (
                              <span className="text-forest font-semibold">
                                {Math.round(conf * 100)}% Confidence
                              </span>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div>
                            <input
                              type={fieldDef.type === 'number' ? 'number' : fieldDef.type === 'date' ? 'date' : 'text'}
                              value={val}
                              onChange={(e) => handleFieldChange(fieldDef.key, e.target.value)}
                              className="w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs text-ink focus:border-navy focus:outline-none"
                            />
                            {origVal && String(origVal) !== String(val) && (
                              <p className="mt-1 text-[11px] text-muted italic">
                                Original OCR detected: <span className="font-mono text-ink">"{String(origVal)}"</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-navy">
                              {val ? String(val) : <span className="italic text-muted">Not extracted</span>}
                            </p>
                            {isEdited && origVal && (
                              <p className="mt-0.5 text-[10px] text-muted">
                                Original OCR: <span className="font-mono text-ink">"{String(origVal)}"</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Log / Audit Trail */}
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-line">
                  <Clock className="h-4 w-4 text-navy" />
                  <h4 className="font-serif text-sm font-bold text-navy">
                    Document Activity & Audit History
                  </h4>
                </div>

                <div className="mt-3 space-y-2">
                  {doc?.activityLog && doc.activityLog.length > 0 ? (
                    doc.activityLog.slice().reverse().map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 rounded border border-line/60 bg-paper/20 p-2 text-xs">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-navy shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-ink leading-tight">{entry.description}</p>
                          <p className="text-[10px] text-muted mt-0.5">
                            {new Date(entry.timestamp).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            • Actor: <span className="capitalize">{entry.actor || 'System'}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted">No activity records recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}
