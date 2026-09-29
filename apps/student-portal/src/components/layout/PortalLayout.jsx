import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import PortalHeader from './PortalHeader';
import PortalNav from './PortalNav';
import GovFooter from '../GovFooter';

/*
 * Shell for every signed-in page.
 *   sidebar — optional custom left column (the application form passes its
 *             step checklist); defaults to the portal navigation.
 */
export default function PortalLayout({ sidebar, children }) {
  const { t } = useLang();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const side = sidebar ?? <PortalNav onNavigate={() => setDrawerOpen(false)} />;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <PortalHeader onOpenMenu={() => setDrawerOpen(true)} />

      <div className="portal-grid mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-8">
        <aside className="no-print hidden lg:block">
          <div className="sticky top-6">{side}</div>
        </aside>
        <main id="main-content" className="min-w-0">
          {children}
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/50"
            aria-label={t('common.close')}
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] overflow-y-auto bg-paper p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-navy">{t('nav.menu')}</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {side}
          </div>
        </div>
      )}

      <div className="no-print">
        <GovFooter />
      </div>
    </div>
  );
}
