import { useLang } from '../i18n/LanguageContext';

const GovFooter = () => {
  const { tx } = useLang();

  return (
    <footer className="w-full border-t border-line">
      <div className="tricolour" />
      <div className="bg-navy px-6 py-6 text-center text-white">
        <p className="text-[12px] font-medium leading-relaxed">
          {tx({
            en: 'Content managed by Ministry of Tribal Affairs, Government of India',
            hi: 'सामग्री प्रबंधन: जनजातीय कार्य मंत्रालय, भारत सरकार',
          })}
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
          {tx({
            en: 'Developed by Team TribeXcel for Smart India Hackathon 2026, problem statement SIH26239',
            hi: 'स्मार्ट इंडिया हैकाथॉन 2026, समस्या विवरण SIH26239 हेतु टीम TribeXcel द्वारा विकसित',
          })}
        </p>
      </div>
      <div className="tricolour" />
    </footer>
  );
};

export default GovFooter;
