import React, { useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, XCircle, AlertTriangle, Play, Sparkles } from 'lucide-react';

export default function ApplicationSection({
  applicationId,
  setApplicationId,
  scheme,
  setScheme,
  files,
  setFiles,
  onProcess,
  onRunDemo,
  isProcessing
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            SECTION 1 — APPLICATION & INGESTION
          </h2>
          <p className="text-xs text-slate-500">
            Select target scholarship scheme, upload real applicant documents, or run one-click SIH evaluation demos.
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto">
          REST API Target: <code>POST /api/process-application</code>
        </span>
      </div>

      {/* Demo Controls Bar */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>ONE-CLICK EVALUATION DEMOS (Works offline without API key):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onRunDemo('eligible')}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>[Demo: Eligible]</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onRunDemo('ineligible')}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>[Demo: Ineligible]</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onRunDemo('human_review')}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>[Demo: Human Review]</span>
          </button>
        </div>
      </div>

      {/* Form Fields: Scheme and App ID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Application Identifier
          </label>
          <input
            type="text"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="e.g. MOTA-2026-APP-001"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Target MoTA Scholarship Scheme
          </label>
          <select
            value={scheme}
            onChange={(e) => setScheme(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-slate-800"
          >
            <option value="PRE_MATRIC">Pre-Matric Scholarship for ST Students (Class IX - X)</option>
            <option value="NOS">National Overseas Scholarship (NOS for ST Candidates)</option>
            <option value="NATIONAL_FELLOWSHIP">National Fellowship for Higher Education (M.Phil / Ph.D.)</option>
          </select>
        </div>
      </div>

      {/* Document Upload Area */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Upload Applicant Documents (PDF, JPG, JPEG, PNG)
        </label>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-700">
            <span className="text-blue-600 font-semibold">Click to select files</span> or drag and drop documents here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports ST Certificate, Income Cert, Aadhaar, Marksheet, Admission Letter, Bank Passbook
          </p>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="text-xs font-medium text-slate-600">
              Attached Documents ({files.length}):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded"
                >
                  <span className="truncate flex items-center gap-1.5 text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {f.name}
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                    {(f.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={files.length === 0 || isProcessing}
          onClick={onProcess}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs sm:text-sm shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing Application through System A & System B...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run End-to-End Pipeline (Upload → AI Document Analysis → Verification)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
