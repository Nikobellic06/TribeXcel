import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Award,
  BarChart2,
  LogOut,
  Shield,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',      Icon: LayoutDashboard },
  { to: '/queue',      label: 'Review Queue',   Icon: ClipboardList   },
  { to: '/merit',      label: 'Merit & Selection', Icon: Award        },
  { to: '/analytics',  label: 'Analytics',      Icon: BarChart2       },
];

export default function Sidebar({ open, onClose }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-60 flex flex-col
          bg-[#1a3557] text-white
          transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded bg-white/15 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight text-white">
              Scholarship Admin
            </div>
            <div className="text-[11px] text-white/50 leading-tight mt-0.5">
              MoTA · Government of India
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors duration-100 ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/65 hover:text-white hover:bg-white/8'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-white/60'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile / logout */}
        <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <User size={13} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate leading-tight">
                {admin?.name || 'Admin'}
              </div>
              <div className="text-[11px] text-white/45 leading-tight mt-0.5 truncate">
                {admin?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded text-sm text-white/65 hover:text-white hover:bg-white/8 transition-colors duration-100"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
