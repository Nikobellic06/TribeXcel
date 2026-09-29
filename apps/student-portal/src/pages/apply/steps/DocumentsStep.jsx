import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CloudDownload, ShieldCheck, CheckCircle2, FileCheck2, Plus, X, FilePlus } from 'lucide-react';
import { useLang } from '../../../i18n/LanguageContext';
import { getDocumentChecklist, DOCUMENTS } from '../../../config/documents';
import DocumentItem from '../../../components/apply/DocumentItem';
import DocumentDetailsDrawer from '../../../components/digilocker/DocumentDetailsDrawer';
import Button from '../../../components/ui/Button';

export default function DocumentsStep({ scheme, data, errors, setDocument, openDigiLocker }) {
  const { tx } = useLang();
  const [searchParams] = useSearchParams();
  const [drawerDoc, setDrawerDoc] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showConnectedNotice, setShowConnectedNotice] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedDocToAdd, setSelectedDocToAdd] = useState('');

  useEffect(() => {
    if (searchParams.get('dl_connected') === 'true') {
      setShowConnectedNotice(true);
    }
  }, [searchParams]);

  const documents = data.documents || {};
  const baseChecklist = useMemo(() => getDocumentChecklist(scheme?.id, data), [scheme?.id, data]);

  // Track any additional documents added by the user
  const [additionalDocIds, setAdditionalDocIds] = useState(() => {
    const baseKeys = new Set(baseChecklist.map((d) => d.id));
    return Object.keys(data.documents || {}).filter((k) => !baseKeys.has(k) && DOCUMENTS[k]);
  });

  const checklist = useMemo(() => {
    const list = [...baseChecklist];
    additionalDocIds.forEach((id) => {
      if (!list.some((d) => d.id === id) && DOCUMENTS[id]) {
        list.push({ ...DOCUMENTS[id], required: false, isCustomAdded: true });
      }
    });
    return list;
  }, [baseChecklist, additionalDocIds]);

  const availableToAdd = useMemo(() => {
    const currentIds = new Set(checklist.map((d) => d.id));
    return Object.values(DOCUMENTS).filter((doc) => !currentIds.has(doc.id));
  }, [checklist]);

  const handleAddCustomDocument = (id) => {
    const docId = id || selectedDocToAdd;
    if (!docId) return;
    if (!additionalDocIds.includes(docId)) {
      setAdditionalDocIds((prev) => [...prev, docId]);
    }
    setSelectedDocToAdd('');
    setAddModalOpen(false);
  };

  const handleRemoveAdditionalDoc = (docId) => {
    setAdditionalDocIds((prev) => prev.filter((id) => id !== docId));
    setDocument(docId, null);
  };

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
            onRemoveItem={() => handleRemoveAdditionalDoc(doc.id)}
          />
        ))}
      </ul>

      {/* Add More Documents Action Row */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-line">
        <p className="text-xs text-muted">
          Need to attach another certificate, marksheet, or proof to this application?
        </p>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-navy/30 bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy hover:text-white transition-colors shrink-0 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          + Add More Documents
        </button>
      </div>

      {/* Add More Documents Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-lg border border-line bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line bg-navy px-5 py-3.5 text-white">
              <div className="flex items-center gap-2">
                <FilePlus className="h-5 w-5 text-accent" />
                <h3 className="font-serif text-sm font-bold">
                  Add Document to Application
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3 max-h-[65vh] overflow-y-auto">
              <p className="text-xs text-muted leading-relaxed">
                Select an additional document to attach. You can upload the file or fetch it directly from DigiLocker.
              </p>

              {availableToAdd.length === 0 ? (
                <div className="rounded border border-line bg-paper p-6 text-center text-xs text-muted">
                  All available document types have already been added to your checklist.
                </div>
              ) : (
                <div className="space-y-2">
                  {availableToAdd.map((docDef) => (
                    <div
                      key={docDef.id}
                      onClick={() => handleAddCustomDocument(docDef.id)}
                      className="flex items-center justify-between p-3 rounded-lg border border-line bg-paper/30 hover:border-navy hover:bg-navy-soft/30 transition-all cursor-pointer group"
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-navy group-hover:text-navy">
                            {tx(docDef.label)}
                          </p>
                          {docDef.digilocker && (
                            <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[9.5px] font-semibold text-navy border border-accent/30">
                              DIGILOCKER
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted line-clamp-1">
                          {tx(docDef.hint)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded bg-navy px-2.5 py-1 text-[11px] font-semibold text-white group-hover:bg-navy/90 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-line bg-paper px-5 py-3">
              <Button size="sm" variant="ghost" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Government Document Details Drawer */}
      <DocumentDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        document={drawerDoc}
      />
    </div>
  );
}
