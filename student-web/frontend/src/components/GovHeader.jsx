import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SCHEME_LIST } from '../config/schemes';
import UtilityBar from './layout/UtilityBar';
import Emblem from './layout/Emblem';
import EligibilityCheckerModal from './EligibilityCheckerModal';

/* Header for public pages: landing, scheme pages, login and sign-up. */
const GovHeader = () => {
  const { t, tx } = useLang();
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [schemesOpen, setSchemesOpen] = useState(false);
  const [eligibilityOpen, setEligibilityOpen] = useState(false);

  const navLink = 'flex h-full items-center px-4 text-[14px] text-white transition-colors hover:bg-[#25456e]';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full border-b border-line">
      <UtilityBar />

      {/* Ministry branding */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 sm:gap-4">
            <Emblem />
            <span className="flex flex-col">
              <span className="text-[14px] font-bold leading-tight text-navy sm:text-[16px]">
                जनजातीय कार्य मंत्रालय
              </span>
              <span className="font-serif text-[12px] font-medium leading-tight text-muted sm:text-[13px]">
                Ministry of Tribal Affairs
              </span>
            </span>
          </Link>
          <div className="hidden text-right sm:block">
            <p className="font-serif text-[16px] font-bold leading-tight text-navy md:text-[22px]">{t('portal.name')}</p>
            <p className="mt-0.5 text-[11px] text-muted">{t('portal.goi')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-30 bg-navy shadow-md">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
          <nav className="hidden h-full items-center md:flex" aria-label="Main">
            <Link to="/" className={`${navLink} font-medium`}>{t('nav.home')}</Link>
            <a href="/#about-scheme" className={navLink}>{tx({ en: 'About the scheme', hi: 'योजना के बारे में' })}</a>
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => setSchemesOpen(true)}
              onMouseLeave={() => setSchemesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setSchemesOpen((o) => !o)}
                aria-expanded={schemesOpen}
                className={`${navLink} gap-1.5`}
              >
                {tx({ en: 'Available schemes', hi: 'उपलब्ध योजनाएं' })}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${schemesOpen ? 'rotate-180' : ''}`} />
              </button>
              {schemesOpen && (
                <div className="absolute left-0 top-full z-50 min-w-[260px] rounded-b-md border border-line bg-white py-2 shadow-lg">
                  {SCHEME_LIST.map((s) => (
                    <Link
                      key={s.id}
                      to={`/schemes/${s.id}`}
                      onClick={() => setSchemesOpen(false)}
                      className="block px-4 py-2.5 hover:bg-navy-soft/60"
                    >
                      <span className="block text-[13px] font-semibold text-navy">{tx(s.short)}</span>
                      <span className="block text-[12px] text-muted">{tx(s.level)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEligibilityOpen(true)}
              className={`${navLink} font-semibold text-[#f0c870] hover:text-white`}
            >
              {tx({ en: 'Check Eligibility', hi: 'पात्रता जांचें' })}
            </button>
            <a href="/#resources" className={navLink}>{tx({ en: 'Resources', hi: 'संसाधन' })}</a>
            <a href="/#contact" className={navLink}>{tx({ en: 'Contact us', hi: 'संपर्क करें' })}</a>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex items-center gap-2 rounded p-1.5 text-white hover:bg-[#25456e] md:hidden"
            aria-label={t('nav.menu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="text-[13px] font-medium">{t('nav.menu')}</span>
          </button>

          <div className="flex items-center gap-2">
            {student ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy hover:bg-gray-100 sm:text-[14px]"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 text-[13px] font-medium text-white hover:underline sm:text-[14px]"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-2.5 py-1.5 text-[13px] font-medium text-white hover:underline sm:px-3 sm:text-[14px]">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="rounded bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy hover:bg-gray-100 sm:px-4 sm:text-[14px]"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-1 border-t border-[#25456e] bg-[#152a45] px-4 py-3 text-white md:hidden">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2 text-[14px] font-medium hover:bg-[#25456e]">
            {t('nav.home')}
          </Link>
          <a href="/#about-scheme" onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2 text-[14px] hover:bg-[#25456e]">
            {tx({ en: 'About the scheme', hi: 'योजना के बारे में' })}
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setEligibilityOpen(true);
            }}
            className="block w-full text-left rounded px-3 py-2 text-[14px] font-semibold text-[#f0c870] hover:bg-[#25456e]"
          >
            {tx({ en: 'Check Eligibility', hi: 'पात्रता जांचें' })}
          </button>
          <div className="my-1 rounded-r border-l-2 border-[#d9a441] bg-[#102035] px-3 py-2">
            <span className="mb-1 block text-[12px] font-semibold text-[#f0c870]">
              {tx({ en: 'Available schemes', hi: 'उपलब्ध योजनाएं' })}
            </span>
            {SCHEME_LIST.map((s) => (
              <Link
                key={s.id}
                to={`/schemes/${s.id}`}
                onClick={() => setMobileOpen(false)}
                className="block py-1.5 pl-2 text-[13px] text-slate-200 hover:text-white"
              >
                {tx(s.short)}: {tx(s.level)}
              </Link>
            ))}
          </div>
          <a href="/#resources" onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2 text-[14px] hover:bg-[#25456e]">
            {tx({ en: 'Resources', hi: 'संसाधन' })}
          </a>
          <a href="/#contact" onClick={() => setMobileOpen(false)} className="block rounded px-3 py-2 text-[14px] hover:bg-[#25456e]">
            {tx({ en: 'Contact us', hi: 'संपर्क करें' })}
          </a>
        </div>
      )}

      <EligibilityCheckerModal open={eligibilityOpen} onClose={() => setEligibilityOpen(false)} />
    </header>
  );
};

export default GovHeader;
