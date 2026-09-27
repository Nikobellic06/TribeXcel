const TricolourStrip = () => (
  <div className="flex w-full h-[3px]">
    <div className="flex-1 bg-[#FF9933]" />
    <div className="flex-1 bg-[#FFFFFF]" />
    <div className="flex-1 bg-[#138808]" />
  </div>
);

const SiteFooter = () => {
  return (
    <footer className="mt-auto bg-white border-t border-[#dde1e7]">
      {/* Tricolour Strip directly above footer bar */}
      <TricolourStrip />
      
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-[11px] text-[#6b7a8d]">
          © 2026 Ministry of Tribal Affairs, Government of India
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-[11px] text-[#6b7a8d] hover:text-[#1a3557] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-[11px] text-[#6b7a8d] hover:text-[#1a3557] transition-colors"
          >
            Terms of Use
          </a>
          <a
            href="#"
            className="text-[11px] text-[#6b7a8d] hover:text-[#1a3557] transition-colors"
          >
            Help
          </a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
