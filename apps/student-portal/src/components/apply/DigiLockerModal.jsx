import { useEffect, useState } from 'react';
import { CloudDownload, LoaderCircle, ShieldCheck, AlertCircle, CheckCircle2, FileCheck2 } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import api from '../../api/axios';

/**
 * Official DigiLocker / API Setu Integration Component
 * Communicates exclusively with backend API services to fetch and verify certificates.
 * No client-side simulation, fake OTPs, or manufactured verification statuses.
 */
export default function DigiLockerModal({ open, onClose, docs = [], onComplete, context = {} }) {
  const { tx } = useLang();
  const [loading, setLoading] = useState(false);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [stage, setStage] = useState('list'); // 'list' | 'retrieving' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [verifiedResult, setVerifiedResult] = useState(null);

  useEffect(() => {
    if (!open) {
      setStage('list');
      setSelectedDoc(null);
      setConsentGiven(false);
      setErrorMessage('');
      setVerifiedResult(null);
      return;
    }

    // Load available issued documents from backend DigiLocker service
    async function loadIssuedDocuments() {
      setLoading(true);
      setErrorMessage('');
      try {
        const res = await api.get('/student/digilocker/issued-documents');
        if (res.data?.success && Array.isArray(res.data.documents)) {
          // Match with requested document types for this scheme
          const requestedTypes = docs.map((d) => d.id);
          const relevant = res.data.documents.filter((d) =>
            requestedTypes.includes(d.docType)
          );
          setAvailableDocs(relevant.length > 0 ? relevant : res.data.documents);
          if (relevant.length > 0) {
            setSelectedDoc(relevant[0]);
          } else if (res.data.documents.length > 0) {
            setSelectedDoc(res.data.documents[0]);
          }
        } else {
          setAvailableDocs([]);
        }
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message ||
            tx({
              en: 'Unable to establish connection with the National DigiLocker Gateway. Please ensure you are logged in.',
              hi: 'राष्ट्रीय डिजिलॉकर गेटवे के साथ संपर्क स्थापित करने में असमर्थ। कृपया सुनिश्चित करें कि आप लॉगिन हैं।',
            })
        );
      } finally {
        setLoading(false);
      }
    }

    loadIssuedDocuments();
  }, [open, docs, tx]);

  const handlePullAndVerify = async () => {
    if (!selectedDoc) return;
    if (!consentGiven) {
      setErrorMessage(
        tx({
          en: 'You must grant statutory consent to retrieve and verify your certificate.',
          hi: 'प्रमाणपत्र प्राप्त और सत्यापित करने के लिए वैधानिक सहमति आवश्यक है।',
        })
      );
      return;
    }

    setStage('retrieving');
    setErrorMessage('');

    try {
      // Backend performs secure retrieval, signature validation, and writes authoritative Document record
      const res = await api.post('/student/digilocker/pull-document', {
        docType: selectedDoc.docType,
        uri: selectedDoc.uri,
        issuerId: selectedDoc.issuerId,
        certificateNo: selectedDoc.certificateNo,
        applicationId: context.applicationId || null,
      });

      if (res.data?.success && res.data.document) {
        setVerifiedResult(res.data.document);
        setStage('success');
        setTimeout(() => {
          onComplete([res.data.document]);
          onClose();
        }, 1200);
      } else {
        throw new Error(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      setStage('error');
      setErrorMessage(
        err.response?.data?.message ||
          tx({
            en: 'Document authentication transaction failed. Please retry or upload a certified physical copy.',
            hi: 'दस्तावेज़ प्रमाणीकरण लेनदेन विफल रहा। कृपया पुन: प्रयास करें अथवा भौतिक प्रति अपलोड करें।',
          })
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissable={stage !== 'retrieving'}
      title={tx({ en: 'Fetch from DigiLocker', hi: 'डिजिलॉकर से प्राप्त करें' })}
      badge={
        <span className="rounded bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-800 border border-navy-200">
          {tx({ en: 'API Setu / MeitY', hi: 'एपीआई सेतु / इलेक्ट्रॉनिकी एवं आईटी मंत्रालय' })}
        </span>
      }
      footer={
        stage === 'list' && (
          <div className="flex w-full items-center justify-between gap-3">
            <Button variant="secondary" onClick={onClose}>
              {tx({ en: 'Cancel', hi: 'रद्द करें' })}
            </Button>
            <Button
              onClick={handlePullAndVerify}
              icon={CloudDownload}
              disabled={loading || !selectedDoc || !consentGiven}
            >
              {tx({ en: 'Authenticate & Pull', hi: 'प्रमाणित करें और प्राप्त करें' })}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <LoaderCircle className="h-8 w-8 animate-spin text-navy-600" />
            <p className="text-xs text-navy-700">
              {tx({
                en: 'Querying DigiLocker issued documents repository...',
                hi: 'डिजिलॉकर जारी किए गए दस्तावेज़ों से पूछताछ की जा रही है...',
              })}
            </p>
          </div>
        )}

        {!loading && errorMessage && (
          <Alert variant="danger">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </Alert>
        )}

        {!loading && stage === 'list' && (
          <>
            <p className="text-xs leading-relaxed text-slate-600">
              {tx({
                en: 'Select the issued document from your DigiLocker repository to securely attach and verify it with the Ministry of Tribal Affairs.',
                hi: 'जनजातीय कार्य मंत्रालय के साथ सुरक्षित रूप से संलग्न और सत्यापित करने के लिए अपने डिजिलॉकर से जारी दस्तावेज़ का चयन करें।',
              })}
            </p>

            {availableDocs.length === 0 ? (
              <div className="rounded border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600">
                {tx({
                  en: 'No matching issued certificates found in your DigiLocker account for this requirement. You may upload a scanned copy manually.',
                  hi: 'इस आवश्यकता के लिए आपके डिजिलॉकर खाते में कोई प्रासंगिक प्रमाणपत्र नहीं मिला। आप मैन्युअल रूप से स्कैन की गई प्रति अपलोड कर सकते हैं।',
                }) }
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800">
                  {tx({ en: 'Available Issued Documents:', hi: 'उपलब्ध जारी प्रमाणपत्र:' })}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableDocs.map((doc) => (
                    <div
                      key={doc.uri}
                      onClick={() => setSelectedDoc(doc)}
                      className={`cursor-pointer rounded border p-3 text-left transition-all ${
                        selectedDoc?.uri === doc.uri
                          ? 'border-navy-600 bg-navy-50/50 ring-1 ring-navy-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{doc.name}</div>
                          <div className="text-[11px] text-slate-600">{doc.issuer}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Cert No: {doc.certificateNo} • Date: {doc.date}
                          </div>
                        </div>
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableDocs.length > 0 && (
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-600"
                  />
                  <span className="text-[11px] leading-relaxed text-slate-700">
                    {tx({
                      en: 'I hereby provide statutory consent to the Ministry of Tribal Affairs to fetch, cryptographically verify, and archive this document directly from DigiLocker / API Setu.',
                      hi: 'मैं जनजातीय कार्य मंत्रालय को डिजिलॉकर / एपीआई सेतु से इस दस्तावेज़ को प्राप्त करने, सत्यापित करने और संग्रहीत करने की वैधानिक सहमति प्रदान करता/करती हूँ।',
                    })}
                  </span>
                </label>
              </div>
            )}
          </>
        )}

        {stage === 'retrieving' && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <LoaderCircle className="h-8 w-8 animate-spin text-navy-700" />
            <div className="text-xs font-medium text-slate-800">
              {tx({
                en: 'Performing cryptographic validation and retrieving authentic certificate...',
                hi: 'दस्तावेज़ की प्रामाणिकता की जांच और प्राप्ति की जा रही है...',
              })}
            </div>
            <div className="text-[11px] text-slate-500">
              {tx({
                en: 'Connecting to DigiLocker Server Gateway via API Setu',
                hi: 'एपीआई सेतु के माध्यम से डिजिलॉकर सर्वर से जुड़ाव जारी है',
              })}
            </div>
          </div>
        )}

        {stage === 'success' && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
            <div className="text-sm font-semibold text-slate-900">
              {tx({
                en: 'Document Verified and Retrieved Successfully',
                hi: 'दस्तावेज़ सफलतापूर्वक सत्यापित और प्राप्त किया गया',
              })}
            </div>
            <div className="text-xs text-slate-600">
              {verifiedResult?.issuer || 'National Identity Gateway'}
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setStage('list')}>
                {tx({ en: 'Back to List', hi: 'सूची पर वापस जाएं' })}
              </Button>
              <Button variant="secondary" onClick={onClose}>
                {tx({ en: 'Close', hi: 'बंद करें' })}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
