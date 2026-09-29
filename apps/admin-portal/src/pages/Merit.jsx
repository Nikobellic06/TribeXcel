import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import AdminLayout, { refreshCounts } from '../components/layout/AdminLayout';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Badge, RuleResultBadge, StatusBadge } from '../components/ui/Badge';
import { Empty, ErrorState, Loading, Notice } from '../components/ui/States';
import { finalizeSelection, getMeritList } from '../api/admin';
import { errorMessage } from '../api/axios';
import { SCHEMES } from '../config/labels';

const NA = <span className="text-[#98a3b1]">Data not available</span>;
const TAB = 'px-3 py-2 text-[12.5px] font-semibold border-b-2 whitespace-nowrap';

export default function Merit() {
  const [params, setParams] = useSearchParams();
  const scheme = SCHEMES[params.get('scheme')] ? params.get('scheme') : 'NFST';
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    setSelected([]);
    getMeritList(scheme)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((err) => setState({ loading: false, data: null, error: errorMessage(err, 'Unable to load the merit list. Please try again.') }));
  }, [scheme]);

  useEffect(load, [load]);

  const d = state.data;
  const rows = d?.candidates || [];
  const eligibleIds = useMemo(() => rows.filter((r) => r.status === 'Eligible').map((r) => r._id), [rows]);
  const selectedCount = rows.filter((r) => r.status === 'Selected').length;
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allChecked = eligibleIds.length > 0 && eligibleIds.every((id) => selected.includes(id));

  const finalize = async () => {
    setSaving(true);
    try {
      const res = await finalizeSelection(selected);
      setMessage({ tone: 'ok', text: `${res.selected} application(s) marked as selected.${res.skipped ? ` ${res.skipped} skipped because they are not verified.` : ''}` });
      setConfirm(false);
      refreshCounts();
      load();
    } catch (err) {
      setMessage({ tone: 'bad', text: errorMessage(err, 'Selection could not be saved. Please try again.') });
      setConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Merit / Selection" breadcrumb={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Merit / Selection' }]}>
      <div className="mb-4 flex overflow-x-auto border-b border-line" role="tablist" aria-label="Scheme">
        {Object.entries(SCHEMES).map(([k, v]) => (
          <button key={k} type="button" role="tab" aria-selected={scheme === k} onClick={() => { setMessage(null); setParams({ scheme: k }); }} className={`${TAB} ${scheme === k ? 'border-navy text-navy' : 'border-transparent text-muted hover:text-ink'}`}>
            {v.name}
          </button>
        ))}
      </div>

      {message && <Notice tone={message.tone} className="mb-3">{message.text}</Notice>}

      {state.error ? (
        <div className="rounded border border-line bg-white"><ErrorState message={state.error} onRetry={load} /></div>
      ) : !d ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          <Panel title="Selection basis">
            <div className="grid gap-3 text-[12.5px] md:grid-cols-3">
              <div>
                <p className="text-muted">Ranking basis</p>
                <p className="font-semibold text-ink">{d.meritBased ? d.basis : 'Not merit-based'}</p>
              </div>
              <div>
                <p className="text-muted">Seats per year (scheme guidelines)</p>
                <p className="font-semibold text-ink">{d.seats ? d.seats.total : 'Not capped'}</p>
                {d.seats?.split && <p className="text-muted">{Object.entries(d.seats.split).map(([k, v]) => `${k} ${v}`).join(', ')}</p>}
              </div>
              <div>
                <p className="text-muted">Verified candidates / selected</p>
                <p className="num font-semibold text-ink">{d.count} / {selectedCount}</p>
              </div>
            </div>
            {!d.meritBased && (
              <Notice className="mt-3">
                The Pre-Matric Scholarship is an entitlement: every verified eligible student receives it, so there is no merit ranking. Selection confirms the award for verified applications.
              </Notice>
            )}
            <p className="mt-3 text-[12px] text-muted">
              Only officer-verified applications appear here. Ranking uses the marks and ranks declared in the application; no scores are generated. Missing values are shown as &quot;Data not available&quot; and ranked last.
            </p>
          </Panel>

          <div className="rounded border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
              <h2 className="text-[14px] font-semibold text-ink">{d.meritBased ? 'Merit list' : 'Verified applications'}</h2>
              <Button icon={Trophy} size="sm" disabled={selected.length === 0} onClick={() => setConfirm(true)}>Finalise selection ({selected.length})</Button>
            </div>
            {rows.length === 0 ? (
              <Empty title="No verified applications for this scheme" message="Applications appear here after an officer verifies them." action={<Button to="/queue" variant="secondary">Open review queue</Button>} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-[12.5px]">
                  <thead className="bg-paper text-left text-[11px] uppercase tracking-wide text-muted">
                    <tr>
                      <th className="w-10 px-3 py-2.5">
                        <input type="checkbox" aria-label="Select all verified" checked={allChecked} disabled={eligibleIds.length === 0} onChange={() => setSelected(allChecked ? [] : eligibleIds)} className="accent-[#1a3557]" />
                      </th>
                      {[d.meritBased ? 'Rank' : 'S. No.', 'Application No.', 'Applicant', 'State', 'Qualification', 'Marks', ...(scheme === 'NOS' ? ['QS rank'] : []), 'Reservation', 'Eligibility', 'Selection status'].map((h) => (
                        <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r._id} className="border-t border-line align-top">
                        <td className="px-3 py-2.5">
                          <input type="checkbox" aria-label={`Select ${r.applicationCode}`} disabled={r.status !== 'Eligible'} checked={selected.includes(r._id)} onChange={() => toggle(r._id)} className="accent-[#1a3557]" />
                        </td>
                        <td className="num px-3 py-2.5 font-semibold">{i + 1}</td>
                        <td className="num px-3 py-2.5"><Link to={`/application/${r._id}`} className="font-semibold text-navy hover:underline">{r.applicationCode}</Link></td>
                        <td className="px-3 py-2.5">{r.name}</td>
                        <td className="px-3 py-2.5">{r.state || NA}</td>
                        <td className="px-3 py-2.5">{r.qualification || (scheme === 'PRE_MATRIC' ? r.course : null) || NA}</td>
                        <td className="num px-3 py-2.5">{scheme === 'PRE_MATRIC' ? <span className="text-muted">Not applicable</span> : r.marks !== null ? `${r.marks}%` : NA}</td>
                        {scheme === 'NOS' && <td className="num px-3 py-2.5">{r.qsRank ?? NA}</td>}
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {r.isPVTG && <Badge tone="navy">PVTG</Badge>}
                            {r.hasDisability && <Badge tone="navy">Divyangjan</Badge>}
                            {r.gender === 'Female' && <Badge tone="navy">Female</Badge>}
                            {!r.isPVTG && !r.hasDisability && r.gender !== 'Female' && <span className="text-muted">ST</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">{r.rulePreliminary ? <RuleResultBadge result={r.rulePreliminary} /> : NA}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={confirm}
        onClose={() => !saving && setConfirm(false)}
        dismissable={!saving}
        title="Finalise selection"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)} disabled={saving}>Cancel</Button>
            <Button onClick={finalize} loading={saving}>Confirm selection</Button>
          </>
        }
      >
        <p className="text-[13px] text-ink">
          Mark {selected.length} verified application(s) as <span className="font-semibold">Selected</span> for {SCHEMES[scheme].name}?
        </p>
        {d?.seats && selectedCount + selected.length > d.seats.total && (
          <Notice tone="warn" className="mt-3">This exceeds the {d.seats.total} seats available for the year.</Notice>
        )}
        <p className="mt-2 text-[12px] text-muted">The selection is recorded with your name and time and cannot be undone from this screen.</p>
      </Modal>
    </AdminLayout>
  );
}
