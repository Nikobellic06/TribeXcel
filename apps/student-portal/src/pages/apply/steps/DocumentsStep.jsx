import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CloudDownload, ShieldCheck, CheckCircle2, FileCheck2 } from 'lucide-react';
import { useLang } from '../../../i18n/LanguageContext';
import { getDocumentChecklist } from '../../../config/documents';
import DocumentItem from '../../../components/apply/DocumentItem';
import DocumentDetailsDrawer from '../../../components/digilocker/DocumentDetailsDrawer';
import Button from '../../../components/ui/Button';

export default function DocumentsStep({ scheme, data, errors, setDocument, openDigiLocker }) {
  const { tx } = useLang();
  const [searchParams] = useSearchParams();
  const [drawerDoc, setDrawerDoc] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showConnectedNotice, setShowConnectedNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get('dl_connected') === 'true') {
      setShowConnectedNotice(true);
    }
  }, [searchParams]);

  const documents = data.documents || {};
  const checklist = useMemo(() => getDocumentChecklist(scheme.id, data), [scheme.id, data]);

  const digiLockerEligible = checklist.filter((d) => d.digilocker);
  const fromDigiLockerNeeded = digiLockerEligible.filter((d) => !documents[d.id]);
  const requiredCount = checklist.filter((d) => d.required).length;
  const doneCount = checklist.filter((d) => d.required && documents[d.id]).length;

  const handleFetchAllFromDigiLocker = () => {
    openDigiLocker(
      fromDigiLockerNeeded.length > 0 ? fromDigiLockerNeeded : digiLockerEligible,
      (records) => {
        records.forEach((rec) => {
          if (rec && rec.docType) {
            setDocument(rec.docType, rec);
          }
        });
        setShowConnectedNotice(true);
      }
    );
  };

  const handleOpenDetails = (record, doc) => {
    setDrawerDoc({
      ...record,
      documentName: tx(doc.label),
      documentCategory: doc.digilocker?.code || 'Government Certificate',
      issuer: record.issuer || (doc.digilocker?.issuer ? tx(doc.digilocker.issuer) : 'State Revenue Authority'),
      applicationMapping: tx(doc.label),
      documentReference: record.certificateNo || record.digilockerUri || 'DL-RECORD',
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Success banner if redirected from callback */}
      {showConnectedNotice && (
        <div className="flex items-center justify-between rounded-md border border-leaf/30 bg-leaf-soft/40 p-4 text-[13px] text-leaf animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf" />
            <span className="font-semibold">
              {tx({
                en: 'DigiLocker connected successfully — issued documents automatically mapped.',
                hi: 'डिजिलॉकर सफलतापूर्वक कनेक्ट हुआ — जारी दस्तावेज़ स्वचालित रूप से जोड़े गए।',
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowConnectedNotice(false)}
            className="text-leaf/80 hover:text-leaf text-[12px] font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main DigiLocker Action Banner */}
      <div className="flex flex-col gap-4 rounded-md border border-navy/15 bg-navy-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
          <div className="text-[13px] leading-relaxed">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink">
                {tx({ en: 'Government certificates come from DigiLocker', hi: 'सरकारी प्रमाण पत्र डिजिलॉकर से आते हैं' })}
              </p>
              <span className="rounded bg-navy/10 px-1.5 py-0.2 text-[10.5px] font-semibold text-navy border border-navy/20">
                Official Integration
              </span>
            </div>
            <p className="text-muted mt-0.5">
              {tx({
                en: 'Fetch Scheduled Tribe, Class X, Income, and Domicile certificates securely without manual scanning.',
                hi: 'अनुसूचित जनजाति, कक्षा 10, आय एवं मूल निवास प्रमाण पत्र बिना मैन्युअल स्कैनिंग के सुरक्षित प्राप्त करें।',
              })}
            </p>
          </div>
        </div>

        <Button icon={CloudDownload} onClick={handleFetchAllFromDigiLocker} className="shrink-0">
          {tx({
            en: 'Fetch eligible documents from DigiLocker',
            hi: 'डिजिलॉकर से पात्र दस्तावेज़ प्राप्त करें',
          })}
        </Button>
      </div>

      <div className="flex items-center justify-between text-[13px]">
        <p className="font-semibold text-ink">{tx({ en: 'Document checklist', hi: 'दस्तावेज़ सूची' })}</p>
        <p className={doneCount === requiredCount ? 'font-semibold text-leaf' : 'text-muted'}>
          {tx({ en: `${doneCount} of ${requiredCount} required added`, hi: `${requiredCount} में से ${doneCount} अनिवार्य जोड़े गए` })}
        </p>
      </div>

      <ul className="space-y-3">
        {checklist.map((doc) => (
          <DocumentItem
            key={doc.id}
            doc={doc}
            record={documents[doc.id]}
            error={errors[doc.id]}
            applicationData={data}
            onChange={(rec) => setDocument(doc.id, rec)}
            onDigiLocker={(d) =>
              openDigiLocker([d], ([rec]) => {
                if (rec) setDocument(d.id, rec);
              })
            }
            onViewDetails={(rec) => handleOpenDetails(rec, doc)}
          />
        ))}
      </ul>

      {/* Government Document Details Drawer */}
      <DocumentDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        document={drawerDoc}
      />
    </div>
  );
}
