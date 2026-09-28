import { useState } from 'react';
import { CircleCheck, CircleX, Download, Eye, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import Panel from '../ui/Panel';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AiResultBadge, Badge } from '../ui/Badge';
import { Notice } from '../ui/States';
import { fileHref, fileSize, formatDate, formatDateTime, humanize } from '../../utils/format';

const QUALITY_TONE = { Good: 'ok', Acceptable: 'navy', Poor: 'warn', Unreadable: 'bad' };
const typeOf = (mime) => (mime === 'application/pdf' ? 'PDF' : mime?.startsWith('image/') ? mime.split('/')[1].toUpperCase() : mime || '');

function ocrStatus(aiDoc) {
  if (!aiDoc) return 'Not performed';
  if (aiDoc.issuedByDigiLocker) return 'Not required (issued via DigiLocker)';
  if (!aiDoc.ocrPerformed) return 'Not performed (no file content analysed)';
  return aiDoc.ocrConfidence !== null ? `Performed, engine-reported confidence ${Math.round(aiDoc.ocrConfidence * 100)}%` : 'Performed';
}

function DocumentViewer({ doc, onClose }) {
  const [zoom, setZoom] = useState(1);
  const href = fileHref(doc?.fileUrl);
  const isImage = doc?.mimeType?.startsWith('image/');
  const isPdf = doc?.mimeType === 'application/pdf';
  return (
    <Modal
      open={Boolean(doc)}
      onClose={onClose}
      title={doc?.label || 'Document'}
      width="max-w-4xl"
      footer={
        <>
          {isImage && (
            <>
              <Button variant="secondary" size="sm" icon={ZoomOut} onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} aria-label="Zoom out">Zoom out</Button>
              <span className="num self-center text-[12px] text-muted">{Math.round(zoom * 100)}%</span>
              <Button variant="secondary" size="sm" icon={ZoomIn} onClick={() => setZoom((z) => Math.min(3, z + 0.25))} aria-label="Zoom in">Zoom in</Button>
            </>
          )}
          <Button variant="secondary" size="sm" icon={Download} href={href} target="_blank" rel="noreferrer">Open / download</Button>
          <Button size="sm" onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="max-h-[70vh] overflow-auto rounded border border-line bg-paper">
        {isImage ? (
          <img src={href} alt={doc?.label} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="max-w-full" />
        ) : isPdf ? (
          <iframe title={doc?.label} src={href} className="h-[68vh] w-full bg-white" />
        ) : (
          <p className="p-6 text-[13px] text-muted">This file type cannot be previewed. Use Open / download.</p>
        )}
      </div>
    </Modal>
  );
}

export function DocumentsPanel({ app, review }) {
  const [viewing, setViewing] = useState(null);
  const files = app.documents || [];
  const aiDocs = review.aiAnalysis?.status === 'completed' ? review.aiAnalysis.documents || [] : [];
  const rows = (review.ruleEvaluation.documents || []).map((d) => {
    const file = files.find((f) => (f.docType || '') === d.docType) || files.find((f) => f.name === d.label) || null;
    const aiDoc = aiDocs.find((x) => x.docType && x.docType === d.docType) || null;
    return { ...d, file, aiDoc };
  });

  return (
    <Panel id="documents" title="D. Uploaded documents" subtitle={`Submitted with the application on ${formatDate(app.submittedAt)}`} bodyClass="overflow-x-auto">
      <table className="w-full min-w-[760px] text-[12.5px]">
        <thead className="bg-paper text-left text-[11px] uppercase tracking-wide text-muted">
          <tr>{['Document', 'Source', 'File', 'Quality', 'OCR / extraction', 'Verification'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const fields = Object.keys(r.aiDoc?.fields || {}).length;
            return (
              <tr key={r.docType} className="border-t border-line align-top">
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-ink">{r.label}</p>
                  <p className="text-[11.5px] text-muted">{r.required ? 'Required' : 'Additional'}{r.file?.certificateNo ? `, No. ${r.file.certificateNo}` : ''}</p>
                </td>
                <td className="px-3 py-2.5">
                  {!r.present ? <Badge tone="bad">Missing</Badge> : r.source === 'digilocker' ? <Badge tone="ok">DigiLocker</Badge> : <Badge tone="navy">Uploaded</Badge>}
                  {r.file?.issuer && <p className="mt-1 text-[11.5px] text-muted">{r.file.issuer}</p>}
                </td>
                <td className="px-3 py-2.5 text-[12px]">
                  {r.file?.fileUrl ? (
                    <>
                      <p className="text-ink">{typeOf(r.file.mimeType)}{r.file.size ? `, ${fileSize(r.file.size)}` : ''}</p>
                      <p className="break-all text-muted">{r.file.fileName}</p>
                      <Button variant="secondary" size="sm" icon={Eye} className="mt-1.5" onClick={() => setViewing({ ...r.file, label: r.label })}>View</Button>
                    </>
                  ) : r.present ? (
                    <p className="text-muted">{r.file?.digilockerUri ? <>No file stored. DigiLocker URI: <span className="break-all">{r.file.digilockerUri}</span></> : 'No file stored with this record'}</p>
                  ) : (
                    <span className="text-muted">Not submitted</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {r.aiDoc ? <Badge tone={QUALITY_TONE[r.aiDoc.quality] || 'grey'}>{r.aiDoc.quality}</Badge> : <span className="text-muted">Not assessed</span>}
                  {(r.aiDoc?.quality === 'Poor' || r.aiDoc?.quality === 'Unreadable') && <p className="mt-1 max-w-[180px] text-[11.5px] text-bad">Document quality is insufficient for reliable extraction.</p>}
                </td>
                <td className="px-3 py-2.5 text-[12px]">
                  <p className="text-ink">{ocrStatus(r.aiDoc)}</p>
                  <p className="text-muted">{r.aiDoc ? (fields ? `${fields} field(s) extracted` : r.aiDoc.ocrPerformed ? 'No fields extracted' : 'No extraction') : 'No extraction'}</p>
                </td>
                <td className="px-3 py-2.5 text-[12px]">
                  {!r.present ? <span className="font-semibold text-bad">Missing</span> : r.source === 'digilocker' ? 'Issued via DigiLocker (verified at source)' : 'Officer check required'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />
    </Panel>
  );
}

export function AiAnalysisPanel({ analysis, onRerun, rerunning, rerunError }) {
  const status = analysis?.status || 'not_run';
  const rerun = (
    <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRerun} loading={rerunning}>
      {status === 'completed' ? 'Re-run analysis' : 'Run AI analysis'}
    </Button>
  );

  return (
    <Panel id="ai" title="E. AI-assisted document analysis" subtitle="Assistive only. Results are preliminary and never decide the application." actions={rerun}>
      {rerunError && <Notice tone="bad" className="mb-3">{rerunError}</Notice>}
      {status !== 'completed' ? (
        <div className="rounded border border-dashed border-line bg-paper px-4 py-5 text-center">
          <p className="text-[13px] font-semibold text-ink">
            {status === 'unavailable' ? 'Analysis unavailable' : status === 'not_applicable' ? 'Not applicable for this scheme' : 'Analysis not run'}
          </p>
          <p className="mx-auto mt-1 max-w-lg text-[12.5px] text-muted">{analysis?.reason}</p>
          {analysis?.analyzedAt && status === 'unavailable' && <p className="mt-1 text-[11.5px] text-muted">Last attempt {formatDateTime(analysis.analyzedAt)}</p>}
          <p className="mx-auto mt-2 max-w-lg text-[12px] text-muted">No AI result is shown until the verification engine returns one. Use the rule evaluation and documents to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-line bg-paper px-3 py-2.5">
            <div>
              <p className="text-[12px] text-muted">Preliminary result</p>
              <AiResultBadge result={analysis.preliminaryResult} />
            </div>
            <p className="text-[11.5px] text-muted">
              Engine: {analysis.engine}. Analysed {formatDateTime(analysis.analyzedAt)}. Files analysed by OCR: {analysis.filesAnalysed || 0}
            </p>
          </div>
          {analysis.summary && <Notice><span className="font-semibold">AI detected:</span> {analysis.summary}</Notice>}

          {(analysis.checks || []).length > 0 && (
            <div>
              <h3 className="text-[12.5px] font-semibold text-ink">Checks reported by the engine</h3>
              <ul className="mt-1.5 space-y-1">
                {analysis.checks.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px]">
                    {c.passed ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" /> : <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden="true" />}
                    <span>
                      <span className="text-ink">{c.label}</span>
                      {c.details && <span className="block text-[12px] text-muted">{c.details}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-3 lg:grid-cols-2">
            {(analysis.documents || []).map((d, i) => {
              const fields = Object.entries(d.fields || {});
              return (
                <div key={`${d.engineName}-${i}`} className="rounded border border-line">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper px-3 py-2">
                    <p className="text-[12.5px] font-semibold text-ink">{d.name}</p>
                    <Badge tone={QUALITY_TONE[d.quality] || 'grey'}>{d.quality}</Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 px-3 py-2 text-[12px]">
                    <dt className="text-muted">Document type</dt>
                    <dd className="text-ink">As submitted ({d.engineName}); classification not reported by the engine</dd>
                    <dt className="text-muted">OCR</dt>
                    <dd className="text-ink">{ocrStatus(d)}</dd>
                  </dl>
                  <div className="border-t border-line px-3 py-2">
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">Extracted fields</p>
                    {fields.length === 0 ? (
                      <p className="text-[12px] text-muted">{d.ocrPerformed ? 'No fields could be extracted.' : 'None (no OCR on this document).'}</p>
                    ) : (
                      <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[12px]">
                        {fields.map(([k, v]) => (
                          <div key={k} className="contents">
                            <dt className="text-muted">{humanize(k)}</dt>
                            <dd className="break-words text-ink">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                  {d.qualityIssues?.length > 0 && (
                    <div className="border-t border-line px-3 py-2">
                      <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">Anomaly / quality flags</p>
                      <ul className="mt-0.5 list-disc pl-4 text-[12px] text-warn">
                        {d.qualityIssues.map((q) => <li key={q}>{q}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-muted">Cross-document matches from these values are shown in section F.</p>
        </div>
      )}
    </Panel>
  );
}
