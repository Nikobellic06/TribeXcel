import { useState } from 'react';
import { Database, Landmark, Server, ShieldCheck, UserCheck } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { SCHEMES } from '../config/labels';

export default function Settings() {
  const { admin } = useAuth();
  const [saved, setSaved] = useState(false);

  return (
    <AdminLayout
      title="Portal System Configuration"
      breadcrumb={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Settings' }]}
    >
      <div className="space-y-5 max-w-4xl">
        {/* Officer Identity Panel */}
        <Panel title="Authorized Officer Session" subtitle="Current authentication and delegation credentials">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-[12.5px]">
            <div>
              <dt className="text-muted">Officer Name / Designation</dt>
              <dd className="font-semibold text-ink">{admin?.name || 'Scholarship Verification Officer'}</dd>
            </div>
            <div>
              <dt className="text-muted">Official Email</dt>
              <dd className="font-mono text-ink">{admin?.email || 'admin@mota.gov.in'}</dd>
            </div>
            <div>
              <dt className="text-muted">Ministry / Department</dt>
              <dd className="font-medium text-ink">Ministry of Tribal Affairs, Government of India</dd>
            </div>
            <div>
              <dt className="text-muted">Assigned Role</dt>
              <dd className="inline-flex items-center gap-1 text-ok font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Statutory Verification Authority
              </dd>
            </div>
          </dl>
        </Panel>

        {/* Scheme Rules Config Panel */}
        <Panel title="Active Scheme Guidelines & Criteria" subtitle="Configured quotas, academic cutoffs, and statutory ceilings">
          <div className="divide-y divide-line text-[12.5px]">
            <div className="py-3">
              <h4 className="font-bold text-navy">1. Pre-Matric Scholarship for ST Students (Class IX & X)</h4>
              <p className="text-muted mt-0.5">Family Income Ceiling: ₹2,50,000 per annum (Orphan students exempt) • Enrolment: Class IX & X in Govt/Recognised Schools.</p>
            </div>
            <div className="py-3">
              <h4 className="font-bold text-navy">2. National Fellowship for Higher Education of ST Students (NFST)</h4>
              <p className="text-muted mt-0.5">Slots: 750 Annual Seats (38 Divyangjan, 25 PVTG, 225 Female, 462 ST General) • Academic: 55% in Post-Graduation • Income Ceiling: None.</p>
            </div>
            <div className="py-3">
              <h4 className="font-bold text-navy">3. National Overseas Scholarship for ST Students (NOS)</h4>
              <p className="text-muted mt-0.5">Slots: 20 Annual Seats (17 ST, 3 PVTG) • Income Ceiling: ₹6,00,000 per annum • Qualifying: Top 1000 QS World Ranking Institutions.</p>
            </div>
          </div>
        </Panel>

        {/* Integration Architecture */}
        <Panel title="Digital Infrastructure & Service Connectivity" subtitle="Status of core government service connections">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
            <div className="rounded border border-line p-3 bg-paper/60">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <Database className="h-4 w-4 text-navy" />
                <span>Primary Central Database</span>
              </div>
              <p className="text-muted text-[11.5px] mt-1">MongoDB cluster at scholarship_admin (Unified Schema)</p>
              <span className="inline-block mt-2 rounded bg-leaf-soft px-2 py-0.5 text-[11px] font-bold text-leaf">
                CONNECTED
              </span>
            </div>

            <div className="rounded border border-line p-3 bg-paper/60">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <Server className="h-4 w-4 text-navy" />
                <span>AI Assistive Verification Engine</span>
              </div>
              <p className="text-muted text-[11.5px] mt-1">PaddleOCR & OpenCV Service on Port 8000</p>
              <span className="inline-block mt-2 rounded bg-leaf-soft px-2 py-0.5 text-[11px] font-bold text-leaf">
                ONLINE
              </span>
            </div>

            <div className="rounded border border-line p-3 bg-paper/60">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <Landmark className="h-4 w-4 text-navy" />
                <span>PFMS / DBT Payment Gateway</span>
              </div>
              <p className="text-muted text-[11.5px] mt-1">Aadhaar Payment Bridge System (APBS) Linkage</p>
              <span className="inline-block mt-2 rounded bg-navy-soft px-2 py-0.5 text-[11px] font-bold text-navy">
                STANDBY
              </span>
            </div>

            <div className="rounded border border-line p-3 bg-paper/60">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <UserCheck className="h-4 w-4 text-navy" />
                <span>DigiLocker / NAD Repository</span>
              </div>
              <p className="text-muted text-[11.5px] mt-1">MeitY Document Pull & Schema Validation</p>
              <span className="inline-block mt-2 rounded bg-leaf-soft px-2 py-0.5 text-[11px] font-bold text-leaf">
                ACTIVE
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}
