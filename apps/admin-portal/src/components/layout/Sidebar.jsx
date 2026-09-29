import { NavLink, useLocation } from 'react-router-dom';
import { ChartColumn, ChevronDown, FileText, Inbox, LayoutDashboard, LogOut, Shield, Trophy } from 'lucide-react';
import { useState } from 'react';
import { VIEWS } from '../../config/labels';

const link = ({ isActive }) =>
  `flex items-center gap-2.5 border-l-[3px] px-4 py-2 text-[13px] transition-colors ${
    isActive ? 'border-warn-line bg-navy-soft/70 font-semibold text-navy' : 'border-transparent text-ink hover:bg-paper'
  }`;

function Count({ value }) {
  if (value === undefined || value === null) return null;
  return <span className="num ml-auto rounded bg-paper px-1.5 text-[11px] font-semibold text-muted">{value}</span>;
}

export default function Sidebar({ counts, onLogout, onNavigate }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);
  const inApplications = pathname.startsWith('/applications') || pathname.startsWith('/application/');

  return (
    <nav aria-label="Administration" className="flex h-full flex-col bg-white">
      <div className="py-3">
        <NavLink to="/dashboard" className={link} onClick={onNavigate}>
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
        </NavLink>
        <NavLink to="/queue" className={link} onClick={onNavigate}>
          <Inbox className="h-4 w-4" aria-hidden="true" /> Review Queue
          <Count value={counts ? counts.pending + counts.flagged : undefined} />
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`flex w-full items-center gap-2.5 border-l-[3px] px-4 py-2 text-left text-[13px] ${inApplications ? 'border-warn-line font-semibold text-navy' : 'border-transparent text-ink hover:bg-paper'}`}
        >
          <FileText className="h-4 w-4" aria-hidden="true" /> Applications
          <ChevronDown className={`ml-auto h-3.5 w-3.5 text-muted transition-transform ${open ? '' : '-rotate-90'}`} aria-hidden="true" />
        </button>
        {open && (
          <ul className="mb-1">
            {Object.entries(VIEWS).map(([key, v]) => (
              <li key={key}>
                <NavLink
                  to={key === 'all' ? '/applications' : `/applications/${key}`}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center py-1.5 pl-11 pr-4 text-[12.5px] ${isActive ? 'font-semibold text-navy' : 'text-muted hover:text-ink'}`
                  }
                >
                  {v.title}
                  <Count value={counts?.[v.countKey]} />
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        <NavLink to="/merit" className={link} onClick={onNavigate}>
          <Trophy className="h-4 w-4" aria-hidden="true" /> Merit / Selection
        </NavLink>
        <NavLink to="/reports" className={link} onClick={onNavigate}>
          <FileText className="h-4 w-4" aria-hidden="true" /> Reports &amp; Exports
        </NavLink>
        <NavLink to="/audit-logs" className={link} onClick={onNavigate}>
          <Shield className="h-4 w-4" aria-hidden="true" /> Audit Trail
        </NavLink>
        <NavLink to="/analytics" className={link} onClick={onNavigate}>
          <ChartColumn className="h-4 w-4" aria-hidden="true" /> Analytics
        </NavLink>
        <NavLink to="/settings" className={link} onClick={onNavigate}>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" aria-hidden="true" /> System Settings
        </NavLink>
      </div>
      <div className="mt-auto border-t border-line py-2">
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-bad hover:bg-bad-soft">
          <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
        </button>
      </div>
    </nav>
  );
}
