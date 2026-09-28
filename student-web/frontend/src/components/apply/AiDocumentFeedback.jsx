import { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  FileSearch,
  FileText,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';

export default function AiDocumentFeedback({ processing, aiData }) {
  const { tx } = useLang();
  const [expanded, setExpanded] = useState(false);

  // 1. Processing State
  if (processing) {
    const { stageLabel, progress } = processing;
    return (
      <div className="mt-3 rounded-md border border-navy/20 bg-navy-soft/60 p-3.5 text-[12.5px] transition-all animate-pulse">
        <div className="flex items-center justify-between text-navy font-semibold mb-2">
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-navy" />
            <Cpu className="h-4 w-4 text-ochre" />
            <span>{tx(stageLabel || { en: 'AI Document Intelligence Ingestion...', hi: 'एआई दस्तावेज़ विश्लेषण जारी...' })}</span>
          </span>
          <span className="font-mono text-[12px]">{progress || 40}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-navy transition-all duration-300"
            style={{ width: `${progress || 40}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {tx({
            en: 'Scanning layout, verifying statutory stamps, extracting text and validating scheme rules...',
            hi: 'लेआउट स्कैन, सांविधिक मुहर सत्यापन, पाठ निष्कर्षण एवं योजना नियमों की जांच जारी...',
          })}
        </p>
      </div>
    );
  }

  // If no AI data available, return null
  if (!aiData) return null;

  const isVerified = aiData.preliminaryStatus === 'VERIFIED';
  const fields = aiData.extractedFields || {};
  const checks = aiData.checks || [];

  return (
    <div className="mt-3 rounded-md border border-line bg-paper text-[12.5px] overflow-hidden">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-navy" />
          <span className="font-bold text-navy font-serif">
            {tx({ en: 'AI Preliminary Document Analysis', hi: 'एआई प्रारंभिक दस्तावेज़ विश्लेषण' })}
          </span>
          <span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy">
            {aiData.typeLabel || aiData.detectedType}
          </span>
          <span className="text-[11px] text-muted font-mono">
            ({Math.round((aiData.confidence || 0.95) * 100)}% match)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11.5px] font-bold ${
              isVerified
                ? 'bg-leaf-soft text-leaf border border-leaf/30'
                : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            {isVerified
              ? tx({ en: 'Preliminary Validated', hi: 'प्रारंभिक रूप से सत्यापित' })
              : tx({ en: 'Requires Officer Review', hi: 'अधिकारी समीक्षा आवश्यक' })}
          </span>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-navy hover:underline ml-1"
          >
            {expanded ? (
              <>
                <span>{tx({ en: 'Hide Details', hi: 'विवरण छुपाएं' })}</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <span>{tx({ en: 'View Extracted Fields', hi: 'निकाला गया विवरण देखें' })}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted Key Summary Bar */}
      <div className="px-3.5 py-2.5 bg-paper">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[12px]">
          {Object.entries(fields).slice(0, 4).map(([key, val]) => (
            <li key={key} className="truncate">
              <span className="text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
              <span className="font-semibold text-ink">{String(val)}</span>
            </li>
          ))}
        </ul>

        {/* Verification Checks List */}
        <div className="mt-2.5 pt-2 border-t border-line/80 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px]">
          {checks.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-ink">
              {c.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-leaf shrink-0" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5 text-ochre shrink-0" />
              )}
              <span className={c.passed ? 'text-ink' : 'font-semibold text-ochre'}>{c.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {expanded && (
        <div className="border-t border-line bg-white p-3.5 text-[12px] space-y-3">
          <div>
            <p className="font-bold text-navy mb-1.5">
              {tx({ en: 'All Extracted Fields (Schema & Proximity Engine):', hi: 'सभी निकाले गए फ़ील्ड (स्कीमा एवं प्रॉक्सिमिटी इंजन):' })}
            </p>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded bg-paper p-3 border border-line">
              {Object.entries(fields).map(([k, v]) => (
                <div key={k} className="overflow-hidden">
                  <dt className="text-muted text-[11px] capitalize">{k.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="font-semibold text-ink text-[12.5px] truncate">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {aiData.evidence && aiData.evidence.length > 0 && (
            <div>
              <p className="font-bold text-navy mb-1">
                {tx({ en: 'Classification Evidence:', hi: 'वर्गीकरण साक्ष्य:' })}
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11.5px] text-muted">
                {aiData.evidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded border border-navy/15 bg-navy-soft/40 p-2.5 text-[11.5px] text-muted">
            <span className="font-semibold text-navy">
              {tx({ en: 'Government Disclaimer: ', hi: 'सरकारी अस्वीकरण: ' })}
            </span>
            {tx({
              en: 'AI verification provides preliminary document reading to assist the student and nodal officers. Final statutory eligibility is decided by authorized Government Verification Officials.',
              hi: 'एआई सत्यापन छात्र एवं नोडल अधिकारियों की सहायता हेतु प्रारंभिक दस्तावेज़ पठन प्रदान करता है। अंतिम सांविधिक पात्रता का निर्णय अधिकृत सरकारी सत्यापन अधिकारियों द्वारा ही लिया जाता है।',
            })}
          </div>
        </div>
      )}
    </div>
  );
}
