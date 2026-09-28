import React, { useState } from 'react';
import { FileCheck, AlertCircle, Tag, ChevronDown, ChevronUp, AlignLeft, Eye, ShieldCheck } from 'lucide-react';

export default function DocumentIntelligenceSection({ documentResults = [] }) {
  const [expandedOcr, setExpandedOcr] = useState({});
  const [expandedScores, setExpandedScores] = useState({});

  if (!documentResults || documentResults.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
        No documents processed yet. Upload documents or load a demo to inspect document intelligence.
      </div>
    );
  }

  const toggleOcr = (idx) => {
    setExpandedOcr(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleScores = (idx) => {
    setExpandedScores(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

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
      case 'PVTG_CERTIFICATE':
        return <span className="text-teal-800 bg-teal-100 font-bold px-2 py-0.5 rounded">PVTG Certificate</span>;
      case 'MARKSHEET':
        return <span className="text-blue-800 bg-blue-100 font-bold px-2 py-0.5 rounded">Marksheet</span>;
      case 'BANK_PASSBOOK':
        return <span className="text-indigo-800 bg-indigo-100 font-bold px-2 py-0.5 rounded">Bank Passbook</span>;
      case 'AADHAAR':
        return <span className="text-purple-800 bg-purple-100 font-bold px-2 py-0.5 rounded">Aadhaar Card</span>;
      case 'DOMICILE_CERTIFICATE':
        return <span className="text-teal-800 bg-teal-100 font-bold px-2 py-0.5 rounded">Domicile Certificate</span>;
      case 'DEGREE_CERTIFICATE':
        return <span className="text-cyan-800 bg-cyan-100 font-bold px-2 py-0.5 rounded">Degree Certificate</span>;
      case 'ADMISSION_LETTER':
      case 'OFFER_LETTER':
        return <span className="text-sky-800 bg-sky-100 font-bold px-2 py-0.5 rounded">Offer / Admission Letter</span>;
      case 'BONAFIDE_CERTIFICATE':
        return <span className="text-lime-800 bg-lime-100 font-bold px-2 py-0.5 rounded">Bonafide Certificate</span>;
      case 'DISABILITY_CERTIFICATE':
        return <span className="text-orange-800 bg-orange-100 font-bold px-2 py-0.5 rounded">Disability Certificate</span>;
      case 'FEE_RECEIPT':
        return <span className="text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">Fee Receipt</span>;
      case 'UNKNOWN':
      case 'OTHER':
        return <span className="text-rose-800 bg-rose-100 font-bold px-2 py-0.5 rounded">UNKNOWN / OTHER</span>;
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
            PaddleOCR (PP-OCRv6) + PyMuPDF: Weighted classification by content, evidence phrases, coordinate extraction, and per-field confidence.
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
          const evidence = doc.evidence || doc.classificationEvidence || [];
          const scores = doc.classificationScores || {};
          const isUnknown = doc.detectedType === 'UNKNOWN' || doc.detectedType === 'OTHER';
          const isOcrOpen = Boolean(expandedOcr[idx]);
          const isScoresOpen = Boolean(expandedScores[idx]);

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
                      📄 {doc.documentName || doc.filename || 'Document'}
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
                    <div className="font-semibold text-blue-900 flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-blue-600" />
                        Classification Evidence:
                      </span>
                      {Object.keys(scores).length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleScores(idx)}
                          className="text-[9px] text-blue-700 hover:underline flex items-center gap-0.5"
                        >
                          Scores {isScoresOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {evidence.map((ev, i) => (
                        <span key={i} className="bg-white border border-blue-200 text-blue-800 px-1.5 py-0.2 rounded font-mono text-[9px]">
                          "{ev}"
                        </span>
                      ))}
                    </div>

                    {/* Expandable Weighted Scores */}
                    {isScoresOpen && Object.keys(scores).length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-blue-200/60 text-[9px] text-slate-700">
                        <div className="font-semibold text-blue-900 mb-1">Weighted Classification Scores:</div>
                        <div className="grid grid-cols-2 gap-1 font-mono">
                          {Object.entries(scores).map(([type, sc]) => (
                            <div key={type} className="flex justify-between bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              <span className="truncate">{type}:</span>
                              <span className="font-bold text-blue-700">{sc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                <div className="bg-white border border-slate-200 rounded p-2.5 max-h-56 overflow-y-auto mb-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex justify-between">
                    <span>Document-Specific Extracted Fields</span>
                    <span className="text-[9px] text-slate-400">Confidence</span>
                  </div>

                  {fieldEntries.length > 0 ? (
                    <div className="space-y-1.5">
                      {fieldEntries.map(([k, v]) => {
                        const confObj = fieldConf[k];
                        const confVal = confObj && typeof confObj.confidence === 'number' ? Math.round(confObj.confidence * 100) : null;
                        const validationStatus = confObj?.validation || 'VALID';

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
                                  validationStatus === 'INVALID'
                                    ? 'text-rose-700 bg-rose-50 border border-rose-200'
                                    : confVal >= 85
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : 'text-amber-700 bg-amber-50'
                                }`} title={`Validation: ${validationStatus} | Source: ${confObj?.source || 'OCR'}`}>
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

                {/* Expandable OCR Text Inspector */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleOcr(idx)}
                    className="w-full text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1">
                      <AlignLeft className="w-3 h-3 text-slate-500" />
                      {isOcrOpen ? 'Hide Recognized OCR Text' : 'View Recognized OCR Text'}
                    </span>
                    {isOcrOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isOcrOpen && (
                    <div className="mt-1.5 p-2 bg-slate-900 text-slate-100 rounded text-[10px] font-mono max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {doc.originalText || doc.normalizedText || (doc.lines && doc.lines.map(l => l.text).join('\n')) || 'No OCR text available.'}
                    </div>
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
