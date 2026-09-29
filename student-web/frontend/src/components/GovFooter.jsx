import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

const GovFooter = () => {
  const { tx } = useLang();

  return (
    <footer className="w-full border-t border-line bg-white text-ink text-[13px] no-print">
      {/* Tricolour Accent Line */}
      <div className="tricolour" />

      {/* Main Multi-Column Institutional Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Ministry Mandate & Portal Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-navy text-white font-serif font-bold text-[15px]">
                भारत
              </span>
              <div>
                <p className="font-serif font-bold text-[14px] leading-tight text-navy">
                  जनजातीय कार्य मंत्रालय
                </p>
                <p className="text-[12px] font-medium leading-tight text-muted">
                  Ministry of Tribal Affairs
                </p>
              </div>
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted text-justify">
              {tx({
                en: 'The National Scholarship & Fellowship Portal is an integrated digital platform by the Ministry of Tribal Affairs, Government of India, dedicated to enabling accessible financial assistance and research opportunities for Scheduled Tribe students across India.',
                hi: 'राष्ट्रीय छात्रवृत्ति एवं फेलोशिप पोर्टल जनजातीय कार्य मंत्रालय, भारत सरकार की एक एकीकृत डिजिटल पहल है, जो भारत भर के अनुसूचित जनजाति के छात्रों हेतु सुलभ वित्तीय सहायता एवं शोध अवसर सुनिश्चित करती है।',
              })}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 rounded border border-line bg-paper px-2.5 py-1 text-[11.5px] font-semibold text-navy">
                <ShieldCheck className="h-3.5 w-3.5 text-leaf" />
                {tx({ en: 'e-Governance & DBT Enabled', hi: 'ई-शासन एवं डीबीटी सक्षम' })}
              </span>
            </div>
          </div>

          {/* Column 2: Supported Schemes */}
          <div>
            <h4 className="font-serif font-bold text-[14px] text-navy border-b border-line pb-2 mb-3">
              {tx({ en: 'Scholarship Schemes', hi: 'छात्रवृत्ति योजनाएं' })}
            </h4>
            <ul className="space-y-2 text-[12.5px]">
              <li>
                <Link to="/schemes/pre-matric" className="text-muted hover:text-navy hover:underline">
                  {tx({ en: 'Pre-Matric Scholarship for ST (Class IX & X)', hi: 'एसटी छात्रों हेतु मैट्रिक-पूर्व छात्रवृत्ति (कक्षा IX एवं X)' })}
                </Link>
              </li>
              <li>
                <Link to="/schemes/nfst" className="text-muted hover:text-navy hover:underline">
                  {tx({ en: 'National Fellowship for ST Students (M.Phil / Ph.D)', hi: 'एसटी छात्रों हेतु राष्ट्रीय फेलोशिप (एम.फिल / पीएच.डी)' })}
                </Link>
              </li>
              <li>
                <Link to="/schemes/nos" className="text-muted hover:text-navy hover:underline">
                  {tx({ en: 'National Overseas Scholarship for ST Students', hi: 'एसटी छात्रों हेतु राष्ट्रीय विदेशी छात्रवृत्ति' })}
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/schemes" className="font-semibold text-navy hover:underline">
                  {tx({ en: 'View All Schemes & Guidelines →', hi: 'सभी योजनाएं एवं दिशानिर्देश देखें →' })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Important Government Links & Policies */}
          <div>
            <h4 className="font-serif font-bold text-[14px] text-navy border-b border-line pb-2 mb-3">
              {tx({ en: 'Portals & Guidelines', hi: 'पोर्टल एवं नीतियां' })}
            </h4>
            <ul className="space-y-2 text-[12.5px]">
              <li>
                <a href="https://tribal.nic.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-navy hover:underline">
                  <span>tribal.nic.in (MoTA Official)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-navy hover:underline">
                  <span>National Scholarship Portal (NSP)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://digilocker.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-navy hover:underline">
                  <span>DigiLocker Integration (NAD)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://dbtbharat.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-navy hover:underline">
                  <span>DBT Bharat Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li className="pt-1 border-t border-line text-[12px] flex flex-wrap gap-x-3 gap-y-1 text-muted">
                <span className="hover:underline cursor-pointer">{tx({ en: 'Privacy Policy', hi: 'गोपनीयता नीति' })}</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">{tx({ en: 'Terms of Use', hi: 'उपयोग की शर्तें' })}</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">{tx({ en: 'Accessibility', hi: 'पहुंच' })}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpdesk & Grievance Contacts */}
          <div>
            <h4 className="font-serif font-bold text-[14px] text-navy border-b border-line pb-2 mb-3">
              {tx({ en: 'Helpdesk & Support', hi: 'हेल्पडेस्क एवं संपर्क' })}
            </h4>
            <div className="space-y-2.5 text-[12.5px] text-muted">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 shrink-0 text-navy mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">1800-11-7777</p>
                  <p className="text-[11.5px]">{tx({ en: 'Toll-Free (Mon–Fri, 9:30 AM–5:30 PM)', hi: 'टोल-फ्री (सोम-शुक्र, प्रा 9:30-सां 5:30)' })}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 shrink-0 text-navy mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">scholarship-mota@gov.in</p>
                  <p className="text-[11.5px]">{tx({ en: 'Technical & Application Support', hi: 'तकनीकी एवं आवेदन सहायता' })}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-navy mt-0.5" />
                <p className="text-[11.5px] leading-tight">
                  Ministry of Tribal Affairs, Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal, NIC Attribution, and Compliance Bar */}
      <div className="border-t border-line bg-navy text-white px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div className="space-y-1">
            <p className="text-[12px] font-medium leading-relaxed">
              {tx({
                en: 'Content owned and managed by Ministry of Tribal Affairs, Government of India.',
                hi: 'सामग्री का स्वामित्व एवं प्रबंधन जनजातीय कार्य मंत्रालय, भारत सरकार द्वारा किया जाता है।',
              })}
            </p>
            <p className="text-[11px] text-slate-300">
              {tx({
                en: 'Designed, developed and hosted by National Informatics Centre (NIC), Ministry of Electronics & Information Technology, Government of India.',
                hi: 'राष्ट्रीय सूचना विज्ञान केंद्र (एनआईसी), इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय, भारत सरकार द्वारा अभिकल्पित, विकसित और होस्ट किया गया।',
              })}
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1 text-[11px] text-slate-300 shrink-0">
            <span className="font-mono">{tx({ en: 'Portal Release 3.2.0 (ST-DBT)', hi: 'पोर्टल संस्करण 3.2.0 (एसटी-डीबीटी)' })}</span>
            <span>{tx({ en: 'GIGW 3.0 & W3C WAI-AA Compliant', hi: 'जीआईजीडब्ल्यू 3.0 एवं डब्ल्यू3सी डब्ल्यूएआई-एए अनुरूप' })}</span>
          </div>
        </div>
      </div>

      {/* Bottom Tricolour Line */}
      <div className="tricolour" />
    </footer>
  );
};

export default GovFooter;
