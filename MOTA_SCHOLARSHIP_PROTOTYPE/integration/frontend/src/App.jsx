import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ApplicationSection from './components/ApplicationSection';
import PipelineStatus from './components/PipelineStatus';
import DocumentIntelligenceSection from './components/DocumentIntelligenceSection';
import ApplicantProfileSection from './components/ApplicantProfileSection';
import CrossDocValidationSection from './components/CrossDocValidationSection';
import EligibilityVerificationSection from './components/EligibilityVerificationSection';
import FinalResultSection from './components/FinalResultSection';
import RawJsonModal from './components/RawJsonModal';

const INITIAL_STAGES = [
  { id: 'upload', name: 'Document Upload', description: 'Multipart document ingestion', status: 'Pending' },
  { id: 'preprocessing', name: 'File Processing', description: 'PyMuPDF raster & OpenCV CLAHE', status: 'Pending' },
  { id: 'ocr', name: 'PaddleOCR', description: 'PP-OCRv6 text recognition', status: 'Pending' },
  { id: 'classification', name: 'Document Classification', description: 'Deterministic evidence matching', status: 'Pending' },
  { id: 'extraction', name: 'Field Extraction', description: 'Attribute extraction with confidence', status: 'Pending' },
  { id: 'validation', name: 'Cross-Doc Validation', description: 'Cross-entity alignment check', status: 'Pending' },
  { id: 'verification', name: 'Eligibility Verification', description: 'System B statutory rule engine', status: 'Pending' },
  { id: 'report', name: 'Final Report', description: 'Explainable verdict with officer sign-off', status: 'Pending' }
];

export default function App() {
  const [health, setHealth] = useState({ integration: 'UP', systemA: 'UP', systemB: 'UP' });
  const [applicationId, setApplicationId] = useState('MOTA-2026-APP-001');
  const [scheme, setScheme] = useState('PRE_MATRIC');
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('LIVE');

  // Poll health on mount
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      setHealth({ integration: 'UP', systemA: 'DOWN', systemB: 'DOWN' });
    }
  };

  const updateStage = (id, status) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const resetStages = () => {
    setStages(INITIAL_STAGES);
    setErrorMsg(null);
  };

  // Run Demo
  const handleRunDemo = async (scenario) => {
    setActiveMode('DEMO');
    setIsProcessing(true);
    resetStages();

    // Stage 1: Upload
    updateStage('upload', 'Processing');
    await new Promise(r => setTimeout(r, 150));
    updateStage('upload', 'Completed');

    // Stage 2: Processing
    updateStage('preprocessing', 'Processing');
    await new Promise(r => setTimeout(r, 150));
    updateStage('preprocessing', 'Completed');

    // Stage 3: OCR
    updateStage('ocr', 'Processing');
    await new Promise(r => setTimeout(r, 200));
    updateStage('ocr', 'Completed');

    // Stage 4: Classification
    updateStage('classification', 'Processing');
    await new Promise(r => setTimeout(r, 150));
    updateStage('classification', 'Completed');

    // Stage 5: Extraction
    updateStage('extraction', 'Processing');
    await new Promise(r => setTimeout(r, 200));
    updateStage('extraction', 'Completed');

    // Stage 6: Validation
    updateStage('validation', 'Processing');

    try {
      const res = await fetch('/api/demo-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });

      if (!res.ok) {
        throw new Error(`Demo failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      updateStage('validation', 'Completed');

      // Stage 7: Verification
      updateStage('verification', 'Processing');
      await new Promise(r => setTimeout(r, 200));
      updateStage('verification', 'Completed');

      // Stage 8: Report
      updateStage('report', 'Completed');

      setResultData(data);
      if (data.applicationId) setApplicationId(data.applicationId);
      if (data.scheme) setScheme(data.scheme);
    } catch (err) {
      updateStage('validation', 'Failed');
      updateStage('verification', 'Failed');
      updateStage('report', 'Failed');
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Live Upload
  const handleProcessApplication = async () => {
    if (files.length === 0) return;
    setActiveMode('LIVE');
    setIsProcessing(true);
    resetStages();

    const formData = new FormData();
    formData.append('applicationId', applicationId);
    formData.append('scheme', scheme);
    for (const f of files) {
      formData.append('documents', f);
    }

    try {
      // Stage 1: Document Upload
      updateStage('upload', 'Processing');
      await new Promise(r => setTimeout(r, 200));
      updateStage('upload', 'Completed');

      // Stage 2: File Processing
      updateStage('preprocessing', 'Processing');
      await new Promise(r => setTimeout(r, 200));
      updateStage('preprocessing', 'Completed');

      // Stage 3 & 4: OCR & Classification
      updateStage('ocr', 'Processing');
      updateStage('classification', 'Processing');

      const res = await fetch('/api/process-application', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = data.message || data.error || 'Application processing failed';
        if (errorText.toLowerCase().includes('ocr') || errorText.toLowerCase().includes('document intelligence')) {
          updateStage('ocr', 'Failed');
          updateStage('classification', 'Failed');
          throw new Error('OCR processing failed. Human verification required.');
        }
        if (errorText.toLowerCase().includes('verification') || errorText.toLowerCase().includes('system b')) {
          updateStage('ocr', 'Completed');
          updateStage('classification', 'Completed');
          updateStage('extraction', 'Completed');
          updateStage('verification', 'Failed');
          throw new Error('Eligibility could not be determined from available information.');
        }
        throw new Error(errorText);
      }

      // Check if any document failed classification
      const unknownDocs = (data.documents || []).filter(d => d.documentType === 'UNKNOWN' || d.confidence < 0.5);
      if (unknownDocs.length > 0 && data.documents.length === unknownDocs.length) {
        // All documents were unknown
        updateStage('ocr', 'Completed');
        updateStage('classification', 'Completed');
        updateStage('extraction', 'Completed');
        updateStage('validation', 'Completed');
        updateStage('verification', 'Completed');
        updateStage('report', 'Completed');
        setErrorMsg('Document could not be reliably classified. Proceeding with officer review.');
      } else {
        updateStage('ocr', 'Completed');
        updateStage('classification', 'Completed');
        updateStage('extraction', 'Completed');
        updateStage('validation', 'Completed');
        updateStage('verification', 'Completed');
        updateStage('report', 'Completed');
      }

      setResultData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Processing error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header health={health} />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs text-rose-900 flex items-start justify-between shadow-sm">
            <div>
              <strong className="font-semibold block text-sm mb-0.5">Processing Alert</strong>
              <p>{errorMsg}</p>
              <p className="text-[11px] text-rose-600 mt-1">
                The system remains fully operational. You can test live document uploads or benchmark demo scenarios.
              </p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-800 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Application */}
        <ApplicationSection
          applicationId={applicationId}
          setApplicationId={setApplicationId}
          scheme={scheme}
          setScheme={setScheme}
          files={files}
          setFiles={setFiles}
          onProcess={handleProcessApplication}
          onRunDemo={handleRunDemo}
          isProcessing={isProcessing}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
        />

        {/* Section 2: Pipeline Execution Status (8 Stages) */}
        <PipelineStatus stages={stages} />

        {/* Sections 3 to 7: Active Results View */}
        {resultData && (
          <div className="space-y-6 animate-fadeIn">
            {/* Section 3: Document Intelligence */}
            <DocumentIntelligenceSection
              documentResults={resultData.documentIntelligence?.documentResults || resultData.documents}
            />

            {/* Section 4: Applicant Profile */}
            <ApplicantProfileSection
              applicant={resultData.applicantProfile?.applicant || resultData.applicant}
              education={resultData.applicantProfile?.education || resultData.education}
              financial={resultData.applicantProfile?.financial || resultData.financial}
            />

            {/* Section 5: Cross-Document Validation */}
            <CrossDocValidationSection
              validations={resultData.documentIntelligence?.crossDocumentValidation}
              reviewFlags={resultData.documentIntelligence?.reviewFlags}
              anomalies={resultData.documentIntelligence?.anomalies}
            />

            {/* Section 6: Eligibility Verification */}
            <EligibilityVerificationSection
              ruleEvaluation={resultData.verification?.rules || resultData.verification?.ruleEvaluation}
              documentVerification={resultData.verification?.documents || resultData.verification?.documentVerification}
            />

            {/* Section 7: Final Result */}
            <FinalResultSection
              verification={resultData.verification}
              documentIntelligence={resultData.documentIntelligence}
              onViewJson={() => setIsJsonModalOpen(true)}
            />
          </div>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Ministry of Tribal Affairs (MoTA) — AI-Assisted Scholarship & Fellowship Verification Engine
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            System A (5001) + System B (5050) + Integration (5002) + RapidOCR (5003)
          </div>
        </div>
      </footer>

      {/* Raw JSON Modal */}
      <RawJsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        data={resultData}
      />
    </div>
  );
}
