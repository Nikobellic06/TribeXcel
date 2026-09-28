import { NavLink } from 'react-router-dom';
import { CircleHelp, ExternalLink, FileText, LayoutDashboard, Send, UserRound } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';

const items = [
  { to: '/dashboard', key: 'nav.dashboard', Icon: LayoutDashboard, end: true },
  { to: '/profile', key: 'nav.profile', Icon: UserRound },
  { to: '/schemes', key: 'nav.apply', Icon: Send },
  { to: '/applications', key: 'nav.applications', Icon: FileText },
];

/* Left navigation for signed-in pages (hidden inside the application form). */
export default function PortalNav({ onNavigate }) {
  const { t, tx } = useLang();

  return (
    <nav aria-label="Portal" className="space-y-5">
      <ul className="overflow-hidden rounded-md border border-line bg-white">
        {items.map(({ to, key, Icon, end }) => (
          <li key={to} className="border-b border-line last:border-b-0">
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 border-l-[3px] px-4 py-3 text-[14px] transition-colors ${
                  isActive ? 'border-ochre bg-navy-soft/70 font-semibold text-navy' : 'border-transparent text-ink hover:bg-paper'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {t(key)}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="rounded-md border border-line bg-white p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <CircleHelp className="h-4 w-4 text-navy" aria-hidden="true" />
          {t('nav.help')}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">
          {tx({
            en: 'Helpdesk works Monday to Friday, 9:00 AM to 5:30 PM. For complaints, use the Ministry grievance portal.',
            hi: 'हेल्पडेस्क सोमवार से शुक्रवार, प्रातः 9:00 से सायं 5:30 तक। शिकायत हेतु मंत्रालय का शिकायत पोर्टल उपयोग करें।',
          })}
        </p>
        <a
          href="https://tribal.nic.in/grievance"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-navy hover:underline"
        >
          {tx({ en: 'Open grievance portal', hi: 'शिकायत पोर्टल खोलें' })}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
}
