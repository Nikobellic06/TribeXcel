import { useLang } from '../i18n/LanguageContext';

const GovFooter = () => {
  const { tx } = useLang();

  return (
    <footer className="w-full border-t border-line">
      <div className="tricolour" />
      <div className="bg-navy px-6 py-6 text-center text-white">
        <p className="text-[12px] font-medium leading-relaxed">
          {tx({
            en: 'Content owned and managed by Ministry of Tribal Affairs, Government of India',
            hi: 'सामग्री का स्वामित्व एवं प्रबंधन जनजातीय कार्य मंत्रालय, भारत सरकार द्वारा',
          })}
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
          {tx({
            en: 'Designed, developed and hosted by National Informatics Centre (NIC), Ministry of Electronics & Information Technology, Government of India',
            hi: 'राष्ट्रीय सूचना विज्ञान केंद्र (एनआईसी), इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय, भारत सरकार द्वारा अभिकल्पित, विकसित और होस्ट किया गया',
          })}
        </p>
      </div>
      <div className="tricolour" />
    </footer>
  );
};

export default GovFooter;
