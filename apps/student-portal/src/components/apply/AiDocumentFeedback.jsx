import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  FileText,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';

export default function AiDocumentFeedback({ processing, aiData }) {
  const { tx } = useLang();
  const [expanded, setExpanded] = useState(false);

  // 1. Processing State — calm, informative government progress
  if (processing) {
    const { stageLabel, progress } = processing;
    return (
      <div className="mt-3 rounded-md border border-line bg-paper p-3.5 text-[12.5px] transition-all">
        <div className="flex items-center justify-between text-navy font-semibold mb-2">
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-navy" />
            <span>{tx(stageLabel || { en: 'Verifying document format and text...', hi: 'दस्तावेज़ प्रारूप एवं पाठ सत्यापन जारी...' })}</span>
          </span>
          <span className="font-mono text-[12px] text-muted">{progress || 40}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-navy transition-all duration-300"
            style={{ width: `${progress || 40}%` }}
          />
        </div>
        <p className="mt-2 text-[11.5px] text-muted">
          {tx({
            en: 'Reading document text and checking statutory requirements for verification...',
            hi: 'दस्तावेज़ पाठ पढ़ा जा रहा है एवं सत्यापन हेतु सांविधिक आवश्यकताओं की जाँच जारी है...',
          })}
        </p>
      </div>
    );
  }

  // If no data available, return null
  if (!aiData) return null;

  const isVerified = aiData.preliminaryStatus === 'VERIFIED';
  const fields = aiData.extractedFields || {};
  const fieldEntries = Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== '');
  const hasIssues = !isVerified || (aiData.flags && aiData.flags.length > 0);

  return (
    <div className="mt-3 rounded-md border border-line bg-white text-[12.5px] overflow-hidden">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-navy" />
          <span className="font-semibold text-navy">
            {tx({ en: 'Document Information Extracted', hi: 'दस्तावेज़ विवरण निकाला गया' })}
          </span>
          {aiData.typeLabel && (
            <span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy">
              {aiData.typeLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11.5px] font-semibold ${
              !hasIssues
                ? 'bg-leaf-soft text-leaf border border-leaf/30'
                : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}
          >
            {!hasIssues ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            {!hasIssues
              ? tx({ en: 'Ready for Review', hi: 'समीक्षा हेतु तैयार' })
              : tx({ en: 'Scrutiny Required', hi: 'जाँच आवश्यक' })}
          </span>

          {fieldEntries.length > 0 && (
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
                  <span>{tx({ en: 'View Extracted Details', hi: 'निकाला गया विवरण देखें' })}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Advisory Message */}
      <div className="px-3.5 py-2 text-[12px] text-muted border-b border-line/60 bg-white">
        {!hasIssues ? (
          <p>
            {tx({
              en: 'Please verify that the extracted details match your physical document before submitting.',
              hi: 'कृपया आवेदन जमा करने से पहले जाँच लें कि निकाला गया विवरण आपके मूल दस्तावेज़ से मेल खाता है।',
            })}
          </p>
        ) : (
          <p className="text-amber-800 font-medium">
            {tx({
              en: 'Some details could not be completely extracted or require officer scrutiny. Please ensure the document is clear, upright, and legible.',
              hi: 'कुछ विवरण पूरी तरह नहीं पढ़े जा सके अथवा अधिकारी जाँच आवश्यक है। कृपया सुनिश्चित करें कि दस्तावेज़ स्पष्ट, सीधा और पठनीय है।',
            })}
          </p>
        )}
      </div>

      {/* Primary Extracted Fields Grid */}
      {fieldEntries.length > 0 && (
        <div className="px-3.5 py-2.5 bg-white">
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[12px]">
            {fieldEntries.slice(0, expanded ? undefined : 3).map(([key, val]) => (
              <div key={key} className="rounded border border-line/70 bg-paper/60 px-2.5 py-1.5">
                <dt className="text-[11px] text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                <dd className="font-semibold text-ink truncate mt-0.5">{String(val)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Verification Notice */}
      <div className="border-t border-line/60 bg-paper px-3.5 py-2 text-[11px] text-muted flex items-center justify-between">
        <span>
          {tx({
            en: 'Automated optical extraction is for preliminary verification. Official eligibility is decided by the verifying officer.',
            hi: 'स्वचालित ऑप्टिकल निष्कर्षण प्रारंभिक सत्यापन हेतु है। आधिकारिक पात्रता का निर्णय सत्यापन अधिकारी द्वारा लिया जाता है।',
          })}
        </span>
      </div>
    </div>
  );
}
