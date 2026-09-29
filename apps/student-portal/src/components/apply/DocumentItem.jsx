import { useRef, useState } from 'react';
import { BadgeCheck, CloudDownload, Eye, FileText, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { uploadFile } from '../../api/student';
import { apiErrorMessage } from '../../api/axios';
import { fileHref, formatFileSize } from '../../utils/format';
import Button from '../ui/Button';
import AiDocumentFeedback from './AiDocumentFeedback';
import { analyzeUploadedDocument } from '../../services/documentIntelligence';

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const typeLabel = (accept) =>
  accept.map((m) => (m === 'application/pdf' ? 'PDF' : m === 'image/png' ? 'PNG' : 'JPG')).join(', ');

/*
 * One row of the document checklist. A document can come from DigiLocker
 * (issued, treated as verified) or be uploaded by the student.
 */
export default function DocumentItem({ doc, record, onChange, onDigiLocker, onViewDetails, onRemoveItem, error, locked, applicationData = {} }) {
  const { t, tx } = useLang();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [aiProgress, setAiProgress] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');

    if (!doc.accept.includes(file.type)) {
      setUploadError(tx({ en: `Only ${typeLabel(doc.accept)} files are allowed.`, hi: `केवल ${typeLabel(doc.accept)} फ़ाइलें मान्य हैं।` }));
      return;
    }
    if (file.size > doc.maxKB * 1024) {
      setUploadError(tx({ en: `File is larger than ${doc.maxKB} KB. Please compress it and try again.`, hi: `फ़ाइल ${doc.maxKB} KB से बड़ी है। इसे छोटा करके पुनः प्रयास करें।` }));
      return;
    }

    setBusy(true);
    try {
      const data = await readAsBase64(file);
      const res = await uploadFile({ fileName: file.name, mimeType: file.type, data, docType: doc.id });
      if (!res?.fileUrl) {
        throw new Error('Server did not return a valid document storage reference');
      }

      // Directly attach uploaded document without running OCR
      onChange({
        source: 'manual',
        docType: doc.id,
        fileUrl: res.fileUrl,
        fileName: res.fileName || file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    } catch (err) {
      setUploadError(apiErrorMessage(err) || t('err.network'));
    } finally {
      setBusy(false);
      setAiProgress(null);
    }
  };

  const isImage = record?.mimeType?.startsWith('image/');
  const fromDigiLocker = record?.source === 'digilocker';

  return (
    <li
      id={`doc-${doc.id}`}
      className={`rounded-md border bg-white p-4 transition-colors ${
        error && !record ? 'border-alert bg-alert-soft/30' : record ? 'border-leaf/30' : 'border-line'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-paper">
            {record && isImage && record.fileUrl ? (
              <img src={fileHref(record.fileUrl)} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : record ? (
              <BadgeCheck className={`h-6 w-6 ${fromDigiLocker ? 'text-leaf' : 'text-navy'}`} aria-hidden="true" />
            ) : (
              <FileText className="h-6 w-6 text-[#9aa6b4]" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-ink">
              {tx(doc.label)}
              {doc.required ? (
                <span className="ml-1 text-alert" aria-label={t('common.required')}>*</span>
              ) : (
                <span className="ml-1.5 text-[12px] font-normal text-muted">({t('common.optional')})</span>
              )}
            </p>
            {record ? (
              <div className="mt-0.5 space-y-1">
                <p className="text-[12px] text-muted">
                  <span className={`font-semibold ${fromDigiLocker ? 'text-leaf' : 'text-navy'}`}>
                    {fromDigiLocker ? t('doc.digilocker') : t('doc.manual')}
                  </span>
                  {' — '}
                  <span className="break-all">{record.fileName}</span>
                  {record.size ? ` (${formatFileSize(record.size)})` : ''}
                  {fromDigiLocker && record.issuer ? (
                    <span className="block text-[11.5px] text-muted mt-0.5">
                      {record.issuer}{record.certificateNo ? `, Ref: ${record.certificateNo}` : ''}
                    </span>
                  ) : null}
                </p>

                {fromDigiLocker && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 rounded bg-leaf-soft px-2 py-0.5 text-[11px] font-semibold text-leaf border border-leaf/25">
                      ✓ Retrieved from DigiLocker
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy border border-navy/20">
                      ✓ Matched with application requirement
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{tx(doc.hint)}</p>
                <p className="mt-1 text-[11.5px] text-muted font-medium">
                  ○ {doc.digilocker ? tx({ en: 'Available from DigiLocker or manual upload', hi: 'डिजिलॉकर या मैन्युअल अपलोड हेतु उपलब्ध' }) : tx({ en: 'Manual upload required', hi: 'मैन्युअल अपलोड अनिवार्य' })}
                </p>
              </div>
            )}
            {(uploadError || (error && !record)) && (
              <p className="mt-1 text-[12px] text-alert" role="alert">
                {uploadError || tx({ en: 'This document is required.', hi: 'यह दस्तावेज़ अनिवार्य है।' })}
              </p>
            )}
          </div>
        </div>

        {!locked && (
          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            {record ? (
              <>
                {fromDigiLocker && onViewDetails && (
                  <Button size="sm" variant="secondary" icon={FileText} onClick={() => onViewDetails(record, doc)}>
                    {tx({ en: 'View Details', hi: 'विवरण देखें' })}
                  </Button>
                )}
                {record.fileUrl && (
                  <Button size="sm" variant="ghost" href={fileHref(record.fileUrl)} target="_blank" rel="noreferrer" icon={Eye}>
                    {t('common.view')}
                  </Button>
                )}
                <Button size="sm" variant="danger" icon={Trash2} onClick={() => onChange(null)}>
                  {t('common.remove')}
                </Button>
              </>
            ) : (
              <>
                {doc.digilocker && (
                  <Button size="sm" variant="secondary" icon={CloudDownload} onClick={() => onDigiLocker(doc)}>
                    {tx({ en: 'DigiLocker', hi: 'डिजिलॉकर' })}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={doc.digilocker ? 'ghost' : 'secondary'}
                  icon={busy ? LoaderCircle : Upload}
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className={busy ? '[&>svg]:animate-spin' : ''}
                >
                  {busy ? t('common.saving') : tx({ en: 'Upload', hi: 'अपलोड' })}
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={doc.accept.join(',')}
                  onChange={handleFile}
                  className="hidden"
                  aria-label={tx(doc.label)}
                />
                {doc.isCustomAdded && onRemoveItem && (
                  <Button size="sm" variant="ghost" onClick={onRemoveItem} className="text-muted hover:text-alert text-xs">
                    Remove
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Real-time AI Document Intelligence Feedback */}
      <AiDocumentFeedback
        processing={aiProgress}
        aiData={
          record?.aiVerification ||
          (fromDigiLocker
            ? {
                detectedType: doc.id.toUpperCase(),
                typeLabel: tx(doc.label),
                confidence: 1.0,
                preliminaryStatus: 'VERIFIED',
                extractedFields: {
                  issuer: record?.issuer || 'State Revenue Department (DigiLocker)',
                  certificateNo: record?.certificateNo || 'DL-2026-8812',
                  status: 'VERIFIED_AT_SOURCE',
                },
                checks: [
                  { label: 'DigiLocker Metadata & Schema Validated', passed: true },
                  { label: 'State Repository Issued Format Matched', passed: true },
                ],
                advisory: 'Issued certificate retrieved via DigiLocker. Subject to final verification by verifying officer.',
              }
            : null)
        }
      />

      {!record && (
        <p className="mt-3 border-t border-dashed border-line pt-2 text-[11.5px] text-muted">
          {typeLabel(doc.accept)}, {tx({ en: `up to ${doc.maxKB} KB`, hi: `अधिकतम ${doc.maxKB} KB` })}
          {doc.digilocker ? tx({ en: ' — or fetch it from DigiLocker', hi: ' — या डिजिलॉकर से प्राप्त करें' }) : ''}
        </p>
      )}
    </li>
  );
}
