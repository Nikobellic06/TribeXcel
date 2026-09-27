import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * AppShell — wraps every protected page with the sidebar + topbar layout.
 * Children receive the main content area.
 */
export default function AppShell({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f8]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
