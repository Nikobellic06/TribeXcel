import { useEffect, useState, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  BadgeCheck,
  Check,
  Building,
} from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import Button from '../ui/Button';
import DocumentDetailsDrawer from './DocumentDetailsDrawer';
import {
  initiateDigiLockerAuth,
  submitDigiLockerOtp,
  submitDigiLockerConsent,
  fetchIssuedDigiLockerDocuments,
  retrieveDigiLockerDocuments,
  completeDigiLockerSession,
  cancelDigiLockerSession,
} from '../../api/student';

/**
 * High-Fidelity DigiLocker Sandbox Simulation Modal
 * Conforms strictly to government digital service aesthetics and complete OAuth flow.
 */
export default function DigiLockerSandboxModal({
  open,
  onClose,
  docs = [],
  context = {},
  onComplete,
}) {
  const { tx, lang } = useLang();

  // Stages:
  // 'AUTH_PROMPT' -> 'OTP_AUTH' -> 'CONSENT' -> 'CONNECTING_SEQUENCE' -> 'ISSUED_DOCS' -> 'RETRIEVING_SEQUENCE' -> 'SUCCESS' | 'ERROR'
  const [stage, setStage] = useState('AUTH_PROMPT');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // Loading Sequence State
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Issued Documents & Selection
  const [issuedDocs, setIssuedDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Retrieval Sequence State
  const [retrievalStepIndex, setRetrievalStepIndex] = useState(0);
  const [retrievedDocs, setRetrievedDocs] = useState([]);
  const [autoFillData, setAutoFillData] = useState({});

  // Transition timer ref
  const timerRef = useRef(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Initialize or reset session when opened
  useEffect(() => {
    if (!open) {
      setStage('AUTH_PROMPT');
      setSession(null);
      setErrorInfo(null);
      setOtp('');
      setOtpError('');
      setIssuedDocs([]);
      setSelectedDocIds([]);
      setRetrievedDocs([]);
      setDrawerOpen(false);
      return;
    }

    async function initSession() {
      setLoading(true);
      setErrorInfo(null);
      try {
        const res = await initiateDigiLockerAuth({
          applicationId: context.applicationId || null,
          schemeCode: context.schemeCode || '',
          requestedDocuments: docs,
        });

        if (res.success) {
          setSession(res);
          setStage('AUTH_PROMPT');
        } else {
          setErrorInfo({
            code: 'SESSION_INIT_FAILED',
            message: res.message || 'Unable to initialize DigiLocker integration session.',
          });
          setStage('ERROR');
        }
      } catch (err) {
        setErrorInfo({
          code: err.response?.data?.code || 'NETWORK_ERROR',
          message:
            err.response?.data?.message ||
            tx({
              en: 'DigiLocker service is temporarily unavailable. Please retry.',
              hi: 'डिजिलॉकर सेवा अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।',
            }),
        });
        setStage('ERROR');
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, [open, docs]);

  // Resend OTP countdown
  useEffect(() => {
    let interval = null;
    if (stage === 'OTP_AUTH' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage, resendTimer]);

  /* ----------------- Step Actions ----------------- */

  // Step 2 -> Step 3: Candidate clicks "Allow"
  const handleAllowAuthorization = () => {
    setStage('OTP_AUTH');
    setResendTimer(30);
    setOtp('');
    setOtpError('');
  };

  // Step 2: Candidate clicks "Cancel"
  const handleCancelAuthorization = async () => {
    if (session?.sessionId) {
      try {
        await cancelDigiLockerSession(session.sessionId);
      } catch (e) {
        // ignore
      }
    }
    setErrorInfo({
      code: 'AUTH_CANCELLED',
      message: 'Authorization was cancelled.',
    });
    setStage('ERROR');
  };

  // Step 3 -> Step 4: OTP Verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      setOtpError(tx({ en: 'Please enter a valid 6-digit OTP code.', hi: 'कृपया 6-अंकीय ओटीपी दर्ज करें।' }));
      return;
    }

    setLoading(true);
    setOtpError('');
    try {
      const res = await submitDigiLockerOtp(session.sessionId, otp.trim());
      if (res.success) {
        setStage('CONSENT');
      } else {
        setOtpError(res.message || 'Invalid OTP code.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid OTP provided. Please enter the correct verification code.';
      setOtpError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Consent confirmation
  const handleGrantConsent = async () => {
    setLoading(true);
    setErrorInfo(null);
    try {
      await submitDigiLockerConsent(session.sessionId, true);
      // Run realistic multi-stage loading sequence (300-900ms transitions)
      setStage('CONNECTING_SEQUENCE');
      runConnectingSequence();
    } catch (err) {
      setLoading(false);
      setErrorInfo({
        code: err.response?.data?.code || 'CONSENT_DENIED',
        message: err.response?.data?.message || 'Document sharing was not authorized.',
      });
      setStage('ERROR');
    }
  };

  const handleDenyConsent = async () => {
    setLoading(true);
    try {
      await submitDigiLockerConsent(session.sessionId, false);
    } catch (e) {
      // expected failure
    } finally {
      setLoading(false);
      setErrorInfo({
        code: 'CONSENT_DENIED',
        message: 'Document sharing was not authorized.',
      });
      setStage('ERROR');
    }
  };

  // Step 5: Realistic loading sequence
  const connectingSteps = [
    { en: 'Connecting securely to National Identity Gateway...', hi: 'राष्ट्रीय पहचान गेटवे से सुरक्षित रूप से जुड़ रहे हैं...' },
    { en: 'Authenticating citizen credential session...', hi: 'नागरिक क्रेडेंशियल सत्र का प्रमाणीकरण...' },
    { en: 'Loading issued documents from State & Central repositories...', hi: 'राज्य एवं केंद्रीय रिपॉजिटरी से जारी दस्तावेज़ लोड हो रहे हैं...' },
    { en: 'Checking certificate availability and validity...', hi: 'प्रमाणपत्रों की उपलब्धता एवं वैधता की जाँच...' },
    { en: 'Preparing secure document access...', hi: 'सुरक्षित दस्तावेज़ पहुंच तैयार की जा रही है...' },
  ];

  const runConnectingSequence = () => {
    setLoadingStepIndex(0);

    const stepIntervals = [450, 600, 750, 500, 400];

    const advance = (idx) => {
      if (idx < connectingSteps.length - 1) {
        setLoadingStepIndex(idx + 1);
        timerRef.current = setTimeout(() => advance(idx + 1), stepIntervals[idx + 1] || 500);
      } else {
        // Complete loading sequence and load issued documents
        fetchDocumentsList();
      }
    };

    timerRef.current = setTimeout(() => advance(0), stepIntervals[0]);
  };

  const fetchDocumentsList = async () => {
    try {
      const res = await fetchIssuedDigiLockerDocuments(session.sessionId);
      if (res.success && Array.isArray(res.documents)) {
        if (res.documents.length === 0) {
          setErrorInfo({
            code: 'NO_DOCUMENTS',
            message: 'No issued documents matching this application were found.',
          });
          setStage('ERROR');
          return;
        }

        setIssuedDocs(res.documents);

        // Pre-select documents that match requested types
        const requestedTypes = docs.map((d) => d.id || d.docType);
        const autoSelected = res.documents
          .filter((d) => requestedTypes.length === 0 || requestedTypes.includes(d.documentType))
          .map((d) => d.documentId);

        setSelectedDocIds(autoSelected.length > 0 ? autoSelected : res.documents.map((d) => d.documentId));
        setStage('ISSUED_DOCS');
      } else {
        setErrorInfo({
          code: 'FETCH_FAILED',
          message: res.message || 'Unable to retrieve issued documents catalogue.',
        });
        setStage('ERROR');
      }
    } catch (err) {
      setErrorInfo({
        code: err.response?.data?.code || 'FETCH_FAILED',
        message: err.response?.data?.message || 'DigiLocker service is temporarily unavailable.',
      });
      setStage('ERROR');
    } finally {
      setLoading(false);
    }
  };

  // Toggle document selection
  const toggleDocSelection = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Step 7 -> Step 8: Share selected documents
  const retrievalSteps = [
    { en: 'Authorization confirmed with DigiLocker Gateway', hi: 'डिजिलॉकर गेटवे के साथ प्राधिकरण पुष्ट' },
    { en: 'Document references received from issuing authorities', hi: 'जारीकर्ता प्राधिकरणों से दस्तावेज़ संदर्भ प्राप्त' },
    { en: 'Document metadata retrieved and validated', hi: 'दस्तावेज़ मेटाडेटा प्राप्त एवं सत्यापित' },
    { en: 'Document integrity checked: Passed', hi: 'दस्तावेज़ सत्यनिष्ठा जाँच: उत्तीर्ण' },
    { en: 'Documents securely transferred to TribeXcel application', hi: 'दस्तावेज़ ट्राइबएक्सेल आवेदन में सुरक्षित रूप से स्थानांतरित' },
  ];

  const handleShareSelected = async () => {
    if (selectedDocIds.length === 0) return;

    setStage('RETRIEVING_SEQUENCE');
    setRetrievalStepIndex(0);

    // Call backend retrieval immediately
    let backendResult = null;
    let backendError = null;

    try {
      backendResult = await retrieveDigiLockerDocuments(session.sessionId, selectedDocIds);
    } catch (err) {
      backendError = err;
    }

    // Progress animations through steps
    const stepDelays = [400, 550, 650, 500, 450];
    const advanceRetrieval = (idx) => {
      if (idx < retrievalSteps.length - 1) {
        setRetrievalStepIndex(idx + 1);
        timerRef.current = setTimeout(() => advanceRetrieval(idx + 1), stepDelays[idx + 1] || 500);
      } else {
        // Check outcome
        if (backendError) {
          setErrorInfo({
            code: backendError.response?.data?.code || 'RETRIEVAL_FAILED',
            message: backendError.response?.data?.message || 'This document could not be retrieved.',
          });
          setStage('ERROR');
        } else if (backendResult && backendResult.success) {
          setRetrievedDocs(backendResult.documents || backendResult.retrievedDocuments || []);
          setAutoFillData(backendResult.autoFillFields || {});
          setStage('SUCCESS');
          // Complete session on backend
          completeDigiLockerSession(session.sessionId).catch(() => {});
        } else {
          setErrorInfo({
            code: 'RETRIEVAL_FAILED',
            message: backendResult?.message || 'This document could not be retrieved.',
          });
          setStage('ERROR');
        }
      }
    };

    timerRef.current = setTimeout(() => advanceRetrieval(0), stepDelays[0]);
  };

  // Return to TribeXcel
  const handleReturnToTribeXcel = () => {
    if (onComplete && retrievedDocs.length > 0) {
      // Map to application format
      const formattedRecords = retrievedDocs.map((doc) => ({
        docType: doc.documentType,
        name: `${doc.documentName || doc.fileName || doc.documentType}.pdf`,
        fileName: `${doc.documentName || doc.fileName || doc.documentType}.pdf`,
        fileUrl: doc.fileUrl,
        source: 'digilocker',
        verified: true,
        verificationStatus: 'VERIFIED',
        verificationMethod: 'DIGILOCKER_WALLET',
        issuer: doc.issuer,
        certificateNo: doc.certificateNo || doc.documentReference,
        digilockerUri: doc.certificateNo || doc.documentReference,
        size: 1024 * 120,
        mimeType: 'application/pdf',
        uploadedAt: doc.retrievedAt || new Date().toISOString(),
        aiVerification: {
          detectedType: doc.documentType.toUpperCase(),
          typeLabel: doc.documentName,
          confidence: 1.0,
          preliminaryStatus: 'VERIFIED',
          extractedFields: {
            issuer: doc.issuer,
            certificateNo: doc.certificateNo || doc.documentReference,
            status: 'Issued Document Retrieved',
            source: 'DigiLocker',
          },
          checks: [
            { label: 'DigiLocker Metadata & Schema Validated', passed: true },
            { label: 'Integrity Check: Passed', passed: true },
            { label: 'Provider Response: Successful', passed: true },
          ],
          advisory: 'Issued document retrieved via DigiLocker. Matched with application requirement.',
        },
      }));

      onComplete(formattedRecords, autoFillData);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-5">
      <div
        className="relative flex w-full max-w-xl flex-col rounded-lg border border-line bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* ============================================================== */}
        {/* TribeXcel DigiLocker Sandbox Header */}
        {/* Institutional Header */}
        <div className="border-b border-[#0f3460]/20 bg-[#0f284e] px-5 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-accent" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-[15px] font-bold tracking-tight text-white">
                      DigiLocker
                    </span>
                    <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[9px] font-semibold text-accent border border-accent/40">
                      GOVERNMENT OF INDIA
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-200/80 leading-none">
                    National Digital Document Wallet • Ministry of Electronics & IT
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium text-blue-100">
                Ministry of Tribal Affairs Partner
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Body based on Stage */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 text-[13px] text-ink min-h-[360px] flex flex-col justify-between">
          {/* ---------------- STAGE 1: STEP 2 AUTHORIZATION SCREEN ---------------- */}
          {stage === 'AUTH_PROMPT' && (
            <div className="space-y-4">
              <div className="rounded border border-navy/20 bg-paper p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-navy/20 bg-white text-navy font-bold">
                    <ShieldCheck className="h-6 w-6 text-navy" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-bold text-navy leading-snug">
                      TribeXcel is requesting access to your DigiLocker documents.
                    </h3>
                    <p className="text-[12px] text-muted">
                      Official Document Gateway • Verification for Ministry Scholarship
                    </p>
                  </div>
                </div>
              </div>

              {/* Portal & Purpose Info */}
              <div className="rounded border border-line bg-white p-3.5 space-y-2 text-[12.5px]">
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <span className="font-semibold text-muted">Application:</span>
                  <span className="font-medium text-ink">TribeXcel Scholarship Portal</span>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <span className="font-semibold text-muted">Purpose:</span>
                  <span className="font-medium text-ink">Scholarship application document verification</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted">Authority:</span>
                  <span className="font-medium text-ink">Ministry of Tribal Affairs (MoTA)</span>
                </div>
              </div>

              {/* Requested Permissions List */}
              <div className="space-y-2">
                <p className="font-semibold text-[13px] text-navy">
                  Requested permissions:
                </p>
                <ul className="space-y-2 rounded border border-line bg-neutral-50/70 p-3.5 text-[12.5px]">
                  <li className="flex items-center gap-2.5 text-ink font-medium">
                    <CheckCircle2 className="h-4 w-4 text-leaf shrink-0" />
                    <span>View issued documents in your repository</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-ink font-medium">
                    <CheckCircle2 className="h-4 w-4 text-leaf shrink-0" />
                    <span>Retrieve selected documents for application processing</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-ink font-medium">
                    <CheckCircle2 className="h-4 w-4 text-leaf shrink-0" />
                    <span>Verify document metadata & issuing department authenticity</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-line">
                <Button variant="secondary" onClick={handleCancelAuthorization}>
                  Cancel
                </Button>
                <Button iconRight={ArrowRight} onClick={handleAllowAuthorization}>
                  Allow
                </Button>
              </div>
            </div>
          )}

          {/* ---------------- STAGE 2: STEP 3 AUTHENTICATION (MOBILE & OTP) ---------------- */}
          {stage === 'OTP_AUTH' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-bold text-navy">
                  Authenticate your DigiLocker Account
                </h3>
                <p className="text-[12px] text-muted mt-0.5">
                  Enter the 6-digit One Time Password (OTP) sent to your linked mobile.
                </p>
              </div>

              <div className="rounded border border-line bg-paper p-3.5 space-y-2 text-[12.5px]">
                <div className="flex justify-between">
                  <span className="text-muted">Candidate Name:</span>
                  <span className="font-semibold text-ink">Arjun Kumar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Registered Mobile:</span>
                  <span className="font-mono font-medium text-ink">98XXXXXX42</span>
                </div>
              </div>

              {/* OTP Input Form */}
              <div className="space-y-2">
                <label htmlFor="otp-input" className="block text-[12.5px] font-semibold text-navy">
                  Enter 6-Digit OTP:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-48 font-mono text-[16px] tracking-widest text-center px-3 py-2 rounded border border-line focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                    autoFocus
                  />
                  <Button onClick={handleVerifyOtp} loading={loading} disabled={otp.length !== 6}>
                    Verify OTP
                  </Button>
                </div>

                {otpError && (
                  <p className="text-[12px] text-alert font-medium mt-1 flex items-center gap-1.5" role="alert">
                    <AlertCircle className="h-4 w-4" />
                    {otpError}
                  </p>
                )}

                <p className="mt-3 text-[11.5px] text-muted leading-relaxed">
                  Enter the 6-digit security code received on your mobile. Do not share your OTP with anyone.
                </p>

                <div className="pt-2 text-[12px] text-muted flex items-center justify-between">
                  <span>Didn't receive code?</span>
                  {resendTimer > 0 ? (
                    <span>Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResendTimer(30)}
                      className="text-navy font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-line">
                <Button variant="ghost" size="sm" onClick={() => setStage('AUTH_PROMPT')}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* ---------------- STAGE 3: STEP 4 CONSENT CONFIRMATION ---------------- */}
          {stage === 'CONSENT' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-bold text-navy">
                  Consent Confirmation
                </h3>
                <p className="text-[12px] text-muted mt-0.5">
                  You're about to share selected documents with TribeXcel.
                </p>
              </div>

              <div className="rounded border border-line bg-paper p-3 text-[12px] leading-relaxed text-muted">
                Under the Information Technology Act 2000, your explicit consent is required to access
                issued certificates from government department repositories.
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-[13px] text-navy">
                  Available document categories in repository:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                  <div className="flex items-center gap-2 rounded border border-line bg-white p-2.5">
                    <BadgeCheck className="h-4 w-4 text-leaf shrink-0" />
                    <span className="font-medium text-ink">ST Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border border-line bg-white p-2.5">
                    <BadgeCheck className="h-4 w-4 text-leaf shrink-0" />
                    <span className="font-medium text-ink">Academic Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border border-line bg-white p-2.5">
                    <BadgeCheck className="h-4 w-4 text-leaf shrink-0" />
                    <span className="font-medium text-ink">Income Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border border-line bg-white p-2.5">
                    <BadgeCheck className="h-4 w-4 text-leaf shrink-0" />
                    <span className="font-medium text-ink">Domicile Certificate</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-line">
                <Button variant="secondary" onClick={handleDenyConsent} disabled={loading}>
                  Deny
                </Button>
                <Button iconRight={ArrowRight} onClick={handleGrantConsent} loading={loading}>
                  Grant Consent & Continue
                </Button>
              </div>
            </div>
          )}

          {/* ---------------- STAGE 4: STEP 5 REALISTIC LOADING SEQUENCE ---------------- */}
          {stage === 'CONNECTING_SEQUENCE' && (
            <div className="py-8 space-y-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-soft text-navy animate-spin">
                <RefreshCw className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-navy">
                  Establishing Secure Connection
                </h4>
                <p className="text-[13px] font-medium text-ink">
                  {connectingSteps[loadingStepIndex]?.en}
                </p>
              </div>

              {/* Step indicator sequence */}
              <div className="max-w-xs mx-auto space-y-2 text-left text-[12px]">
                {connectingSteps.map((s, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 transition-colors ${
                      idx < loadingStepIndex
                        ? 'text-leaf font-medium'
                        : idx === loadingStepIndex
                        ? 'text-navy font-semibold'
                        : 'text-muted/60'
                    }`}
                  >
                    {idx < loadingStepIndex ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf shrink-0" />
                    ) : idx === loadingStepIndex ? (
                      <div className="h-2 w-2 rounded-full bg-navy animate-ping ml-0.5 mr-1" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-line ml-0.5 mr-1" />
                    )}
                    <span>{s.en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------- STAGE 5: STEP 6 ISSUED DOCUMENTS SCREEN ---------------- */}
          {stage === 'ISSUED_DOCS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-navy">
                    Issued Documents in Repository
                  </h3>
                  <p className="text-[12px] text-muted">
                    Candidate: <strong>Arjun Kumar</strong> • Select certificates to attach to your scholarship application.
                  </p>
                </div>
                <div className="text-[12px]">
                  <span className="font-semibold text-navy">
                    {selectedDocIds.length} of {issuedDocs.length}
                  </span>{' '}
                  <span className="text-muted">selected</span>
                </div>
              </div>

              {/* Document Cards List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {issuedDocs.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.documentId);
                  return (
                    <div
                      key={doc.documentId}
                      className={`rounded border p-3 transition-colors ${
                        isSelected
                          ? 'border-navy/40 bg-navy-soft/30'
                          : 'border-line bg-white hover:bg-paper'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <label className="mt-1 flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleDocSelection(doc.documentId)}
                              className="h-4 w-4 rounded border-line text-navy focus:ring-navy"
                            />
                          </label>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink text-[13.5px] leading-tight">
                              {doc.documentName}
                            </p>
                            <p className="text-[12px] text-muted mt-0.5">{doc.issuer}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="rounded bg-neutral-100 px-1.5 py-0.2 text-muted border border-line">
                                {doc.documentCategory}
                              </span>
                              <span className="text-muted">Issued: {doc.issuedDate}</span>
                              <span className="inline-flex items-center gap-0.5 font-medium text-leaf">
                                <Check className="h-3 w-3" /> Verified Issuer
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPreviewDoc(doc);
                            setDrawerOpen(true);
                          }}
                          className="shrink-0 text-[12px] font-semibold text-navy hover:underline flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-line">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedDocIds.length === issuedDocs.length) {
                      setSelectedDocIds([]);
                    } else {
                      setSelectedDocIds(issuedDocs.map((d) => d.documentId));
                    }
                  }}
                >
                  {selectedDocIds.length === issuedDocs.length ? 'Deselect All' : 'Select All'}
                </Button>

                <Button
                  iconRight={ArrowRight}
                  onClick={handleShareSelected}
                  disabled={selectedDocIds.length === 0}
                >
                  Share selected documents ({selectedDocIds.length})
                </Button>
              </div>
            </div>
          )}

          {/* ---------------- STAGE 6: STEP 8 SECURE RETRIEVAL SEQUENCE ---------------- */}
          {stage === 'RETRIEVING_SEQUENCE' && (
            <div className="py-8 space-y-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-leaf-soft text-leaf animate-pulse">
                <Lock className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-navy">
                  Securely retrieving documents...
                </h4>
                <p className="text-[12px] text-muted">
                  Validating cryptographic headers, issuer authenticity, and integrity hashes
                </p>
              </div>

              {/* Progress checklist */}
              <div className="max-w-md mx-auto space-y-2.5 text-left text-[12.5px]">
                {retrievalSteps.map((s, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded p-2 border transition-colors ${
                      idx < retrievalStepIndex
                        ? 'border-leaf/30 bg-leaf-soft/30 text-leaf font-medium'
                        : idx === retrievalStepIndex
                        ? 'border-navy/30 bg-navy-soft/30 text-navy font-semibold'
                        : 'border-line/40 bg-neutral-50/50 text-muted/50'
                    }`}
                  >
                    {idx < retrievalStepIndex ? (
                      <CheckCircle2 className="h-4 w-4 text-leaf shrink-0" />
                    ) : idx === retrievalStepIndex ? (
                      <RefreshCw className="h-4 w-4 text-navy animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-line shrink-0" />
                    )}
                    <span>{s.en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------- STAGE 7: STEP 9 SUCCESS & RETURN TO TRIBEXCEL ---------------- */}
          {stage === 'SUCCESS' && (
            <div className="space-y-4">
              <div className="rounded border border-leaf/30 bg-leaf-soft/40 p-4 flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-leaf shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-leaf leading-tight">
                    DigiLocker documents connected successfully
                  </h3>
                  <p className="text-[12px] text-muted">
                    {retrievedDocs.length} issued certificate(s) retrieved and mapped directly to your
                    scholarship application checklist.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-[13px] text-navy">
                  Retrieved & Verified Documents:
                </p>
                <div className="space-y-2 rounded border border-line bg-white p-3 divide-y divide-line text-[12.5px]">
                  {retrievedDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between pt-2 first:pt-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-leaf" />
                        <div>
                          <p className="font-medium text-ink">{doc.documentName}</p>
                          <p className="text-[11px] text-muted">
                            {doc.issuer} • Ref: {doc.documentReference}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded bg-leaf-soft px-2 py-0.5 text-[11px] font-semibold text-leaf border border-leaf/25">
                        <Check className="h-3 w-3" /> Matched
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border border-navy/15 bg-paper p-3 text-[12px] text-muted">
                <strong className="text-navy">Automatic Mapping Complete:</strong> You do not need to
                manually re-upload these certificates. Any non-retrieved documents (such as photo or bank
                passbook) remain for manual upload.
              </div>

              <div className="pt-3 flex justify-end border-t border-line">
                <Button iconRight={ArrowRight} onClick={handleReturnToTribeXcel}>
                  Return to TribeXcel Application
                </Button>
              </div>
            </div>
          )}

          {/* ---------------- ERROR STATE (HANDLES ALL REALISTIC FAILURES) ---------------- */}
          {stage === 'ERROR' && (
            <div className="py-6 space-y-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-alert-soft text-alert">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-[16px] font-bold text-navy">
                  DigiLocker Integration Notice
                </h4>
                <p className="text-[13px] text-ink font-medium max-w-sm mx-auto">
                  {errorInfo?.message || 'The integration request could not be completed.'}
                </p>
                <p className="text-[11.5px] text-muted">
                  Code: {errorInfo?.code || 'COMMUNICATION_ERROR'}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel & Upload Manually
                </Button>
                <Button
                  icon={RefreshCw}
                  onClick={() => {
                    setStage('AUTH_PROMPT');
                    setErrorInfo(null);
                  }}
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* Institutional Footer */}
        {/* ============================================================== */}
        <div className="border-t border-line bg-neutral-50 px-5 py-2.5 text-[11px] text-muted flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>DigiLocker • National Digital Document Gateway • Government of India</span>
          <span className="font-mono text-[10.5px]">256-bit SSL Protected Gateway</span>
        </div>
      </div>

      {/* Document Details Drawer */}
      <DocumentDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        document={previewDoc}
      />
    </div>
  );
}
