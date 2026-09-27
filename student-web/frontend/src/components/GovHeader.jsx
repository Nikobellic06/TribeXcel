import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, Menu, X, Globe } from 'lucide-react';

const GovHeader = ({ activeLang = 'en', onToggleLang }) => {
  const [fontScale, setFontScale] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSchemesDropdownOpen, setIsSchemesDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  const handleIncreaseFont = () => {
    setFontScale((prev) => Math.min(1.3, parseFloat((prev + 0.1).toFixed(2))));
  };

  const handleDecreaseFont = () => {
    setFontScale((prev) => Math.max(0.85, parseFloat((prev - 0.1).toFixed(2))));
  };

  const handleResetFont = () => {
    setFontScale(1);
  };

  const isHindi = activeLang === 'hi';

  return (
    <header className="w-full font-sans border-b border-gray-200">
      {/* 1. UTILITY BAR (Very top of page) */}
      <div className="bg-[#0d1b2e] py-1.5 px-4 sm:px-6 flex flex-row justify-between items-center text-[11px] text-gray-300 border-b border-slate-800">
        {/* Left items */}
        <div className="flex items-center">
          <a
            href="#main-content"
            className="hover:text-white transition-colors underline focus:outline-none focus:ring-1 focus:ring-white"
          >
            {isHindi ? 'मुख्य विषय-वस्तु पर जाएं' : 'Skip to Main Content'}
          </a>
          <span className="border-l border-gray-600 pl-3 ml-3 hidden sm:inline">
            <button
              type="button"
              className="hover:text-white transition-colors focus:outline-none"
              title={isHindi ? 'स्क्रीन रीडर पहुंच' : 'Screen Reader Access'}
            >
              {isHindi ? 'स्क्रीन रीडर पहुंच' : 'Screen Reader Access'}
            </button>
          </span>
          <span className="border-l border-gray-600 pl-3 ml-3 hidden sm:inline">
            <a href="#sitemap" className="hover:text-white transition-colors">
              {isHindi ? 'साइटमैप' : 'Sitemap'}
            </a>
          </span>
          {onToggleLang && (
            <span className="border-l border-gray-600 pl-3 ml-3">
              <button
                type="button"
                onClick={onToggleLang}
                className="hover:text-white transition-colors flex items-center gap-1 font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
              >
                <Globe className="w-3 h-3 text-amber-300" />
                {isHindi ? 'English' : 'हिन्दी'}
              </button>
            </span>
          )}
        </div>

        {/* Right font size controls */}
        <div className="flex items-center gap-1 font-mono">
          <span className="text-gray-400 mr-1 text-[10px] hidden xs:inline">
            {isHindi ? 'पाठ आकार:' : 'Text Size:'}
          </span>
          <button
            type="button"
            onClick={handleDecreaseFont}
            className="px-1.5 py-0.5 hover:text-white hover:underline focus:outline-none bg-slate-800 rounded border border-slate-700 text-[10px]"
            title="Decrease Font Size"
          >
            A-
          </button>
          <button
            type="button"
            onClick={handleResetFont}
            className="px-1.5 py-0.5 hover:text-white hover:underline focus:outline-none bg-slate-800 rounded border border-slate-700 text-[10px]"
            title="Reset Font Size"
          >
            A
          </button>
          <button
            type="button"
            onClick={handleIncreaseFont}
            className="px-1.5 py-0.5 hover:text-white hover:underline focus:outline-none bg-slate-800 rounded border border-slate-700 text-[10px]"
            title="Increase Font Size"
          >
            A+
          </button>
        </div>
      </div>

      {/* 2. ROW 1 - Ministry Branding */}
      <div className="py-4 px-4 sm:px-6 flex flex-row justify-between items-center bg-white border-b border-gray-200">
        {/* Left side circular badge + text */}
        <Link to="/" className="flex flex-row gap-3 sm:gap-4 items-center group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1a3557] flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#102540] transition-colors">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-[14px] sm:text-[16px] font-bold text-[#1a3557] leading-tight"
              style={{ fontFamily: "'Noto Sans Devanagari', serif" }}
            >
              जनजातीय कल्याण एवं छात्रवृत्ति पोर्टल
            </span>
            <span className="font-serif text-[12px] sm:text-[13px] text-[#4b5563] font-medium leading-tight">
              Ministry of Tribal Affairs
            </span>
          </div>
        </Link>

        {/* Right side large portal title */}
        <div className="text-right">
          <h1 className="font-serif text-[15px] md:text-[24px] font-bold text-[#1a3557] tracking-wide uppercase leading-tight">
            {isHindi ? 'राष्ट्रीय छात्रवृत्ति एवं फेलोशिप पोर्टल' : 'NATIONAL SCHOLARSHIP & FELLOWSHIP PORTAL'}
          </h1>
          <span className="text-[10px] sm:text-[11px] text-gray-500 font-sans tracking-normal block mt-0.5">
            {isHindi ? 'भारत सरकार' : 'Government of India'}
          </span>
        </div>
      </div>

      {/* 3. ROW 2 - Navigation bar */}
      <div className="bg-[#1a3557] px-4 sm:px-6 flex flex-row justify-between items-center h-12 relative z-30 shadow-md">
        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 h-full">
          <Link
            to="/"
            className="text-white hover:bg-[#25456e] text-[14px] font-medium px-4 h-full flex items-center transition-colors"
          >
            {isHindi ? 'मुख्य पृष्ठ' : 'Home'}
          </Link>
          <a
            href="/#about-scheme"
            className="text-white hover:bg-[#25456e] text-[14px] px-4 h-full flex items-center transition-colors"
          >
            {isHindi ? 'योजना के बारे में' : 'About the Scheme'}
          </a>

          {/* Available Schemes Dropdown */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setIsSchemesDropdownOpen(true)}
            onMouseLeave={() => setIsSchemesDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsSchemesDropdownOpen(!isSchemesDropdownOpen)}
              className="text-white hover:bg-[#25456e] text-[14px] px-4 h-full flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              {isHindi ? 'उपलब्ध योजनाएं' : 'Available Schemes'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSchemesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSchemesDropdownOpen && (
              <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-50 animate-fadeIn">
                <Link
                  to="/schemes/nfst"
                  onClick={() => setIsSchemesDropdownOpen(false)}
                  className="px-4 py-2.5 text-[13px] text-[#1a3557] hover:bg-[#f0f4f9] block transition-colors font-medium"
                >
                  {isHindi ? 'NFST योजना' : 'NFST Scheme'}
                </Link>
                <Link
                  to="/schemes/nos"
                  onClick={() => setIsSchemesDropdownOpen(false)}
                  className="px-4 py-2.5 text-[13px] text-[#1a3557] hover:bg-[#f0f4f9] block transition-colors font-medium"
                >
                  {isHindi ? 'NOS योजना' : 'NOS Scheme'}
                </Link>
                <Link
                  to="/schemes/pre-matric"
                  onClick={() => setIsSchemesDropdownOpen(false)}
                  className="px-4 py-2.5 text-[13px] text-[#1a3557] hover:bg-[#f0f4f9] block transition-colors font-medium"
                >
                  {isHindi ? 'मैट्रिक-पूर्व छात्रवृत्ति' : 'Pre-Matric Scholarship'}
                </Link>
              </div>
            )}
          </div>

          <a
            href="/#resources"
            className="text-white hover:bg-[#25456e] text-[14px] px-4 h-full flex items-center transition-colors"
          >
            {isHindi ? 'संसाधन' : 'Resources'}
          </a>
          <a
            href="/#contact"
            className="text-white hover:bg-[#25456e] text-[14px] px-4 h-full flex items-center transition-colors"
          >
            {isHindi ? 'संपर्क करें' : 'Contact Us'}
          </a>
        </nav>

        {/* Mobile Hamburger toggle + Mobile view nav trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-1.5 rounded hover:bg-[#25456e] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="text-white font-medium text-[13px] md:hidden">
            {isHindi ? 'मेनू' : 'Menu'}
          </span>
        </div>

        {/* Right side Auth Buttons (always visible on mobile & desktop) */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-white text-[13px] sm:text-[14px] hover:underline px-2.5 sm:px-3 py-1.5 transition-colors font-medium"
          >
            {isHindi ? 'लॉगिन' : 'Login'}
          </Link>
          <Link
            to="/signup"
            className="bg-white text-[#1a3557] text-[13px] sm:text-[14px] font-semibold px-3.5 sm:px-4 py-1.5 rounded hover:bg-gray-100 transition-colors shadow-xs"
          >
            {isHindi ? 'साइन अप' : 'Sign Up'}
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown Nav Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#152a45] text-white px-4 py-3 border-t border-[#25456e] space-y-1 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 px-3 rounded hover:bg-[#25456e] text-[14px] font-medium"
          >
            {isHindi ? 'मुख्य पृष्ठ' : 'Home'}
          </Link>
          <a
            href="/#about-scheme"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 px-3 rounded hover:bg-[#25456e] text-[14px]"
          >
            {isHindi ? 'योजना के बारे में' : 'About the Scheme'}
          </a>

          {/* Mobile Schemes sub-menu */}
          <div className="py-1 px-3 border-l-2 border-blue-400 my-1 bg-[#102035] rounded-r space-y-1">
            <span className="text-[12px] font-semibold text-blue-300 block mb-1">
              {isHindi ? 'उपलब्ध योजनाएं:' : 'Available Schemes:'}
            </span>
            <Link
              to="/schemes/nfst"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-left py-1 text-[13px] text-gray-200 hover:text-white pl-2"
            >
              • {isHindi ? 'NFST योजना' : 'NFST Scheme'}
            </Link>
            <Link
              to="/schemes/nos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-left py-1 text-[13px] text-gray-200 hover:text-white pl-2"
            >
              • {isHindi ? 'NOS योजना' : 'NOS Scheme'}
            </Link>
            <Link
              to="/schemes/pre-matric"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-left py-1 text-[13px] text-gray-200 hover:text-white pl-2"
            >
              • {isHindi ? 'मैट्रिक-पूर्व छात्रवृत्ति' : 'Pre-Matric Scholarship'}
            </Link>
          </div>

          <a
            href="/#resources"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 px-3 rounded hover:bg-[#25456e] text-[14px]"
          >
            {isHindi ? 'संसाधन' : 'Resources'}
          </a>
          <a
            href="/#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 px-3 rounded hover:bg-[#25456e] text-[14px]"
          >
            {isHindi ? 'संपर्क करें' : 'Contact Us'}
          </a>
        </div>
      )}
    </header>
  );
};

export default GovHeader;
