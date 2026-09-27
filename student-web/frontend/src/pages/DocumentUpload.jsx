import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Globe,
  FileText,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import api from '../api/axios';

const REQUIRED_DOCUMENTS = [
  'Caste Certificate',
  'Income Certificate',
  'Latest Marksheet',
  'Admission Letter',
];

const DocumentUpload = () => {
  const { schemeId } = useParams();
  const normalizedSchemeId = schemeId?.toLowerCase();
  const isValidScheme = normalizedSchemeId === 'nfst' || normalizedSchemeId === 'nos';

  const [draft, setDraft] = useState(null);
  const [draftChecked, setDraftChecked] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');

  const [documents, setDocuments] = useState(() =>
    REQUIRED_DOCUMENTS.map((name) => ({
      name,
      file: null,
      source: null,
      fileName: null,
    }))
  );

  const fileInputRefs = useRef([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('applicationDraft');
    if (saved) {
      try {
        setDraft(JSON.parse(saved));
      } catch (e) {
        setDraft(null);
      }
    }
    setDraftChecked(true);
  }, []);

  if (!isValidScheme) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
        <SiteHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
          <h1 className="text-[22px] font-bold text-[#1c2b3a] mb-2">Scheme not found</h1>
          <p className="text-[14px] text-[#6b7a8d] mb-6">
            The requested scholarship or fellowship scheme does not exist.
          </p>
          <Link
            to="/schemes"
            className="bg-[#1a3557] hover:bg-[#102540] text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors inline-block"
          >
            Back to Schemes
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (draftChecked && !draft) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
        <SiteHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
          <h1 className="text-[22px] font-bold text-[#1c2b3a] mb-2">
            Please complete the application form first
          </h1>
          <p className="text-[14px] text-[#6b7a8d] mb-6">
            You need to fill out your personal and academic information before uploading documents.
          </p>
          <Link
            to={`/apply/${normalizedSchemeId}`}
            className="bg-[#1a3557] hover:bg-[#102540] text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors inline-block"
          >
            Go to Application Form
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const isNfst = normalizedSchemeId === 'nfst';
  const schemeTitle = isNfst ? 'NFST Scheme' : 'NOS Scheme';

  const handleFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocuments((prev) =>
        prev.map((doc, i) =>
          i === index
            ? {
                ...doc,
                file,
                source: 'manual',
                fileName: file.name,
                content_base64: reader.result,
              }
            : doc
        )
      );
    };
    reader.readAsDataURL(file);
    setError('');
  };

  // DigiLocker OAuth / Sandbox consent flow simulation
  const handleDigiLockerFetch = (index) => {
    setDocuments((prev) =>
      prev.map((doc, i) =>
        i === index
          ? {
              ...doc,
              file: null,
              source: 'digilocker',
              fileName: 'DigiLocker Verified Document',
              content_base64: null,
            }
          : doc
      )
    );
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allHandled = documents.every((doc) => doc.source !== null);
    if (!allHandled) {
      setError('Please provide all required documents before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...draft,
        scheme: (draft?.scheme || normalizedSchemeId).toUpperCase(),
        documents: documents.map((doc) => ({
          name: doc.name,
          source: doc.source,
          content_base64: doc.content_base64 || null,
        })),
      };

      const response = await api.post('/student/applications', payload);
      const appCode = response.data?.application?.applicationCode;
      setSubmittedCode(appCode || '');
      sessionStorage.removeItem('applicationDraft');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allDocumentsHandled = documents.every((doc) => doc.source !== null);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <SiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Banner */}
        <div className="bg-white border border-[#dde1e7] rounded-xl p-5 mb-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557] shrink-0">
              {isNfst ? <GraduationCap className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[12px] text-[#6b7a8d] block leading-tight">Applying for</span>
              <span className="text-[16px] font-semibold text-[#1c2b3a] leading-tight">{schemeTitle}</span>
            </div>
          </div>
          <Link
            to="/schemes"
            className="text-[13px] font-medium text-[#1a3557] hover:underline shrink-0"
          >
            Change scheme
          </Link>
        </div>

        {/* 2-Step Flow Indicator */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="bg-[#1a3557] text-white px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1">
            <span>1. Personal &amp; Academic Info</span>
          </div>
          <div className="w-6 h-[2px] bg-[#1a3557] shrink-0" />
          <div className="border-2 border-[#1a3557] text-[#1a3557] bg-white px-3 py-1 rounded-full text-[12px] font-medium">
            <span>2. Documents</span>
          </div>
        </div>

        {submitted ? (
          /* IN-PAGE SUCCESS STATE */
          <div className="bg-white border border-[#dde1e7] rounded-xl p-8 sm:p-10 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="p-3 rounded-full bg-green-50 mb-4">
              <CheckCircle className="w-[48px] h-[48px] text-[#16a34a]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#1c2b3a] mb-2">
              Application Submitted Successfully
            </h2>
            <p className="text-[14px] text-[#6b7a8d] max-w-sm mx-auto mb-6 leading-relaxed">
              Your application {submittedCode ? `(${submittedCode}) ` : ''}for the {schemeTitle} has been received. You can track its status from your dashboard.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center bg-[#1a3557] hover:bg-[#102540] text-white text-[14px] font-medium px-6 py-2.5 rounded-lg min-h-[44px] transition-colors shadow-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          /* UPLOAD FORM CARD */
          <div className="bg-white border border-[#dde1e7] rounded-xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-[16px] font-semibold text-[#1c2b3a] border-b border-[#dde1e7] pb-3 mb-2">
              Upload Required Documents
            </h2>
            <p className="text-[13px] text-[#6b7a8d] mb-5">
              Upload each document manually, or fetch it instantly and pre-verified via DigiLocker.
            </p>

            {/* Document List */}
            <div className="divide-y divide-[#f0f2f5] mb-6">
              {documents.map((doc, index) => {
                const isHandled = doc.source !== null;

                return (
                  <div
                    key={doc.name}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    {/* Left: Icon, Name & Status */}
                    <div className="flex items-start gap-3">
                      <FileText
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          isHandled ? 'text-[#16a34a]' : 'text-[#9aa3af]'
                        }`}
                      />
                      <div>
                        <h3 className="text-[14px] font-medium text-[#1c2b3a]">{doc.name}</h3>
                        <div className="text-[12px] mt-0.5">
                          {doc.source === null && (
                            <span className="text-[#9aa3af]">Not uploaded yet</span>
                          )}
                          {doc.source === 'manual' && (
                            <span className="text-[#6b7a8d]">Uploaded: {doc.fileName}</span>
                          )}
                          {doc.source === 'digilocker' && (
                            <span className="text-[#16a34a] font-medium inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 inline shrink-0" />
                              <span>Verified via DigiLocker</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        onChange={(e) => handleFileChange(index, e)}
                        className="hidden"
                      />

                      {/* Manual Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className={`bg-white border border-[#dde1e7] text-[#4b5563] hover:bg-gray-50 text-[13px] px-3.5 py-2 rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isHandled ? 'opacity-60 hover:opacity-100' : ''
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-[#6b7a8d]" />
                        <span>Upload File</span>
                      </button>

                      {/* DigiLocker Button */}
                      <button
                        type="button"
                        onClick={() => handleDigiLockerFetch(index)}
                        className={`bg-[#1a3557] hover:bg-[#102540] text-white text-[13px] px-3.5 py-2 rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                          isHandled ? 'opacity-60 hover:opacity-100' : ''
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Fetch via DigiLocker</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-2.5 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Bottom Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#dde1e7]">
              <Link
                to={`/apply/${normalizedSchemeId}`}
                className="bg-white border border-[#dde1e7] text-[#4b5563] hover:bg-gray-50 rounded-lg px-6 py-2.5 text-[14px] font-medium min-h-[44px] inline-flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allDocumentsHandled || submitting}
                className="bg-[#1a3557] hover:bg-[#102540] text-white rounded-lg px-6 py-2.5 text-[14px] font-medium min-h-[44px] inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default DocumentUpload;
