import React from 'react';
import { Scale, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export default function EligibilityVerificationSection({
  ruleEvaluation = [],
  documentVerification = []
}) {
  const getRuleBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            FAIL
          </span>
        );
      case 'REQUIRES_HUMAN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {status || 'INCOMPLETE'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-700" />
            SECTION 6 — SCHOLARSHIP ELIGIBILITY VERIFICATION (SYSTEM B)
          </h2>
          <p className="text-xs text-slate-500">
            Deterministic rule evaluation against statutory scheme guidelines and thresholds.
          </p>
        </div>
      </div>

      {ruleEvaluation.length === 0 ? (
        <div className="text-xs text-slate-400 italic text-center py-4">
          No rule evaluations available yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Rule / Criterion</th>
                <th className="py-2.5 px-3">Expected Threshold</th>
                <th className="py-2.5 px-3">Actual Value</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Verification Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ruleEvaluation.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <div>{rule.rule || rule.id}</div>
                    {rule.id && <div className="text-[10px] text-slate-400 font-mono">{rule.id}</div>}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {rule.expected || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 text-[11px]">
                    {rule.actual !== undefined && rule.actual !== null ? String(rule.actual) : '-'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getRuleBadge(rule.status)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 text-[11px]">
                    {rule.reason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
