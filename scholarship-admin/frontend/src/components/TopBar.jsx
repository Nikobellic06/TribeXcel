import { Menu, Bell } from 'lucide-react';

export default function TopBar({ title, onMenuClick }) {
  return (
    <header className="flex items-center justify-between h-14 px-5 bg-white border-b border-[#dde1e7] shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[15px] font-semibold text-[#1c2b3a]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-2 ml-1 pl-3 border-l border-gray-200">
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  );
}
