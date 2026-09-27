import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TricolourStrip = () => (
  <div className="flex w-full h-[3px]">
    <div className="flex-1 bg-[#FF9933]" />
    <div className="flex-1 bg-[#FFFFFF]" />
    <div className="flex-1 bg-[#138808]" />
  </div>
);

const SiteHeader = () => {
  const { student, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-[#dde1e7] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Left: Shield Icon + Title & Subtitle */}
        <Link to="/" className="flex items-center gap-3 group">
          <Shield className="w-6 h-6 sm:w-[26px] sm:h-[26px] text-[#1a3557] shrink-0" />
          <div className="flex flex-col">
            <span className="text-[14px] sm:text-[15px] font-semibold text-[#1c2b3a] leading-tight group-hover:text-[#1a3557]">
              Scholarship &amp; Fellowship Portal
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#6b7a8d] leading-tight mt-0.5">
              Ministry of Tribal Affairs · Government of India
            </span>
          </div>
        </Link>

        {/* Right Desktop: Logged in or Logged out state */}
        <div className="hidden sm:flex items-center gap-4">
          {student ? (
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-medium text-[#1c2b3a]">
                {student.name}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 border border-[#dde1e7] text-[#1c2b3a] hover:bg-gray-50 rounded-lg px-4 py-2 text-[14px] font-medium min-h-[44px] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#6b7a8d]" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-[14px] font-medium text-[#1c2b3a] hover:text-[#1a3557] px-3 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[#1a3557] hover:bg-[#102540] text-white text-[14px] font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex sm:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1c2b3a] hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#dde1e7] bg-white px-4 py-3 space-y-3">
          {student ? (
            <div className="space-y-3">
              <div className="text-[14px] font-medium text-[#1c2b3a] px-2 py-1">
                Signed in as <span className="font-semibold">{student.name}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 border border-[#dde1e7] text-[#1c2b3a] hover:bg-gray-50 rounded-lg px-4 py-2.5 text-[14px] font-medium min-h-[44px]"
              >
                <LogOut className="w-4 h-4 text-[#6b7a8d]" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[14px] font-medium text-[#1c2b3a] hover:bg-gray-50 rounded-lg px-4 py-2.5 min-h-[44px] flex items-center"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-[#1a3557] text-white text-center text-[14px] font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tricolour Strip directly below header */}
      <TricolourStrip />
    </header>
  );
};

export default SiteHeader;
