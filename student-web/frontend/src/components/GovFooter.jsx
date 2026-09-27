import React from 'react';

const GovFooter = ({ activeLang = 'en' }) => {
  const isHindi = activeLang === 'hi';

  return (
    <footer className="w-full font-sans border-t border-gray-200">
      {/* Top Tricolour Strip */}
      <div className="flex w-full">
        <div className="flex-1 h-[3px] bg-[#FF9933]" />
        <div className="flex-1 h-[3px] bg-[#FFFFFF]" />
        <div className="flex-1 h-[3px] bg-[#138808]" />
      </div>

      {/* Main Footer Content */}
      <div className="bg-[#1a3557] text-white py-6 px-6 text-center">
        <p className="text-[12px] font-medium leading-relaxed">
          {isHindi
            ? 'सामग्री प्रबंधन: जनजातीय कार्य मंत्रालय, भारत सरकार (हैकाथॉन प्रोटोटाइप)'
            : 'Content Managed by Ministry of Tribal Affairs, Government of India (Hackathon Prototype)'}
        </p>
        <p className="text-[11px] text-gray-300 mt-1.5 leading-relaxed">
          {isHindi
            ? 'स्मार्ट इंडिया हैकाथॉन 2026 · समस्या विवरण SIH26239 के लिए टीम TribeXcel द्वारा विकसित'
            : 'Developed by Team TribeXcel for Smart India Hackathon 2026 · Problem Statement SIH26239'}
        </p>
      </div>

      {/* Bottom Tricolour Strip */}
      <div className="flex w-full">
        <div className="flex-1 h-[3px] bg-[#FF9933]" />
        <div className="flex-1 h-[3px] bg-[#FFFFFF]" />
        <div className="flex-1 h-[3px] bg-[#138808]" />
      </div>
    </footer>
  );
};

export default GovFooter;
