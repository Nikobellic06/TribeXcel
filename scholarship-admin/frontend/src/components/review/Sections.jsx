import { CircleCheck, CircleMinus, CircleX, TriangleAlert } from 'lucide-react';
import Panel from '../ui/Panel';
import { AiResultBadge, MatchBadge, RuleResultBadge, RuleStatusBadge } from '../ui/Badge';
import { Empty, Notice } from '../ui/States';
import { SCHEMES } from '../../config/labels';
import { formatDate, formatDateTime, formatINR } from '../../utils/format';

const yn = (v) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '');

/* Two-column definition list; empty values show "Not provided". */
export function Details({ rows, cols = 2 }) {
  return (
    <dl className={`grid grid-cols-1 gap-x-6 ${cols === 3 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {rows.filter(Boolean).map(([label, value, hint]) => (
        <div key={label} className="border-b border-line/70 py-2">
          <dt className="text-[11.5px] text-muted">{label}</dt>
          <dd className="mt-0.5 break-words text-[13px] text-ink">
            {value === undefined || value === null || value === '' ? <span className="text-[#98a3b1]">Not provided</span> : value}
            {hint && <span className="block text-[11.5px] text-muted">{hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ApplicantInfo({ app }) {
  const s = app.schemeData?.sections || {};
  const p = s.personal || {};
  const c = s.category || {};
  const b = s.bank || {};
  const kyc = app.applicant;
  return (
    <Panel id="applicant" title="A. Applicant information">
      <Details
        cols={3}
        rows={[
          ['Name', app.name],
          ['Date of birth', formatDate(app.dob)],
          ['Gender', app.gender],
          ['Category', app.category],
          ['Tribe / community', c.tribeName],
          ['PVTG', yn(c.isPVTG) || undefined],
          ['Person with disability', c.hasDisability === 'yes' ? `Yes${c.disabilityPercent ? `, ${c.disabilityPercent}%` : ''}` : yn(c.hasDisability) || undefined],
          ['State', app.state],
          ['District', app.district],
          ["Father's / mother's name", [p.fatherName, p.motherName].filter(Boolean).join(' / ')],
          ['Mobile', app.phone],
          ['Email', app.email],
          [
            'Aadhaar',
            kyc?.aadhaarVerified ? `XXXX XXXX ${kyc.aadhaarLast4}` : kyc ? 'e-KYC not completed' : 'Not linked',
            kyc?.aadhaarVerified ? `e-KYC completed ${formatDate(kyc.aadhaarVerifiedAt)}; full number is not stored` : undefined,
          ],
          ['Annual family income', app.scheme === 'NFST' ? 'Not required for this scheme' : c.isOrphan === 'yes' ? 'Orphan (income limit not applicable)' : formatINR(app.declaredIncome ?? c.familyIncome)],
          ['ST certificate', [c.stCertificateNo, c.stIssuingAuthority].filter(Boolean).join(', ')],
        ]}
      />
      <h3 className="mt-4 text-[12.5px] font-semibold text-ink">Bank account (DBT)</h3>
      <Details
        cols={3}
        rows={[
          ['Account holder', b.accountHolder, b.accountOf === 'parent' ? 'Parent / guardian account' : undefined],
          ['Account number', b.accountNumber],
          ['IFSC', b.ifsc],
          ['Bank and branch', [b.bankName, b.branchName].filter(Boolean).join(', ')],
          ['Aadhaar seeding', b.aadhaarSeeded === 'yes' ? 'Declared by applicant' : b.accountNumber ? 'Not confirmed' : undefined],
          ['Bank verification', b.accountNumber ? 'Bank verification pending PFMS integration' : undefined],
        ]}
      />
    </Panel>
  );
}

export function SchemeInfo({ app }) {
  const a = app.schemeData?.sections?.academic || {};
  const rules = app.schemeRules || {};
  const marks = a.gradeType === 'cgpa' ? `${a.cgpa} CGPA (${a.convertedPercentage}%)` : a.percentage ? `${a.percentage}%` : app.declaredMarks ? `${app.declaredMarks}%` : '';
  const specific = {
    PRE_MATRIC: [
      ['Class', a.className],
      ['School', a.schoolName || app.institution],
      ['U-DISE code', a.udiseCode],
      ['Day scholar / hosteller', a.residence === 'hostel' ? 'Hosteller' : a.residence === 'day' ? 'Day scholar' : ''],
      ['Previous class marks', a.previousClassPercent ? `${a.previousClassPercent}%` : ''],
      ['Repeating class / other scholarship', [yn(a.repeatingClass), yn(a.otherScholarship)].filter(Boolean).join(' / ')],
    ],
    NFST: [
      ['Programme', [a.courseLevel, a.subject].filter(Boolean).join(', ') || app.course],
      ['University', app.institution, a.universityType],
      ['Post-graduation', [a.pgDegree, a.pgUniversity, a.pgYear].filter(Boolean).join(', ')],
      ['PG marks', marks],
      ['Offer from IIT / AIIMS / IIM / IISER', yn(a.premierOffer) || undefined],
      ['Other fellowship', yn(a.otherFellowship) || undefined],
    ],
    NOS: [
      ['Course', app.course, [a.fieldOfStudy, a.courseDurationMonths && `${a.courseDurationMonths} months`].filter(Boolean).join(', ')],
      ['University', app.institution],
      ['QS World University Ranking', a.qsRank],
      ['Admission status', { studying: 'Admitted and studying', offer: 'Offer received', applied: 'Applied, offer awaited' }[a.admissionStatus]],
      ['Qualifying degree', [a.qualifyingDegree, a.qualifyingUniversity, a.qualifyingYear].filter(Boolean).join(', '), marks],
      ['Sibling availed / previous award', [yn(a.siblingAvailed), yn(a.previousAward)].filter(Boolean).join(' / ')],
    ],
  }[app.scheme] || [['Course', app.course], ['Institution', app.institution]];

  return (
    <Panel id="scheme" title="B. Scheme information">
      <Details
        cols={3}
        rows={[
          ['Scheme', SCHEMES[app.scheme]?.name || app.scheme],
          ['Level', rules.level],
          ['Session', app.session],
          ['Income limit', rules.incomeLimit ? formatINR(rules.incomeLimit) : 'No income limit'],
          ['Minimum marks', rules.minMarks ? `${rules.minMarks}%` : 'Not applicable'],
          ['Age limit', rules.maxAge ? `${rules.maxAge} years on 1 July` : rules.maxAgeByLevel ? "Master's 32, Ph.D 35, Post-doc 38 years" : 'Not applicable'],
          ...specific,
        ]}
      />
    </Panel>
  );
}

export function EligibilitySummary({ review }) {
  const results = review.ruleEvaluation.results || [];
  const count = (st) => results.filter((r) => r.status === st).length;
  const cross = review.crossChecks || [];
  return (
    <Panel id="eligibility" title="C. Eligibility summary">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-line p-3">
          <p className="text-[11.5px] text-muted">Rule evaluation (deterministic)</p>
          <div className="mt-1"><RuleResultBadge result={review.ruleEvaluation.preliminaryResult} /></div>
          <p className="num mt-1.5 text-[12px] text-muted">{count('PASS')} pass, {count('FAIL')} fail, {count('INSUFFICIENT_DATA')} insufficient data, {count('REQUIRES_HUMAN_REVIEW')} for review</p>
        </div>
        <div className="rounded border border-line p-3">
          <p className="text-[11.5px] text-muted">AI-assisted analysis (preliminary)</p>
          <div className="mt-1"><AiResultBadge result={review.aiAnalysis?.preliminaryResult} /></div>
          <p className="mt-1.5 text-[12px] text-muted">{review.aiAnalysis?.status === 'completed' ? `Analysed ${formatDateTime(review.aiAnalysis.analyzedAt)}` : review.aiAnalysis?.reason}</p>
        </div>
        <div className="rounded border border-line p-3">
          <p className="text-[11.5px] text-muted">Cross-document checks</p>
          <p className="num mt-1 text-[13px] text-ink">
            {cross.filter((x) => x.status === 'MATCH').length} match, {cross.filter((x) => x.status === 'MISMATCH').length} mismatch, {cross.filter((x) => x.status === 'PARTIAL').length} partial
          </p>
          <p className="mt-1.5 text-[12px] text-muted">{cross.filter((x) => x.status === 'UNAVAILABLE').length} not comparable (single source)</p>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-muted">These are preliminary results to support the officer. The decision in section H is final.</p>
    </Panel>
  );
}

const ROW_ICON = {
  MATCH: <CircleCheck className="h-4 w-4 text-ok" aria-hidden="true" />,
  PARTIAL: <TriangleAlert className="h-4 w-4 text-warn" aria-hidden="true" />,
  MISMATCH: <CircleX className="h-4 w-4 text-bad" aria-hidden="true" />,
  UNAVAILABLE: <CircleMinus className="h-4 w-4 text-[#98a3b1]" aria-hidden="true" />,
};

export function CrossChecks({ checks = [], aiStatus }) {
  return (
    <Panel id="cross" title="F. Cross-document checks" subtitle="The same value compared across every source that holds it" bodyClass="overflow-x-auto">
      {checks.length === 0 ? (
        <Empty title="No comparable values" className="py-6" />
      ) : (
        <table className="w-full min-w-[640px] text-[12.5px]">
          <thead className="bg-paper text-left text-[11px] uppercase tracking-wide text-muted">
            <tr>{['Field', 'Values by source', 'Status'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {checks.map((x) => (
              <tr key={x.field} className="border-t border-line align-top">
                <td className="px-3 py-2.5 font-semibold text-ink">
                  <span className="flex items-center gap-2">{ROW_ICON[x.status]}{x.field}</span>
                </td>
                <td className="px-3 py-2.5">
                  {x.values.length === 0 ? <span className="text-muted">No values recorded</span> : (
                    <ul className="space-y-0.5">
                      {x.values.map((v, i) => (
                        <li key={i}><span className="text-muted">{v.source}:</span> <span className="text-ink">{v.source.includes('birth') || x.field === 'Date of birth' ? formatDate(v.value) || v.value : String(v.value)}</span></li>
                      ))}
                    </ul>
                  )}
                  {x.note && <p className="mt-0.5 text-[11.5px] text-muted">{x.note}</p>}
                  {(x.status === 'MISMATCH' || x.status === 'PARTIAL') && <p className="mt-0.5 text-[11.5px] font-semibold text-bad">Human review required</p>}
                </td>
                <td className="px-3 py-2.5"><MatchBadge status={x.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {aiStatus !== 'completed' && (
        <p className="px-3 pb-3 pt-2 text-[12px] text-muted">
          OCR values are not included because AI-assisted analysis has not produced a result. Comparisons use the application, e-KYC profile, bank and DigiLocker records only.
        </p>
      )}
    </Panel>
  );
}

export function RuleEvaluation({ evaluation }) {
  return (
    <Panel id="rules" title={`G. Rule evaluation: ${evaluation.schemeName || evaluation.scheme}`} subtitle="Computed from the configured scheme rules; no AI involved">
      <ul className="divide-y divide-line">
        {evaluation.results.map((r) => (
          <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 py-2">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink">{r.label}</p>
              <p className="text-[12px] text-muted">{r.detail}</p>
            </div>
            <RuleStatusBadge status={r.status} />
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded border border-line bg-paper px-3 py-2.5">
        <span className="text-[12.5px] font-semibold text-ink">Final preliminary result</span>
        <RuleResultBadge result={evaluation.preliminaryResult} />
      </div>
    </Panel>
  );
}

export function ReviewHistory({ history = [] }) {
  const items = [...history].reverse();
  return (
    <Panel title="Review history" subtitle="Audit trail of submissions and decisions">
      {items.length === 0 ? (
        <p className="text-[12.5px] text-muted">No history recorded for this application.</p>
      ) : (
        <ol className="space-y-3">
          {items.map((h, i) => (
            <li key={i} className="border-l-2 border-line pl-3">
              <p className="text-[12.5px] font-semibold text-ink">{h.action}</p>
              <p className="text-[11.5px] text-muted">
                {formatDateTime(h.at)}{h.byName ? `, ${h.byName}` : ''}{h.byRole ? ` (${h.byRole})` : ''}
              </p>
              {h.category && <p className="text-[12px] text-ink">Category: {h.category}</p>}
              {h.reason && <p className="text-[12px] text-ink">Reason: {h.reason}</p>}
              {h.requiredCorrection && <p className="text-[12px] text-ink">Correction: {h.requiredCorrection}</p>}
              {h.remarks && <p className="text-[12px] text-muted">Remarks: {h.remarks}</p>}
            </li>
          ))}
        </ol>
      )}
      {history.length === 0 && <Notice className="mt-2">Older applications may not have a recorded history.</Notice>}
    </Panel>
  );
}
