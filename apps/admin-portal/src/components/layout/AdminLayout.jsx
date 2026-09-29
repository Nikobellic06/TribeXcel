import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Landmark, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCounts } from '../../api/admin';
import Sidebar from './Sidebar';
import Notifications from './Notifications';

const roleLabel = (a) => (a?.role === 'super-admin' ? 'Super Administrator' : 'Administrator');

/* Other pages call this after a decision so sidebar counts stay current. */
export const refreshCounts = () => window.dispatchEvent(new Event('admin:refresh-counts'));

function ProfileMenu({ admin, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-2 rounded px-2 py-1 text-left text-white hover:bg-white/10">
        <span className="flex h-8 w-8 items-center justify-center rounded bg-white/15">
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="hidden sm:block">
          <span className="block max-w-[180px] truncate text-[12.5px] font-semibold leading-tight">{admin?.name}</span>
          <span className="block max-w-[180px] truncate text-[11px] leading-tight text-slate-300">{admin?.designation || roleLabel(admin)}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded border border-line bg-white py-1 text-ink shadow-lg">
          <div className="border-b border-line px-3.5 py-2.5">
            <p className="text-[13px] font-semibold">{admin?.name}</p>
            <p className="text-[12px] text-muted">{admin?.email}</p>
            <p className="mt-1 text-[11.5px] text-muted">
              {admin?.designation}
              <span className="block">Role: {roleLabel(admin)}</span>
            </p>
          </div>
          <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] text-bad hover:bg-bad-soft">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ title, breadcrumb = [], actions, children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState(null);
  const [drawer, setDrawer] = useState(false);

  const loadCounts = useCallback(() => {
    getCounts().then(setCounts).catch(() => {});
  }, []);

  useEffect(() => {
    loadCounts();
    setDrawer(false);
  }, [location.pathname, loadCounts]);

  useEffect(() => {
    window.addEventListener('admin:refresh-counts', loadCounts);
    return () => window.removeEventListener('admin:refresh-counts', loadCounts);
  }, [loadCounts]);

  useEffect(() => {
    document.title = `${title ? `${title} | ` : ''}Scholarship Administration Portal`;
  }, [title]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print">
        <div className="bg-navy-deep text-[11.5px] text-slate-300">
          <div className="flex h-7 items-center justify-between px-4">
            <span>Government of India</span>
            <span className="hidden sm:inline">Ministry of Tribal Affairs</span>
          </div>
        </div>
        <div className="bg-navy">
          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <button type="button" onClick={() => setDrawer(true)} className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/10 lg:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5 text-white">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-warn-line/70 bg-white/10">
                  <Landmark className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold leading-tight">Scholarship Administration Portal</span>
                  <span className="block truncate text-[11.5px] leading-tight text-slate-300">National Scholarship &amp; Fellowship Scheme for ST Students</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Notifications />
              <ProfileMenu admin={admin} onLogout={handleLogout} />
            </div>
          </div>
        </div>
        <div className="tricolour" />
      </header>

      <div className="flex flex-1">
        <aside className="no-print hidden w-[236px] shrink-0 border-r border-line bg-white lg:block">
          <div className="sticky top-0 h-[calc(100vh-0px)] max-h-screen overflow-y-auto">
            <Sidebar counts={counts} onLogout={handleLogout} />
          </div>
        </aside>

        <main id="main-content" className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              {breadcrumb.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-1 flex flex-wrap items-center gap-1 text-[12px] text-muted">
                  {breadcrumb.map((b, i) => (
                    <span key={b.label} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                      {b.to ? <Link to={b.to} className="hover:text-navy hover:underline">{b.label}</Link> : <span className="text-ink">{b.label}</span>}
                    </span>
                  ))}
                </nav>
              )}
              {title && <h1 className="text-[19px] font-semibold text-ink">{title}</h1>}
            </div>
            {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="absolute inset-0 bg-navy-deep/50" aria-label="Close navigation" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[270px] max-w-[85%] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-[13px] font-semibold text-navy">Navigation</span>
              <button type="button" onClick={() => setDrawer(false)} className="flex h-8 w-8 items-center justify-center rounded hover:bg-paper" aria-label="Close navigation">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar counts={counts} onLogout={handleLogout} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
