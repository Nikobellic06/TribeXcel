import { useMemo, useState } from 'react';
import { Ban, BadgeCheck, FilePen, Gavel } from 'lucide-react';
import Panel from '../ui/Panel';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AiResultBadge, RuleResultBadge } from '../ui/Badge';
import { Label, Select, Textarea } from '../ui/Form';
import { Notice } from '../ui/States';
import { recordDecision } from '../../api/admin';
import { errorMessage } from '../../api/axios';

const OPTIONS = [
  { key: 'verify', label: 'Verify application', icon: BadgeCheck, tone: 'ok' },
  { key: 'defective', label: 'Mark defective', icon: FilePen, tone: 'warn' },
  { key: 'reject', label: 'Reject application', icon: Ban, tone: 'bad' },
];

/* Mirrors the backend rules in applicationController.decide */
function allowed(status) {
  if (status === 'Pending' || status === 'Flagged') return ['verify', 'defective', 'reject'];
  if (status === 'Eligible') return ['defective', 'reject'];
  if (status === 'Deficient') return ['reject'];
  return [];
}

const STATE_NOTE = {
  Eligible: 'This application has been verified. It can still be marked defective or rejected if a problem is found before selection.',
  Deficient: 'Awaiting the applicant’s correction. It returns to the queue when the applicant resubmits. It can be rejected with a reason.',
  Selected: 'This application is selected in the merit list. No further decision can be recorded.',
  Rejected: 'This application has been rejected. No further decision can be recorded.',
};

export default function OfficerDecision({ app, options, onDone }) {
  const permitted = allowed(app.status);
  const [decision, setDecision] = useState('');
  const [form, setForm] = useState({ defectCategory: '', reason: '', requiredCorrection: '', rejectionReason: '', remarks: '' });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!decision) e.decision = 'Select a decision.';
    if (decision === 'defective') {
      if (!form.defectCategory) e.defectCategory = 'Select a defect category.';
      if (form.reason.trim().length < 10) e.reason = 'Give the reason (at least 10 characters).';
      if (form.requiredCorrection.trim().length < 5) e.requiredCorrection = 'State the correction required.';
    }
    if (decision === 'reject') {
      if (!form.rejectionReason) e.rejectionReason = 'Select a rejection reason.';
      if (form.remarks.trim().length < 10) e.remarks = 'Officer remarks are required for a rejection (at least 10 characters).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payload = useMemo(() => {
    if (decision === 'verify') return { decision, remarks: form.remarks };
    if (decision === 'defective') return { decision, defectCategory: form.defectCategory, reason: form.reason, requiredCorrection: form.requiredCorrection, remarks: form.remarks };
    return { decision, rejectionReason: form.rejectionReason, remarks: form.remarks };
  }, [decision, form]);

  const submit = async () => {
    setSaving(true);
    setServerError('');
    try {
      const res = await recordDecision(app._id, payload);
      setConfirm(false);
      setDecision('');
      setForm({ defectCategory: '', reason: '', requiredCorrection: '', rejectionReason: '', remarks: '' });
      onDone?.(res);
    } catch (err) {
      setServerError(errorMessage(err, 'The decision could not be recorded. Please try again.'));
      setConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  const chosen = OPTIONS.find((o) => o.key === decision);
  const err = (k) => errors[k] && <p className="mt-1 text-[12px] text-bad">{errors[k]}</p>;

  return (
    <Panel id="decision" title="H. Officer review" subtitle="Final decision by the authorised officer">
      <div className="space-y-2 text-[12.5px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted">AI recommendation (preliminary)</span>
          <AiResultBadge result={app.review.aiAnalysis?.preliminaryResult} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted">Rule evaluation</span>
          <RuleResultBadge result={app.review.ruleEvaluation.preliminaryResult} />
        </div>
      </div>

      {STATE_NOTE[app.status] && <Notice tone={app.status === 'Rejected' ? 'bad' : app.status === 'Deficient' ? 'warn' : 'ok'} className="mt-3">{STATE_NOTE[app.status]}</Notice>}
      {serverError && <Notice tone="bad" className="mt-3">{serverError}</Notice>}

      {permitted.length > 0 && (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (validate()) setConfirm(true);
          }}
          noValidate
        >
          <fieldset>
            <legend className="mb-1.5 text-[12px] font-semibold text-ink">Officer decision <span className="text-bad">*</span></legend>
            <div className="space-y-1.5">
              {OPTIONS.filter((o) => permitted.includes(o.key)).map((o) => (
                <label key={o.key} className={`flex cursor-pointer items-center gap-2.5 rounded border px-3 py-2 text-[13px] ${decision === o.key ? 'border-navy bg-navy-soft/60 font-semibold text-navy' : 'border-line hover:bg-paper'}`}>
                  <input type="radio" name="decision" value={o.key} checked={decision === o.key} onChange={() => { setDecision(o.key); setErrors({}); }} className="accent-[#1a3557]" />
                  <o.icon className="h-4 w-4" aria-hidden="true" /> {o.label}
                </label>
              ))}
            </div>
            {err('decision')}
          </fieldset>

          {decision === 'defective' && (
            <>
              <div>
                <Label htmlFor="d-cat" required>Defect category</Label>
                <Select id="d-cat" value={form.defectCategory} onChange={set('defectCategory')} aria-invalid={Boolean(errors.defectCategory)}>
                  <option value="">Select</option>
                  {options.defectCategories.map((c) => <option key={c}>{c}</option>)}
                </Select>
                {err('defectCategory')}
              </div>
              <div>
                <Label htmlFor="d-reason" required>Reason</Label>
                <Textarea id="d-reason" rows={2} value={form.reason} onChange={set('reason')} placeholder="What is wrong, and in which document" aria-invalid={Boolean(errors.reason)} />
                {err('reason')}
              </div>
              <div>
                <Label htmlFor="d-fix" required>Required correction</Label>
                <Textarea id="d-fix" rows={2} value={form.requiredCorrection} onChange={set('requiredCorrection')} placeholder="What the applicant must do (shown to the applicant)" aria-invalid={Boolean(errors.requiredCorrection)} />
                {err('requiredCorrection')}
              </div>
            </>
          )}

          {decision === 'reject' && (
            <div>
              <Label htmlFor="r-reason" required>Rejection reason</Label>
              <Select id="r-reason" value={form.rejectionReason} onChange={set('rejectionReason')} aria-invalid={Boolean(errors.rejectionReason)}>
                <option value="">Select</option>
                {options.rejectionReasons.map((c) => <option key={c}>{c}</option>)}
              </Select>
              {err('rejectionReason')}
            </div>
          )}

          {decision && (
            <div>
              <Label htmlFor="remarks" required={decision === 'reject'}>Officer remarks{decision !== 'reject' ? ' (optional)' : ''}</Label>
              <Textarea id="remarks" rows={3} value={form.remarks} onChange={set('remarks')} placeholder={decision === 'reject' ? 'Explain the rejection (shown to the applicant)' : 'Any note for the record'} aria-invalid={Boolean(errors.remarks)} />
              {err('remarks')}
            </div>
          )}

          <Button type="submit" className="w-full" icon={Gavel} disabled={!decision}>Record decision</Button>
          <p className="text-[11.5px] text-muted">The decision is recorded with your name and time. Defect and rejection reasons are shown to the applicant.</p>
        </form>
      )}

      <Modal
        open={confirm}
        onClose={() => !saving && setConfirm(false)}
        title="Confirm officer decision"
        dismissable={!saving}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)} disabled={saving}>Cancel</Button>
            <Button variant={decision === 'reject' ? 'bad-solid' : decision === 'verify' ? 'ok' : 'primary'} onClick={submit} loading={saving}>
              Confirm: {chosen?.label}
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink">
          You are about to <span className="font-semibold">{chosen?.label.toLowerCase()}</span> {app.applicationCode} ({app.name}).
        </p>
        <dl className="mt-3 space-y-1.5 text-[12.5px]">
          {decision === 'defective' && (
            <>
              <div><dt className="inline text-muted">Category: </dt><dd className="inline">{form.defectCategory}</dd></div>
              <div><dt className="inline text-muted">Reason: </dt><dd className="inline">{form.reason}</dd></div>
              <div><dt className="inline text-muted">Required correction: </dt><dd className="inline">{form.requiredCorrection}</dd></div>
            </>
          )}
          {decision === 'reject' && <div><dt className="inline text-muted">Reason: </dt><dd className="inline">{form.rejectionReason}</dd></div>}
          {form.remarks && <div><dt className="inline text-muted">Remarks: </dt><dd className="inline">{form.remarks}</dd></div>}
        </dl>
      </Modal>
    </Panel>
  );
}
