import React from 'react';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

export default function PipelineStatus({ stages }) {
  // stages is an array of 6 items:
  // [
  //   { id: 'upload', name: 'Document Upload', status: 'Completed' | 'Processing' | 'Pending' | 'Failed' },
  //   ...
  // ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-full">
            <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
            Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-slate-400" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            SECTION 2 — AI PIPELINE EXECUTION STATUS
          </h2>
          <p className="text-xs text-slate-500">
            Tracks real-time progress across Document Intelligence (System A) and Verification (System B).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage, idx) => {
          const isDone = stage.status === 'Completed';
          const isCurrent = stage.status === 'Processing';
          const isFail = stage.status === 'Failed';

          return (
            <div
              key={stage.id}
              className={`rounded-lg p-3 border text-left transition-all ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : isCurrent
                  ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-400'
                  : isFail
                  ? 'bg-rose-50/60 border-rose-300'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  STAGE 0{idx + 1}
                </span>
                {getStatusBadge(stage.status)}
              </div>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {stage.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {stage.description || ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
