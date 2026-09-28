/*
 * Cross-document and data-consistency checks.
 * Compares the same value (name, date of birth, income, certificate number,
 * marks) across every source that actually holds it: the application form,
 * the Aadhaar e-KYC profile, the bank account, DigiLocker metadata and values
 * extracted by OCR. A check with only one source is reported as UNAVAILABLE.
 */

const clean = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const digits = (v) => {
  const m = String(v ?? '').replace(/,/g, '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};
function isoDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  const dmy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function fieldValues(aiAnalysis, test) {
  if (aiAnalysis?.status !== 'completed') return [];
  const out = [];
  (aiAnalysis.documents || []).forEach((doc) => {
    Object.entries(doc.fields || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && test(key.toLowerCase())) {
        out.push({ source: `${doc.name} (OCR)`, value: String(value) });
      }
    });
  });
  return out;
}

function compare(label, values, kind) {
  const present = values.filter((v) => v.value !== null && v.value !== undefined && String(v.value).trim() !== '');
  if (present.length < 2) {
    return { field: label, values: present, status: 'UNAVAILABLE', note: 'Only one source holds this value' };
  }
  const norm = present.map((v) => {
    if (kind === 'date') return isoDate(v.value);
    if (kind === 'number') return digits(v.value);
    return clean(v.value);
  });
  const first = norm[0];
  const allSame = norm.every((n) => (kind === 'number' ? n !== null && Math.abs(n - first) < 0.5 : n === first));
  if (allSame) return { field: label, values: present, status: 'MATCH' };
  if (kind === 'name') {
    const tokens = norm.map((n) => new Set(n.split(' ')));
    const smallest = tokens.reduce((a, b) => (a.size <= b.size ? a : b));
    const subset = tokens.every((t) => [...smallest].every((x) => t.has(x)));
    if (subset) return { field: label, values: present, status: 'PARTIAL', note: 'One source has extra or missing name parts' };
  }
  return { field: label, values: present, status: 'MISMATCH' };
}

function build(app, aiAnalysis, student) {
  const s = app.schemeData?.sections || {};
  const c = s.category || {};
  const a = s.academic || {};
  const b = s.bank || {};
  const docs = app.documents || [];
  const kyc = student?.aadhaarVerified ? student : null;
  const checks = [];

  const names = [{ source: 'Application', value: app.name }];
  if (kyc) names.push({ source: 'Aadhaar e-KYC profile', value: kyc.name });
  if (b.accountHolder && b.accountOf !== 'parent') names.push({ source: 'Bank account holder', value: b.accountHolder });
  names.push(...fieldValues(aiAnalysis, (k) => /^(name|applicant_?name|student_?name|candidate_?name|holder_?name)$/.test(k)));
  checks.push(compare('Applicant name', names, 'name'));

  const dobs = [{ source: 'Application', value: app.dob }];
  if (kyc?.dob) dobs.push({ source: 'Aadhaar e-KYC profile', value: kyc.dob });
  dobs.push(...fieldValues(aiAnalysis, (k) => /dob|date_?of_?birth|birth_?date/.test(k)));
  checks.push(compare('Date of birth', dobs, 'date'));

  if (app.scheme !== 'NFST' && c.isOrphan !== 'yes') {
    const incomes = [{ source: 'Application (declared)', value: c.familyIncome ?? app.declaredIncome }];
    incomes.push(...fieldValues(aiAnalysis, (k) => /income/.test(k)));
    checks.push(compare('Annual family income', incomes, 'number'));
  }

  const stDoc = docs.find((d) => d.docType === 'st_certificate');
  const stNos = [{ source: 'Application', value: c.stCertificateNo }];
  if (stDoc?.certificateNo) stNos.push({ source: 'DigiLocker record', value: stDoc.certificateNo });
  stNos.push(...fieldValues(aiAnalysis, (k) => /certificate_?(no|number)|cert_?no/.test(k)).filter((v) => /caste|st /i.test(v.source)));
  checks.push(compare('ST certificate number', stNos, 'text'));

  const incDoc = docs.find((d) => d.docType === 'income_certificate');
  if (incDoc?.certificateNo || c.incomeCertificateNo) {
    checks.push(compare('Income certificate number', [
      { source: 'Application', value: c.incomeCertificateNo },
      { source: 'DigiLocker record', value: incDoc?.certificateNo },
    ], 'text'));
  }

  if (app.scheme !== 'PRE_MATRIC') {
    const marks = [{ source: 'Application (declared)', value: app.declaredMarks ?? (a.gradeType === 'cgpa' ? a.convertedPercentage : a.percentage) }];
    marks.push(...fieldValues(aiAnalysis, (k) => /percent|marks|cgpa/.test(k)));
    checks.push(compare('Qualifying marks (%)', marks, 'number'));
  }

  return checks;
}

module.exports = { build };
