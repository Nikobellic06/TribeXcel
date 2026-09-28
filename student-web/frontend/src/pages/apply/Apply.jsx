import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleCheck, CloudOff, FileText, Save, Send } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import PortalLayout from '../../components/layout/PortalLayout';
import ApplicationSidebar from '../../components/apply/ApplicationSidebar';
import StepProgress from '../../components/apply/StepProgress';
import DigiLockerModal from '../../components/apply/DigiLockerModal';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PageLoader from '../../components/ui/PageLoader';
import StatusBadge from '../../components/ui/StatusBadge';
import { getScheme, SELECTION_YEAR } from '../../config/schemes';
import { STEPS, STEP_KEYS, stepIndex } from '../../config/steps';
import { evaluateEligibility, overallEligibility } from '../../utils/eligibility';
import { isStepComplete, validateStep } from '../../utils/stepValidation';
import { buildApplicationPayload, wizardStateFromApplication } from '../../utils/applicationPayload';
import { formatDate, toInputDate } from '../../utils/format';
import { apiErrorMessage } from '../../api/axios';
import {
  deleteDraft,
  fetchDraft,
  fetchMyApplications,
  fetchProfile,
  saveDraft,
  submitApplication,
} from '../../api/student';
import PersonalStep from './steps/PersonalStep';
import CategoryStep from './steps/CategoryStep';
import AcademicStep from './steps/AcademicStep';
import BankStep from './steps/BankStep';
import DocumentsStep from './steps/DocumentsStep';
import ReviewStep from './steps/ReviewStep';

const SECTIONS = ['personal', 'category', 'academic', 'bank', 'documents', 'declarations'];
const EMPTY = { personal: {}, category: {}, academic: {}, bank: {}, documents: {}, declarations: {} };
/** Statuses that mean "already applied this session" — only Deficient can be corrected. */
const LOCKED_STATUSES = ['Pending', 'Eligible', 'Flagged', 'Selected', 'Rejected'];

const STEP_INTRO = {
  personal: { en: 'Your basic details, contact and permanent address.', hi: 'आपका मूल विवरण, संपर्क और स्थायी पता।' },
  category: { en: 'Scheduled Tribe certificate, disability and family income.', hi: 'अनुसूचित जनजाति प्रमाण पत्र, दिव्यांगता और पारिवारिक आय।' },
  academic: { en: 'Your current course and previous qualification.', hi: 'आपका वर्तमान पाठ्यक्रम और पिछली योग्यता।' },
  bank: { en: 'The account where the scholarship will be paid.', hi: 'वह खाता जिसमें छात्रवृत्ति भेजी जाएगी।' },
  documents: { en: 'Fetch certificates from DigiLocker and upload the rest.', hi: 'प्रमाण पत्र डिजिलॉकर से प्राप्त करें और शेष अपलोड करें।' },
  review: { en: 'Check everything carefully. After final submission the form is locked.', hi: 'सब कुछ ध्यान से जाँचें। अंतिम जमा के बाद फ़ॉर्म लॉक हो जाता है।' },
};

function prefill(profile) {
  const s = profile || {};
  return {
    ...EMPTY,
    personal: {
      fullName: s.name || '',
      fatherName: s.fatherName || '',
      motherName: s.motherName || '',
      dob: toInputDate(s.dob),
      gender: s.gender || '',
      email: s.email || '',
      mobile: s.phone || '',
      altMobile: s.altPhone || '',
      addressLine: s.address?.line || '',
      district: s.address?.district || '',
      state: s.address?.state || s.state || '',
      pincode: s.address?.pincode || '',
    },
    category: { domicileState: s.state || '' },
    bank: { accountOf: 'student' },
  };
}

/** Aadhaar-verified identity always wins over whatever was saved in a draft. */
function applyKyc(data, profile) {
  if (!profile?.aadhaarVerified) return data;
  return {
    ...data,
    personal: {
      ...data.personal,
      fullName: profile.name || data.personal.fullName,
      dob: toInputDate(profile.dob) || data.personal.dob,
      gender: profile.gender || data.personal.gender,
    },
  };
}

const backupKey = (code, studentId) => `draft:${code}:${studentId || 'me'}`;

function readBackup(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Apply() {
  const { schemeId, step } = useParams();
  const scheme = getScheme(schemeId);
  const navigate = useNavigate();
  const { student } = useAuth();
  const { t, tx, lang } = useLang();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(EMPTY);
  const [savedSteps, setSavedSteps] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [lockedApp, setLockedApp] = useState(null);
  const [returnedApp, setReturnedApp] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // idle | dirty | saving | saved | offline | error
  const [lastSaved, setLastSaved] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [dl, setDl] = useState({ open: false, docs: [], onDone: null });
  const hydratedRef = useRef(false);
  const skipDirtyRef = useRef(false);

  const code = scheme?.code;
  const studentId = student?.id || student?._id;
  const localKey = backupKey(code, studentId);

  /* ---------------- Load draft, applications and profile ---------------- */
  useEffect(() => {
    if (!scheme) return undefined;
    let cancelled = false;
    hydratedRef.current = false;
    setLoading(true);

    Promise.allSettled([fetchDraft(code), fetchMyApplications(), fetchProfile()]).then(([draftRes, appsRes, profileRes]) => {
      if (cancelled) return;
      const prof = profileRes.status === 'fulfilled' ? profileRes.value : student;
      setProfile(prof);
      setProfileLoaded(profileRes.status === 'fulfilled');

      const apps = appsRes.status === 'fulfilled' ? appsRes.value : [];
      const mine = apps.filter((a) => a.scheme === code && (a.session || SELECTION_YEAR) === SELECTION_YEAR);
      const locked = mine.find((a) => LOCKED_STATUSES.includes(a.status));
      const returned = mine.find((a) => a.status === 'Deficient');
      setLockedApp(locked || null);
      setReturnedApp(returned || null);

      const serverDraft = draftRes.status === 'fulfilled' ? draftRes.value : null;
      const backup = readBackup(localKey);
      let initial;
      let steps = [];
      if (serverDraft?.data) {
        initial = { ...EMPTY, ...serverDraft.data };
        steps = serverDraft.completedSteps || [];
      } else if (backup?.data && draftRes.status === 'rejected') {
        initial = { ...EMPTY, ...backup.data };
        steps = backup.completedSteps || [];
      } else if (returned) {
        initial = { ...EMPTY, ...wizardStateFromApplication(returned) };
        steps = STEP_KEYS.filter((k) => k !== 'review');
      } else {
        initial = prefill(prof);
      }
      // The first data change after loading is the load itself, not an edit.
      hydratedRef.current = true;
      skipDirtyRef.current = true;
      setData(applyKyc(initial, prof));
      setSavedSteps(steps);
      setSaveState(serverDraft ? 'saved' : 'idle');
      setLastSaved(serverDraft?.updatedAt ? new Date(serverDraft.updatedAt) : null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeId]);

  /* ---------------- Local backup + unsaved marker ---------------- */
  useEffect(() => {
    if (!hydratedRef.current) return undefined;
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false;
      return undefined;
    }
    setSaveState((s) => (s === 'saving' ? s : 'dirty'));
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(localKey, JSON.stringify({ data, completedSteps: savedSteps, at: Date.now() }));
      } catch {
        /* quota or private mode — server draft still works */
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [data, savedSteps, localKey]);

  useEffect(() => {
    if (saveState !== 'dirty') return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [saveState]);

  /* ---------------- Derived state ---------------- */
  const completed = useMemo(
    () => (scheme ? STEP_KEYS.filter((k) => k !== 'review' && savedSteps.includes(k) && isStepComplete(k, scheme, data)) : []),
    [scheme, savedSteps, data]
  );
  const reachable = useMemo(() => {
    const i = STEP_KEYS.findIndex((k) => !completed.includes(k));
    return i === -1 ? STEP_KEYS.length - 1 : i;
  }, [completed]);
  const canOpen = useCallback((key) => stepIndex(key) <= reachable || completed.includes(key), [reachable, completed]);

  const current = STEP_KEYS.includes(step) ? step : null;
  const checks = useMemo(() => evaluateEligibility(scheme, data), [scheme, data]);
  const blocked = overallEligibility(checks) === 'fail';
  const errors = useMemo(
    () => (showErrors && current && scheme ? validateStep(current, scheme, data) : {}),
    [showErrors, current, scheme, data]
  );
  const incompleteSteps = useMemo(
    () => (scheme ? STEP_KEYS.filter((k) => k !== 'review' && !isStepComplete(k, scheme, data)) : []),
    [scheme, data]
  );
  const kycMissing = profileLoaded && !profile?.aadhaarVerified;

  /* Keep the URL on a step the student is allowed to open. */
  useEffect(() => {
    if (loading || !scheme || lockedApp) return;
    if (!current || !canOpen(current)) {
      navigate(`/apply/${scheme.id}/${STEP_KEYS[reachable]}`, { replace: true });
    }
  }, [loading, scheme, lockedApp, current, canOpen, reachable, navigate]);

  useEffect(() => {
    setShowErrors(false);
    setSubmitError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [current]);

  /* ---------------- Setters (stable identities) ---------------- */
  const setters = useMemo(
    () =>
      Object.fromEntries(
        SECTIONS.map((sec) => [
          sec,
          (field, value) => setData((d) => ({ ...d, [sec]: { ...(d[sec] || {}), [field]: value } })),
        ])
      ),
    []
  );

  const setDocument = useCallback((docId, record) => {
    setData((d) => {
      const documents = { ...(d.documents || {}) };
      if (record) documents[docId] = record;
      else delete documents[docId];
      return { ...d, documents };
    });
  }, []);

  const openDigiLocker = useCallback((docs, onDone) => {
    if (!docs?.length) return;
    setDl({ open: true, docs, onDone });
  }, []);

  /* ---------------- Persistence ---------------- */
  const persist = useCallback(
    async (nextSteps, currentStep) => {
      if (lockedApp) return false;
      setSaveState('saving');
      try {
        localStorage.setItem(localKey, JSON.stringify({ data, completedSteps: nextSteps, at: Date.now() }));
      } catch {
        /* ignore */
      }
      try {
        const draft = await saveDraft(code, { data, currentStep, completedSteps: nextSteps });
        if (draft === null) {
          setSaveState('idle');
          return false;
        }
        setSaveState('saved');
        setLastSaved(draft?.updatedAt ? new Date(draft.updatedAt) : new Date());
        return true;
      } catch (err) {
        setSaveState(err?.response ? 'error' : 'offline');
        return false;
      }
    },
    [code, data, localKey, lockedApp]
  );

  /* Autosave to the server a few seconds after the student stops typing. */
  useEffect(() => {
    if (loading || saveState !== 'dirty' || !current || lockedApp || submitting || confirmOpen) return undefined;
    const timer = setTimeout(() => persist(savedSteps, current), 5000);
    return () => clearTimeout(timer);
  }, [loading, saveState, data, savedSteps, current, lockedApp, submitting, confirmOpen, persist]);

  const scrollToFirstError = () => {
    setTimeout(() => {
      const el = document.querySelector('main [aria-invalid="true"], main [role="alert"]');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof el.focus === 'function' && el.tagName !== 'P') el.focus({ preventScroll: true });
      }
    }, 60);
  };

  const goTo = (key) => {
    if (canOpen(key)) navigate(`/apply/${scheme.id}/${key}`);
  };

  const handleSaveDraft = () => persist(savedSteps, current);

  const handleContinue = async () => {
    const errs = validateStep(current, scheme, data);
    if (Object.keys(errs).length > 0) {
      setShowErrors(true);
      scrollToFirstError();
      persist(savedSteps, current);
      return;
    }
    const nextSteps = savedSteps.includes(current) ? savedSteps : [...savedSteps, current];
    setSavedSteps(nextSteps);
    await persist(nextSteps, STEP_KEYS[stepIndex(current) + 1]);
    navigate(`/apply/${scheme.id}/${STEP_KEYS[stepIndex(current) + 1]}`);
  };

  const handleBack = () => {
    const prev = STEP_KEYS[stepIndex(current) - 1];
    if (prev) navigate(`/apply/${scheme.id}/${prev}`);
  };

  const requestSubmit = () => {
    const errs = validateStep('review', scheme, data);
    if (incompleteSteps.length > 0 || Object.keys(errs).length > 0 || blocked || kycMissing) {
      setShowErrors(true);
      scrollToFirstError();
      return;
    }
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const application = await submitApplication(buildApplicationPayload(scheme, data));
      deleteDraft(code).catch(() => {});
      try {
        localStorage.removeItem(localKey);
      } catch {
        /* ignore */
      }
      setSaveState('saved');
      setConfirmOpen(false);
      navigate(`/applications/${application._id}/acknowledgement`, { replace: true, state: { justSubmitted: true } });
    } catch (err) {
      setSubmitError(apiErrorMessage(err) || t('err.network'));
      setSubmitting(false);
    }
  };

  /* ---------------- Render ---------------- */
  if (!scheme) {
    return (
      <PortalLayout>
        <div className="rounded-md border border-line bg-white p-8 text-center">
          <h1 className="font-serif text-[22px] font-bold text-navy">{tx({ en: 'Scheme not found', hi: 'योजना नहीं मिली' })}</h1>
          <p className="mt-2 text-[14px] text-muted">{tx({ en: 'Choose one of the open schemes to apply.', hi: 'आवेदन हेतु खुली योजनाओं में से एक चुनें।' })}</p>
          <Button to="/schemes" className="mt-5">{t('nav.apply')}</Button>
        </div>
      </PortalLayout>
    );
  }

  if (loading) {
    return (
      <PortalLayout>
        <PageLoader label={t('common.loading')} />
      </PortalLayout>
    );
  }

  if (lockedApp) {
    return (
      <PortalLayout>
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <div className="p-6 sm:p-8">
            <CircleCheck className="h-10 w-10 text-leaf" aria-hidden="true" />
            <h1 className="mt-3 font-serif text-[22px] font-bold text-navy">
              {tx({ en: 'You have already applied for this scheme', hi: 'आप इस योजना हेतु पहले ही आवेदन कर चुके हैं' })}
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted">
              {tx({
                en: `${tx(scheme.name)}, session ${SELECTION_YEAR}. Only one application is allowed per session. You can track its progress below.`,
                hi: `${tx(scheme.name)}, सत्र ${SELECTION_YEAR}। प्रति सत्र केवल एक आवेदन मान्य है। आप नीचे इसकी प्रगति देख सकते हैं।`,
              })}
            </p>
            <dl className="mt-5 grid max-w-xl grid-cols-2 gap-4 rounded-md border border-line bg-paper p-4 text-[13px]">
              <div>
                <dt className="text-muted">{tx({ en: 'Application number', hi: 'आवेदन संख्या' })}</dt>
                <dd className="mt-0.5 font-semibold text-ink">{lockedApp.applicationCode}</dd>
              </div>
              <div>
                <dt className="text-muted">{tx({ en: 'Status', hi: 'स्थिति' })}</dt>
                <dd className="mt-1"><StatusBadge status={lockedApp.status} /></dd>
              </div>
              <div>
                <dt className="text-muted">{tx({ en: 'Submitted on', hi: 'जमा करने की तिथि' })}</dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatDate(lockedApp.submittedAt || lockedApp.createdAt, lang)}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={`/applications/${lockedApp._id}/acknowledgement`} icon={FileText}>
                {tx({ en: 'View acknowledgement', hi: 'पावती देखें' })}
              </Button>
              <Button to="/applications" variant="secondary">{t('nav.applications')}</Button>
            </div>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!current) {
    return (
      <PortalLayout>
        <PageLoader label={t('common.loading')} />
      </PortalLayout>
    );
  }

  const index = stepIndex(current);
  const isReview = current === 'review';
  const errorCount = Object.keys(errors).length;

  const sidebar = (
    <ApplicationSidebar
      scheme={scheme}
      current={current}
      completed={completed}
      canOpen={canOpen}
      onSelect={goTo}
      kycVerified={Boolean(profile?.aadhaarVerified)}
      checks={checks}
    />
  );

  const saveLabel = {
    saving: { icon: null, text: t('common.saving'), cls: 'text-muted' },
    saved: {
      icon: <CircleCheck className="h-4 w-4 text-leaf" aria-hidden="true" />,
      text: lastSaved
        ? tx({ en: `Draft saved ${lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, hi: `ड्राफ्ट सहेजा गया ${lastSaved.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}` })
        : t('common.saved'),
      cls: 'text-leaf',
    },
    dirty: { icon: null, text: tx({ en: 'Unsaved changes', hi: 'असहेजे बदलाव' }), cls: 'text-[#8a5a12]' },
    offline: { icon: <CloudOff className="h-4 w-4" aria-hidden="true" />, text: tx({ en: 'Saved on this device only', hi: 'केवल इस डिवाइस पर सहेजा गया' }), cls: 'text-[#8a5a12]' },
    error: { icon: <CloudOff className="h-4 w-4" aria-hidden="true" />, text: tx({ en: 'Could not save to server', hi: 'सर्वर पर सहेजा नहीं जा सका' }), cls: 'text-alert' },
    idle: null,
  }[saveState];

  const stepProps = { scheme, errors };
  let body;
  switch (current) {
    case 'personal':
      body = <PersonalStep {...stepProps} values={data.personal} setValue={setters.personal} profile={profile} />;
      break;
    case 'category':
      body = (
        <CategoryStep
          {...stepProps}
          values={data.category}
          setValue={setters.category}
          documents={data.documents}
          attachDocument={setDocument}
          openDigiLocker={openDigiLocker}
        />
      );
      break;
    case 'academic':
      body = <AcademicStep {...stepProps} values={data.academic} setValue={setters.academic} />;
      break;
    case 'bank':
      body = <BankStep {...stepProps} values={data.bank} setValue={setters.bank} />;
      break;
    case 'documents':
      body = <DocumentsStep {...stepProps} data={data} setDocument={setDocument} openDigiLocker={openDigiLocker} />;
      break;
    default:
      body = (
        <ReviewStep
          {...stepProps}
          data={data}
          setDeclaration={setters.declarations}
          goTo={goTo}
          checks={checks}
          incompleteSteps={incompleteSteps}
          blocked={blocked}
        />
      );
  }

  return (
    <PortalLayout sidebar={sidebar}>
      <div className="space-y-5">
        {/* Scheme banner */}
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ochre">
                {tx(scheme.type)}, {t('portal.session')}
              </p>
              <h1 className="mt-1 font-serif text-[20px] font-bold leading-snug text-navy sm:text-[22px]">{tx(scheme.name)}</h1>
              <p className="mt-0.5 text-[13px] text-muted">{tx(scheme.level)}</p>
            </div>
            {saveLabel && (
              <p className={`flex shrink-0 items-center gap-1.5 text-[12.5px] font-medium ${saveLabel.cls}`} aria-live="polite">
                {saveLabel.icon}
                {saveLabel.text}
              </p>
            )}
          </div>
          <div className="motif-band" aria-hidden="true" />
        </div>

        {returnedApp && (
          <Alert tone="warn" title={tx({ en: 'Your application was returned for correction', hi: 'आपका आवेदन सुधार हेतु लौटाया गया है' })}>
            {returnedApp.adminRemarks
              ? `${tx({ en: 'Remarks from the verifying officer', hi: 'सत्यापन अधिकारी की टिप्पणी' })}: ${returnedApp.adminRemarks}`
              : tx({ en: 'Correct the details or documents and submit again.', hi: 'विवरण या दस्तावेज़ सुधारकर पुनः जमा करें।' })}
          </Alert>
        )}

        <div className="rounded-md border border-line bg-white px-4 py-4 sm:px-6">
          <StepProgress current={current} completed={completed} onSelect={goTo} canOpen={canOpen} />
        </div>

        <section className="overflow-hidden rounded-md border border-line bg-white" aria-labelledby="step-title">
          <header className="border-b border-line px-5 py-4 sm:px-6">
            <p className="text-[12px] font-medium text-muted">
              {tx({ en: `Step ${index + 1} of ${STEPS.length}`, hi: `चरण ${index + 1} / ${STEPS.length}` })}
            </p>
            <h2 id="step-title" className="font-serif text-[20px] font-bold text-navy">{t(STEPS[index].labelKey)}</h2>
            <p className="mt-0.5 text-[13px] text-muted">{tx(STEP_INTRO[current])}</p>
          </header>

          <div className="space-y-6 px-5 py-6 sm:px-6">
            {errorCount > 0 && !isReview && <Alert tone="error">{t('err.fixBelow')}</Alert>}
            {isReview && kycMissing && (
              <Alert
                tone="error"
                title={tx({ en: 'Aadhaar e-KYC is required before submission', hi: 'जमा करने से पहले आधार ई-केवाईसी आवश्यक है' })}
                action={<Link to="/profile" className="text-[13px] font-semibold text-navy hover:underline">{t('nav.profile')}</Link>}
              >
                {tx({ en: 'Your draft is saved. Complete e-KYC in your profile and come back.', hi: 'आपका ड्राफ्ट सहेजा गया है। प्रोफ़ाइल में ई-केवाईसी पूरा करके वापस आएँ।' })}
              </Alert>
            )}
            {body}
            {submitError && <Alert tone="error" title={tx({ en: 'Submission failed', hi: 'जमा नहीं हो सका' })}>{submitError}</Alert>}
          </div>

          <footer className="no-print flex flex-col-reverse gap-3 border-t border-line bg-paper px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button variant="ghost" icon={ArrowLeft} onClick={handleBack} disabled={index === 0}>
              {t('common.back')}
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" icon={Save} onClick={handleSaveDraft} loading={saveState === 'saving'}>
                {t('common.saveDraft')}
              </Button>
              {isReview ? (
                <Button variant="success" icon={Send} onClick={requestSubmit} disabled={blocked}>
                  {tx({ en: 'Final submit', hi: 'अंतिम रूप से जमा करें' })}
                </Button>
              ) : (
                <Button iconRight={ArrowRight} onClick={handleContinue} disabled={saveState === 'saving'}>
                  {t('common.saveContinue')}
                </Button>
              )}
            </div>
          </footer>
        </section>
      </div>

      <DigiLockerModal
        open={dl.open}
        docs={dl.docs}
        context={{ mobile: data.personal?.mobile, state: data.category?.domicileState || data.personal?.state }}
        onClose={() => setDl((s) => ({ ...s, open: false }))}
        onComplete={(records) => dl.onDone?.(records)}
      />

      <Modal
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        dismissable={!submitting}
        title={tx({ en: 'Submit Scholarship Application', hi: 'छात्रवृत्ति आवेदन जमा करें' })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              {tx({ en: 'Go Back & Review', hi: 'वापस जाएँ एवं समीक्षा करें' })}
            </Button>
            <Button variant="success" icon={Send} onClick={handleSubmit} loading={submitting}>
              {tx({ en: 'Confirm & Submit Application', hi: 'पुष्टि करें एवं आवेदन जमा करें' })}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-[13.5px] leading-relaxed text-ink">
          <p className="font-semibold text-navy">
            {tx({
              en: 'You are about to submit your scholarship application for official government verification.',
              hi: 'आप आधिकारिक सरकारी सत्यापन हेतु अपना छात्रवृत्ति आवेदन जमा करने जा रहे हैं।',
            })}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted text-[13px]">
            <li>{tx({ en: 'Ensure all entered personal, academic and bank details are true and accurate.', hi: 'सुनिश्चित करें कि सभी व्यक्तिगत, शैक्षणिक एवं बैंक विवरण सत्य व सटीक हैं।' })}</li>
            <li>{tx({ en: 'All uploaded certificates and documents must be authentic and legally valid.', hi: 'सभी अपलोड किए गए प्रमाणपत्र व दस्तावेज़ प्रामाणिक एवं वैध होने चाहिए।' })}</li>
            <li>{tx({ en: 'AI document verification is preliminary; official scrutiny is carried out by designated institutional and ministry nodal officers.', hi: 'एआई दस्तावेज़ सत्यापन प्रारंभिक है; आधिकारिक जाँच अधिकृत संस्थान एवं मंत्रालय नोडल अधिकारियों द्वारा की जाएगी।' })}</li>
            <li>{tx({ en: 'Once submitted, the application is locked unless returned by an officer for required corrections.', hi: 'जमा होने के बाद आवेदन लॉक हो जाएगा, जब तक अधिकारी द्वारा सुधार हेतु वापस न भेजा जाए।' })}</li>
          </ul>
          {submitError && <p className="mt-2 text-[13px] text-alert" role="alert">{submitError}</p>}
        </div>
      </Modal>
    </PortalLayout>
  );
}
