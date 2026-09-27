import React from 'react';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

export default function PipelineStatus({ stages }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Done
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100/90 px-1.5 py-0.5 rounded-full">
            <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
            Active
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-600" />
            Alert
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-slate-400" />
            Wait
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-800">
            SECTION 2 — 8-STAGE AI PROCESSING PIPELINE
          </h2>
          <p className="text-xs text-slate-500">
            Real-time pipeline: Upload → File Preprocessing → PaddleOCR → Classification → Extraction → Cross-Validation → Rule Engine → Final Report
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {stages.map((stage, idx) => {
          const isDone = stage.status === 'Completed';
          const isCurrent = stage.status === 'Processing';
          const isFail = stage.status === 'Failed';

          return (
            <div
              key={stage.id}
              className={`rounded-lg p-2.5 border text-left transition-all ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 ring-1 ring-emerald-300/40'
                  : isCurrent
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/50 animate-pulse'
                  : isFail
                  ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  {idx + 1}
                </span>
                {getStatusBadge(stage.status)}
              </div>
              <div className="text-[11px] font-bold text-slate-800 leading-snug">
                {stage.name}
              </div>
              <div className="text-[9px] text-slate-500 mt-1 line-clamp-2">
                {stage.description || ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
