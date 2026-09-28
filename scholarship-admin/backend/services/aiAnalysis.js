const fs = require('fs');
const path = require('path');

/*
 * AI-assisted document analysis (ai-engine service).
 *
 * The result is stored exactly as the engine reported it, normalised into one
 * shape the admin portal can display. Nothing is invented: when the engine is
 * offline, does not cover the scheme, or no file content was sent, the
 * analysis says so ("unavailable", "not applicable", "OCR not performed").
 */

const AI_SCHEMES = () => (process.env.AI_ENGINE_SCHEMES || 'NFST,NOS').split(',').map((s) => s.trim().toUpperCase());
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

/* Portal document ids -> document names the ai-engine understands. */
const AI_DOC_ALIAS = {
  st_certificate: 'Caste Certificate',
  income_certificate: 'Income Certificate',
  previous_marksheet: 'Latest Marksheet',
  ug_marksheet: 'Latest Marksheet',
  pg_marksheet: 'Latest Marksheet',
  school_bonafide: 'Admission Letter',
  admission_letter: 'Admission Letter',
  offer_letter: 'Admission Letter',
};

const PRELIMINARY = { Eligible: 'NO_ISSUES_DETECTED', Flagged: 'REQUIRES_HUMAN_REVIEW', Deficient: 'INCOMPLETE' };

function unavailable(reason) {
  return { status: 'unavailable', preliminaryResult: 'UNAVAILABLE', reason, analyzedAt: new Date() };
}

function notApplicable(scheme) {
  return {
    status: 'not_applicable',
    preliminaryResult: 'NOT_APPLICABLE',
    reason: `The AI engine has no rules for ${scheme}; only the rule evaluation applies.`,
    analyzedAt: new Date(),
  };
}

/* Reads an uploaded file (own folder only) so the engine can run OCR on it. */
function readUpload(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return null;
  const full = path.normalize(path.join(UPLOAD_ROOT, fileUrl.replace(/^\/uploads\//, '')));
  if (!full.startsWith(UPLOAD_ROOT)) return null;
  try {
    const stat = fs.statSync(full);
    if (stat.size > 2 * 1024 * 1024) return null;
    return fs.readFileSync(full).toString('base64');
  } catch {
    return null;
  }
}

function qualityOf(doc) {
  if (!doc.ocrPerformed) return doc.issuedByDigiLocker ? 'Issued by DigiLocker' : 'Not assessed';
  const conf = Number(doc.ocrConfidence) || 0;
  const issues = doc.qualityIssues.length;
  if (conf === 0) return 'Unreadable';
  if (conf >= 0.85 && issues === 0) return 'Good';
  if (conf >= 0.6 && issues <= 1) return 'Acceptable';
  return 'Poor';
}

/* Normalises a /verify response from the ai-engine. */
function normalize(data, sentDocs) {
  const summary = data.extracted_summary || {};
  const documents = Object.entries(summary).map(([key, d]) => {
    const sent = sentDocs.find((s) => s.aiName === (d.name || key)) || sentDocs.find((s) => s.aiName === key) || {};
    const doc = {
      docType: sent.docType || '',
      name: sent.label || d.name || key,
      engineName: d.name || key,
      source: d.source || sent.source,
      issuedByDigiLocker: (d.source || sent.source) === 'digilocker',
      ocrPerformed: Boolean(sent.contentSent || sent.rawTextSent) && (d.source || sent.source) !== 'digilocker',
      ocrConfidence: typeof d.ocr_confidence === 'number' ? d.ocr_confidence : null,
      fields: d.detected_fields || {},
      qualityIssues: Array.isArray(d.quality_issues) ? d.quality_issues : [],
      engineVerified: Boolean(d.verified),
    };
    doc.quality = qualityOf(doc);
    return doc;
  });

  return {
    status: 'completed',
    engine: 'ai-engine',
    analyzedAt: new Date(),
    engineStatus: data.status,
    preliminaryResult: PRELIMINARY[data.status] || 'REQUIRES_HUMAN_REVIEW',
    summary: data.recommendation_reason || '',
    score: data.aiVerification?.score ?? null,
    checks: (data.aiVerification?.checks || []).map((c) => ({ label: c.label, passed: Boolean(c.passed), details: c.details || '' })),
    documents,
    filesAnalysed: sentDocs.filter((s) => s.contentSent).length,
  };
}

/*
 * Runs the ai-engine for an application.
 * options.includeFiles — send uploaded file content so the engine can OCR it
 * (defaults to AI_SEND_FILE_CONTENT=true in .env).
 */
async function analyse(app, options = {}) {
  if (!AI_SCHEMES().includes(app.scheme)) return notApplicable(app.scheme);

  const includeFiles = options.includeFiles ?? process.env.AI_SEND_FILE_CONTENT === 'true';
  const timeout = Number(process.env.AI_ENGINE_TIMEOUT_MS) || (includeFiles ? 20000 : 4000);
  const url = process.env.AI_ENGINE_URL || 'http://localhost:8000';

  const sentDocs = (app.documents || []).map((d) => {
    const content = d.content_base64 || (includeFiles && d.source === 'manual' ? readUpload(d.fileUrl) : null);
    return {
      docType: d.docType,
      label: d.name,
      source: d.source,
      aiName: AI_DOC_ALIAS[d.docType] || d.name,
      content,
      contentSent: Boolean(content),
      rawTextSent: Boolean(d.raw_text),
      rawText: d.raw_text || '',
    };
  });

  const payload = {
    name: app.name,
    email: app.email,
    phone: app.phone || '',
    dob: app.dob ? new Date(app.dob).toISOString().slice(0, 10) : '',
    gender: app.gender || '',
    category: app.category || 'Scheduled Tribe',
    state: app.state || '',
    district: app.district || '',
    scheme: app.scheme,
    course: app.course || '',
    institution: app.institution || '',
    documents: sentDocs.map((d) => ({ name: d.aiName, source: d.source, raw_text: d.rawText, content_base64: d.content })),
    declared_income: app.declaredIncome ?? undefined,
    declared_marks: app.scheme === 'PRE_MATRIC' ? undefined : app.declaredMarks ?? undefined,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(`${url}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return unavailable(`AI engine returned HTTP ${res.status}`);
    const data = await res.json();
    return { analysis: normalize(data, sentDocs), raw: data };
  } catch (err) {
    return unavailable(err.name === 'AbortError' ? 'AI engine did not respond in time' : 'AI engine is not reachable');
  }
}

/* analyse() returns either a plain analysis (unavailable / not applicable) or { analysis, raw }. */
async function run(app, options) {
  const result = await analyse(app, options);
  if (result.analysis) return result;
  return { analysis: result, raw: null };
}

module.exports = { run, AI_DOC_ALIAS };
