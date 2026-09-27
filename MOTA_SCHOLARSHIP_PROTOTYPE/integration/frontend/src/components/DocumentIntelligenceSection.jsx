import React from 'react';
import { FileCheck, AlertCircle, FileX, CheckCircle, Tag } from 'lucide-react';

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

  const getDocTypeBadge = (type) => {
    switch (type) {
      case 'INCOME_CERTIFICATE':
        return <span className="text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded">Income Certificate</span>;
      case 'ST_CERTIFICATE':
        return <span className="text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">ST Certificate</span>;
      case 'MARKSHEET':
        return <span className="text-blue-800 bg-blue-100 font-bold px-2 py-0.5 rounded">Marksheet</span>;
      case 'BANK_PASSBOOK':
        return <span className="text-indigo-800 bg-indigo-100 font-bold px-2 py-0.5 rounded">Bank Passbook</span>;
      case 'AADHAAR':
        return <span className="text-purple-800 bg-purple-100 font-bold px-2 py-0.5 rounded">Aadhaar Card</span>;
      case 'DOMICILE_CERTIFICATE':
        return <span className="text-teal-800 bg-teal-100 font-bold px-2 py-0.5 rounded">Domicile Certificate</span>;
      case 'UNKNOWN':
        return <span className="text-rose-800 bg-rose-100 font-bold px-2 py-0.5 rounded">UNKNOWN Document</span>;
      default:
        return <span className="text-slate-800 bg-slate-100 font-bold px-2 py-0.5 rounded">{type}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-700" />
            SECTION 3 — DOCUMENT INTELLIGENCE (SYSTEM A DETERMINISTIC OCR)
          </h2>
          <p className="text-xs text-slate-500">
            RapidOCR PP-OCRv6 + PyMuPDF: Authentic classification by content, evidence phrases, and document-specific field extraction.
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
          const fieldConf = doc.fieldConfidence || {};
          const fieldEntries = Object.entries(fields).filter(([_, v]) => v !== null && v !== undefined && String(v).trim() !== '');
          const evidence = doc.classificationEvidence || [];
          const isUnknown = doc.detectedType === 'UNKNOWN';

          return (
            <div
              key={idx}
              className={`border rounded-lg p-3.5 flex flex-col justify-between text-xs space-y-3 ${
                isUnknown ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                  <div className="truncate">
                    <div className="font-semibold text-slate-900 truncate" title={doc.documentName}>
                      📄 {doc.documentName || 'Document'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Detected:</span>
                      {getDocTypeBadge(doc.detectedType)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                      {confidencePct}% conf.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2.5">
                  {getQualityBadge(doc.quality, doc.qualityScore)}
                  <span className="text-[10px] text-slate-500 font-mono">
                    Engine: PaddleOCR
                  </span>
                </div>

                {/* Classification Evidence */}
                {evidence.length > 0 && (
                  <div className="mb-2 bg-blue-50/80 border border-blue-200/70 rounded p-2 text-[10px]">
                    <div className="font-semibold text-blue-900 flex items-center gap-1 mb-1">
                      <Tag className="w-3 h-3 text-blue-600" />
                      Classification Evidence:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {evidence.map((ev, i) => (
                        <span key={i} className="bg-white border border-blue-200 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                          "{ev}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Low confidence or Unknown warning */}
                {isUnknown && (
                  <div className="bg-rose-100/80 border border-rose-300 rounded p-2 text-[11px] text-rose-900 mb-2">
                    <div className="font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      Document could not be reliably classified
                    </div>
                    <p className="text-[10px] mt-0.5 text-rose-700">
                      Content does not match any recognized MoTA scholarship certificate format. Flagged for officer review.
                    </p>
                  </div>
                )}

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

                {/* Extracted fields list */}
                <div className="bg-white border border-slate-200 rounded p-2.5 max-h-56 overflow-y-auto">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex justify-between">
                    <span>Document-Specific Extracted Fields</span>
                    <span className="text-[9px] text-slate-400">Confidence</span>
                  </div>

                  {fieldEntries.length > 0 ? (
                    <div className="space-y-1.5">
                      {fieldEntries.map(([k, v]) => {
                        const confObj = fieldConf[k];
                        const confVal = confObj && typeof confObj.confidence === 'number' ? Math.round(confObj.confidence * 100) : null;

                        return (
                          <div key={k} className="flex justify-between items-baseline text-[11px] border-b border-slate-100 pb-1 gap-2">
                            <span className="text-slate-500 capitalize shrink-0 font-medium">
                              {k.replace(/([A-Z])/g, ' $1')}:
                            </span>
                            <div className="flex items-center gap-1.5 text-right overflow-hidden">
                              <span className="font-semibold text-slate-900 truncate" title={String(v)}>
                                {k === 'annualIncome' ? `₹${Number(v).toLocaleString('en-IN')}` : String(v)}
                              </span>
                              {confVal !== null && (
                                <span className={`text-[9px] font-mono px-1 py-0.2 rounded shrink-0 ${
                                  confVal >= 85 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                                }`}>
                                  {confVal}%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">No scholarship fields extracted from this document</span>
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
