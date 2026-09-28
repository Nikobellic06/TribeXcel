import { useMemo } from 'react';
import { CloudDownload, ShieldCheck } from 'lucide-react';
import { useLang } from '../../../i18n/LanguageContext';
import { getDocumentChecklist } from '../../../config/documents';
import DocumentItem from '../../../components/apply/DocumentItem';
import Button from '../../../components/ui/Button';

export default function DocumentsStep({ scheme, data, errors, setDocument, openDigiLocker }) {
  const { tx } = useLang();
  const documents = data.documents || {};
  const checklist = useMemo(() => getDocumentChecklist(scheme.id, data), [scheme.id, data]);

  const fromDigiLocker = checklist.filter((d) => d.digilocker && !documents[d.id]);
  const requiredCount = checklist.filter((d) => d.required).length;
  const doneCount = checklist.filter((d) => d.required && documents[d.id]).length;

  const fetchAll = () =>
    openDigiLocker(fromDigiLocker, (records) => records.forEach((rec) => setDocument(rec.docType, rec)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-md border border-navy/15 bg-navy-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
          <div className="text-[13px] leading-relaxed">
            <p className="font-semibold text-ink">
              {tx({ en: 'Government certificates come from DigiLocker', hi: 'सरकारी प्रमाण पत्र डिजिलॉकर से आते हैं' })}
            </p>
            <p className="text-muted">
              {tx({
                en: 'Certificates issued in DigiLocker are verified at source. Photo, signature and letters from your school or university are uploaded by you.',
                hi: 'डिजिलॉकर में जारी प्रमाण पत्र स्रोत पर सत्यापित होते हैं। फ़ोटो, हस्ताक्षर और विद्यालय या विश्वविद्यालय के पत्र आप स्वयं अपलोड करें।',
              })}
            </p>
          </div>
        </div>
        {fromDigiLocker.length > 0 && (
          <Button icon={CloudDownload} onClick={fetchAll} className="shrink-0">
            {tx({ en: `Fetch ${fromDigiLocker.length} from DigiLocker`, hi: `डिजिलॉकर से ${fromDigiLocker.length} प्राप्त करें` })}
          </Button>
        )}
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
            onChange={(rec) => setDocument(doc.id, rec)}
            onDigiLocker={(d) => openDigiLocker([d], ([rec]) => rec && setDocument(d.id, rec))}
          />
        ))}
      </ul>
    </div>
  );
}
