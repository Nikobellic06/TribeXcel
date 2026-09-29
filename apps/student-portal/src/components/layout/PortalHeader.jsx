import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, UserRound } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import UtilityBar from './UtilityBar';
import Emblem from './Emblem';

/* Header for signed-in pages (dashboard, profile, application form). */
export default function PortalHeader({ onOpenMenu }) {
  const { t } = useLang();
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (student?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="no-print">
      <UtilityBar />
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                className="-ml-1 flex h-10 w-10 items-center justify-center rounded-md text-navy hover:bg-navy-soft lg:hidden"
                aria-label={t('nav.menu')}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
              <Emblem size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold leading-tight text-navy sm:text-[15px]">
                  {t('portal.name')}
                </span>
                <span className="block truncate text-[12px] leading-tight text-muted">
                  {t('portal.ministry')}, {t('portal.goi')}
                </span>
              </span>
            </Link>
          </div>

          {student && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-md border border-line py-1 pl-1 pr-2 hover:border-navy/40"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded bg-navy-soft text-[12px] font-bold text-navy">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[160px] truncate text-[13px] font-semibold leading-tight text-ink">
                    {student.name}
                  </span>
                  <span className="block text-[11px] leading-tight text-muted">{student.rollNumber}</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div role="menu" className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-md border border-line bg-white py-1 shadow-lg">
                  <Link role="menuitem" to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink hover:bg-paper">
                    <LayoutDashboard className="h-4 w-4 text-muted" /> {t('nav.dashboard')}
                  </Link>
                  <Link role="menuitem" to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink hover:bg-paper">
                    <UserRound className="h-4 w-4 text-muted" /> {t('nav.profile')}
                  </Link>
                  <button role="menuitem" type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-[13px] text-alert hover:bg-alert-soft">
                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="tricolour" />
    </header>
  );
}
