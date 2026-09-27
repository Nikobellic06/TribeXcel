import React from 'react';
import { FileCheck, AlertCircle, FileX } from 'lucide-react';

export default function DocumentIntelligenceSection({ documentResults = [] }) {
  if (!documentResults || documentResults.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
        No documents processed yet. Upload documents or load a demo to inspect document intelligence.
      </div>
    );
  }

  const getQualityBadge = (quality, score) => {
    const q = (quality || 'GOOD').toUpperCase();
    const pct = typeof score === 'number' ? `(${(score * 100).toFixed(0)}%)` : '';
    if (q === 'GOOD') {
      return (
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
          Quality: GOOD {pct}
        </span>
      );
    }
    if (q === 'WARNING') {
      return (
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
          Quality: WARNING {pct}
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
        Quality: POOR {pct}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-700" />
            SECTION 3 — DOCUMENT INTELLIGENCE (SYSTEM A)
          </h2>
          <p className="text-xs text-slate-500">
            Automated document classification, confidence estimation, scan legibility analysis, and field extraction.
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
          {documentResults.length} Document(s) Ingested
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentResults.map((doc, idx) => {
          const confidencePct = doc.confidence ? (doc.confidence * 100).toFixed(0) : '90';
          const fields = doc.fields || {};
          const fieldEntries = Object.entries(fields).filter(([_, v]) => v !== null && v !== undefined && String(v).trim() !== '');

          return (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between text-xs space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                  <div className="truncate">
                    <div className="font-semibold text-slate-900 truncate" title={doc.documentName}>
                      📄 {doc.documentName || 'Document'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Detected: <strong className="text-blue-900 font-bold">{doc.detectedType}</strong>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {confidencePct}% conf.
                    </span>
                  </div>
                </div>

                <div className="mb-2.5">
                  {getQualityBadge(doc.quality, doc.qualityScore)}
                </div>

                {/* Issues if any */}
                {doc.issues && doc.issues.length > 0 && (
                  <div className="bg-amber-100/70 border border-amber-200/80 rounded p-2 text-[11px] text-amber-900 mb-2">
                    <div className="font-semibold flex items-center gap-1 mb-0.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      Scan Legibility Note:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                      {doc.issues.map((iss, i) => (
                        <li key={i}>{iss}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing fields */}
                {doc.missingFields && doc.missingFields.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded p-2 text-[11px] text-rose-800 mb-2">
                    <div className="font-semibold flex items-center gap-1">
                      <FileX className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      Missing Fields:
                    </div>
                    <div className="text-[10px] mt-0.5">{doc.missingFields.join(', ')}</div>
                  </div>
                )}

                {/* Extracted fields table */}
                <div className="bg-white border border-slate-200 rounded p-2 max-h-48 overflow-y-auto">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Extracted Fields
                  </div>
                  {fieldEntries.length > 0 ? (
                    <div className="space-y-1">
                      {fieldEntries.map(([k, v]) => (
                        <div key={k} className="flex justify-between items-baseline text-[11px] border-b border-slate-50 pb-0.5">
                          <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-semibold text-slate-800 text-right truncate max-w-[140px] ml-2" title={String(v)}>
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">No specific text fields present</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
