import React, { useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, XCircle, AlertTriangle, Play, Sparkles, ShieldCheck } from 'lucide-react';

export default function ApplicationSection({
  applicationId,
  setApplicationId,
  scheme,
  setScheme,
  files,
  setFiles,
  onProcess,
  onRunDemo,
  isProcessing,
  activeMode = 'LIVE',
  setActiveMode
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      if (setActiveMode) setActiveMode('LIVE');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      if (setActiveMode) setActiveMode('LIVE');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            SECTION 1 — APPLICATION INGESTION
          </h2>
          <p className="text-xs text-slate-500">
            Select scholarship scheme, upload real applicant documents, or run benchmark evaluation demo scenarios.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-xs px-2.5 py-1 rounded font-bold border ${
            activeMode === 'LIVE'
              ? 'bg-blue-100 text-blue-800 border-blue-300 ring-1 ring-blue-400'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {activeMode === 'LIVE' ? '🟢 LIVE DOCUMENT MODE' : '🟡 DEMO SCENARIO MODE'}
          </span>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 hidden md:inline">
            POST /api/process-application
          </span>
        </div>
      </div>

      {/* Mode Switcher Banner: Clear Separation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
        {/* Live Document Box */}
        <div className={`p-3.5 rounded-lg border transition-all ${
          activeMode === 'LIVE'
            ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400'
            : 'bg-slate-50 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              MODE A: LIVE DOCUMENT PROCESSING
            </span>
            <span className="text-[10px] bg-blue-200/70 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
              Real OCR & Verification
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Upload actual PDFs or images. Processes through OpenCV preprocessing, RapidOCR (PP-OCRv6), deterministic classification, and System B statutory rules.
          </p>
        </div>

        {/* Demo Scenario Box */}
        <div className={`p-3.5 rounded-lg border transition-all ${
          activeMode === 'DEMO'
            ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400'
            : 'bg-slate-50 border-slate-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              MODE B: BENCHMARK DEMO SCENARIOS
            </span>
            <span className="text-[10px] bg-amber-200/70 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
              Preset Test Bench
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (setActiveMode) setActiveMode('DEMO');
                onRunDemo('eligible');
              }}
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Eligible</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (setActiveMode) setActiveMode('DEMO');
                onRunDemo('ineligible');
              }}
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3 h-3" />
              <span>Ineligible</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (setActiveMode) setActiveMode('DEMO');
                onRunDemo('human_review');
              }}
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields: Scheme and App ID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">
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
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-700">
            Upload Applicant Documents (PDF, JPG, JPEG, PNG)
          </label>
          {files.length > 0 && (
            <button
              type="button"
              onClick={() => setFiles([])}
              className="text-[11px] text-rose-600 hover:underline"
            >
              Clear files
            </button>
          )}
        </div>

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
          <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-700">
            <span className="text-blue-600 font-semibold">Click to select files</span> or drag and drop documents here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Single or multi-document: ST Certificate, Income Cert, Aadhaar, Marksheet, Admission Letter, Bank Passbook
          </p>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Attached Documents ({files.length}):</span>
              <span className="text-[10px] text-slate-500">Ready for Live OCR Processing</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded"
                >
                  <span className="truncate flex items-center gap-1.5 text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
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
          onClick={() => {
            if (setActiveMode) setActiveMode('LIVE');
            onProcess();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs sm:text-sm shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Executing Live Pipeline: RapidOCR → System A Extraction → System B Rules...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-400" />
              <span>
                {files.length > 0
                  ? `Process ${files.length} Uploaded Document(s) (Live Pipeline)`
                  : 'Select or Drag Documents Above to Process'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
