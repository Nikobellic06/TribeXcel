import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ health }) {
  const isHealthy = health?.integration === 'UP';
  const isSystemAUp = health?.systemA === 'UP';
  const isSystemBUp = health?.systemB === 'UP';

  return (
    <header className="bg-slate-900 border-b-2 border-amber-500 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/50">
              Ministry of Tribal Affairs Prototype
            </span>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              System A + System B Integration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
            AI-Powered Scholarship & Fellowship Verification Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Prototype — AI-assisted document intelligence and eligibility verification
          </p>
        </div>

        {/* Engine Connectivity Status */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-lg p-2 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/60">
            <span className="text-slate-400 font-medium">System A (Doc AI):</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${isSystemAUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isSystemAUp ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              {isSystemAUp ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/60">
            <span className="text-slate-400 font-medium">System B (Verify):</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${isSystemBUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isSystemBUp ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              {isSystemBUp ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
