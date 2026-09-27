import React from 'react';
import { GitCompare, CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldAlert } from 'lucide-react';

export default function CrossDocValidationSection({
  validations = [],
  reviewFlags = [],
  anomalies = []
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'MATCH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            MATCH
          </span>
        );
      case 'MINOR_VARIATION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            MINOR_VARIATION
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            MISMATCH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {status || 'NOT_AVAILABLE'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-700" />
            SECTION 5 — CROSS-DOCUMENT VALIDATION
          </h2>
          <p className="text-xs text-slate-500">
            Automated entity comparison across distinct records (Aadhaar, Caste Certificate, Marksheets, Passbook, Admission Letters).
          </p>
        </div>
      </div>

      {/* Review Flags Banner if any */}
      {reviewFlags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs space-y-2">
          <div className="font-semibold text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Active Desk Review Flags ({reviewFlags.length}):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {reviewFlags.map((flag, idx) => (
              <div key={idx} className="bg-white/80 border border-amber-200/60 rounded p-2 text-[11px]">
                <div className="flex justify-between font-semibold text-amber-900 mb-0.5">
                  <span className="font-mono">{flag.field}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1 rounded">
                    {flag.severity} PRIORITY
                  </span>
                </div>
                <div className="text-slate-700">{flag.message}</div>
                {flag.guidance && (
                  <div className="text-slate-500 text-[10px] mt-1">
                    <strong>Guidance:</strong> {flag.guidance}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {validations.length === 0 ? (
        <div className="text-xs text-slate-400 italic text-center py-4">
          No cross-document checks available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Field</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Document Occurrences</th>
                <th className="py-2.5 px-3">Engine Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {validations.map((item, idx) => {
                const docOccurrences = item.values || item.documents || [];
                return (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 capitalize">
                      {item.label || item.field}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-2.5 px-3">
                      {docOccurrences.length > 0 ? (
                        <div className="space-y-0.5">
                          {docOccurrences.map((d, i) => (
                            <div key={i} className="text-[11px] text-slate-700">
                              <span className="text-slate-400">{d.document}:</span>{' '}
                              <strong className="font-semibold text-slate-900">"{d.value}"</strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No values present</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {item.details || item.remarks || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
