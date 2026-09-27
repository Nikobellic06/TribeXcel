import React from 'react';
import { Award, CheckCircle2, XCircle, AlertTriangle, AlertCircle, FileText, UserCheck } from 'lucide-react';

export default function FinalResultSection({
  verification = {},
  documentIntelligence = {},
  onViewJson
}) {
  const finalStatus = (verification.finalStatus || 'INCOMPLETE').toUpperCase();
  const humanReviewRequired = Boolean(verification.humanReviewRequired);
  const deficiencies = verification.deficiencies || [];
  const explanation = verification.explanation || 'No verification report generated.';

  // Separate failed criteria and missing documents from deficiencies
  const failedCriteria = deficiencies.filter(d => 
    d.type === 'MANDATORY_CRITERIA_FAILED' || 
    d.type === 'INCOME_CEILING_EXCEEDED' || 
    d.type === 'ACADEMIC_CUTOFF_NOT_MET' || 
    d.type === 'AGE_LIMIT_EXCEEDED' || 
    d.type === 'RULE_FAILURE'
  );

  const missingDocuments = deficiencies.filter(d => 
    d.type === 'MISSING_DOCUMENT' || d.type === 'MISSING_REQUIRED_DOCUMENT'
  );

  const inconsistencyDeficiencies = deficiencies.filter(d => 
    d.type === 'DOCUMENT_MISMATCH' || d.type === 'LOW_CONFIDENCE_SCAN' || d.type === 'HUMAN_VERIFICATION_REQUIRED'
  );

  const getStatusDisplay = () => {
    switch (finalStatus) {
      case 'ELIGIBLE':
        return {
          title: 'ELIGIBLE',
          color: 'bg-emerald-600',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />,
          summary: 'Applicant satisfies all statutory scheme rules and document verification checks.'
        };
      case 'NOT_ELIGIBLE':
        return {
          title: 'NOT_ELIGIBLE',
          color: 'bg-rose-600',
          textColor: 'text-rose-700',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-300',
          icon: <XCircle className="w-6 h-6 text-rose-600 shrink-0" />,
          summary: 'Application failed one or more mandatory eligibility requirements under scheme rules.'
        };
      case 'HUMAN_REVIEW':
        return {
          title: 'HUMAN_REVIEW',
          color: 'bg-amber-600',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />,
          summary: 'Potential document inconsistency or scan legibility issue detected; desk officer review required.'
        };
      default:
        return {
          title: 'INCOMPLETE',
          color: 'bg-slate-600',
          textColor: 'text-slate-700',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          icon: <AlertCircle className="w-6 h-6 text-slate-500 shrink-0" />,
          summary: 'Mandatory documents or required data fields are missing from the submission.'
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-700" />
            SECTION 7 — FINAL VERIFICATION RESULT & EXPLAINABLE REPORT
          </h2>
          <p className="text-xs text-slate-500">
            Explainable AI evaluation summary with deficiency breakdown and human officer advisory.
          </p>
        </div>
        <button
          type="button"
          onClick={onViewJson}
          className="text-xs px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition-colors self-start sm:self-auto border border-slate-200"
        >
          View Full API JSON
        </button>
      </div>

      {/* Main Status Banner */}
      <div className={`p-4 rounded-xl border ${statusInfo.bgColor} ${statusInfo.borderColor} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          {statusInfo.icon}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-bold tracking-wide uppercase ${statusInfo.textColor}`}>
                {statusInfo.title}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                AI-assisted verification result
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {statusInfo.summary}
            </p>
          </div>
        </div>

        {/* Human review indicator */}
        <div className="shrink-0 flex items-center gap-2">
          {humanReviewRequired ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 px-3 py-1.5 rounded-lg border border-amber-300">
              <UserCheck className="w-4 h-4 text-amber-700" />
              Human Officer Review Required
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200">
              Standard Processing
            </span>
          )}
        </div>
      </div>

      {/* Detailed Explanation: Why? */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Why this result? (Explainable Summary)
        </h3>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 font-sans">
          {explanation}
        </div>
      </div>

      {/* Deficiencies Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Failed Criteria */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
          <div className="font-semibold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="text-rose-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Failed Criteria ({failedCriteria.length})
            </span>
          </div>
          {failedCriteria.length === 0 ? (
            <p className="text-slate-400 italic text-[11px]">No failed statutory criteria.</p>
          ) : (
            <ul className="space-y-1.5">
              {failedCriteria.map((c, i) => (
                <li key={i} className="text-[11px] text-rose-900 bg-rose-50/80 border border-rose-200 rounded p-1.5">
                  <strong>{c.field}:</strong> {c.reason}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Missing Documents */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
          <div className="font-semibold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="text-amber-800 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Missing Documents ({missingDocuments.length})
            </span>
          </div>
          {missingDocuments.length === 0 ? (
            <p className="text-slate-400 italic text-[11px]">All mandatory documents submitted.</p>
          ) : (
            <ul className="space-y-1.5">
              {missingDocuments.map((m, i) => (
                <li key={i} className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200 rounded p-1.5">
                  <strong>{m.field}:</strong> {m.reason}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Review Flags & Inconsistencies */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
          <div className="font-semibold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="text-blue-900 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Inconsistencies / Review Items ({inconsistencyDeficiencies.length})
            </span>
          </div>
          {inconsistencyDeficiencies.length === 0 ? (
            <p className="text-slate-400 italic text-[11px]">No document discrepancies detected.</p>
          ) : (
            <ul className="space-y-1.5">
              {inconsistencyDeficiencies.map((d, i) => (
                <li key={i} className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200 rounded p-1.5">
                  <strong>{d.field}:</strong> {d.reason}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Mandatory Statutory Notice */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Statutory Compliance Notice:</strong> This AI verification engine performs document intelligence and rule evaluation as an administrative decision-support system. It does not replace constitutional statutory mandates. <em>Final decision subject to authorized officer review.</em>
        </div>
      </div>
    </div>
  );
}
