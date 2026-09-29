import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

const GovFooter = () => {
  const { tx } = useLang();

  return (
    <footer className="w-full border-t border-slate-300 bg-white text-slate-800 text-[13px] no-print">
      {/* Tricolour Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 border-b border-slate-200" />

      {/* Main Multi-Column Institutional Footer */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Ministry Mandate & Portal Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-navy-900 text-amber-300 font-serif font-bold text-xs border border-navy-700">
                भारत
              </div>
              <div>
                <p className="font-serif font-bold text-[14px] leading-tight text-navy-950">
                  जनजातीय कार्य मंत्रालय
                </p>
                <p className="text-[12px] font-medium leading-tight text-slate-600">
                  Ministry of Tribal Affairs
                </p>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-600 text-justify">
              {tx({
                en: 'The Scholarship & Fellowship Management System is an integrated e-Governance platform implemented by the Ministry of Tribal Affairs, Government of India, for end-to-end processing of scholarships and fellowships for Scheduled Tribe students.',
                hi: 'छात्रवृत्ति एवं अध्येतावृत्ति प्रबंधन प्रणाली जनजातीय कार्य मंत्रालय, भारत सरकार द्वारा अनुसूचित जनजाति के छात्रों हेतु छात्रवृत्ति एवं फेलोशिप के पारदर्शी प्रसंस्करण के लिए क्रियान्वित एक एकीकृत ई-शासन मंच है।',
              })}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-navy-900">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                {tx({ en: 'e-Governance & DBT Verified', hi: 'ई-शासन एवं डीबीटी सत्यापित' })}
              </span>
            </div>
          </div>

          {/* Column 2: Official MoTA Scheme Architecture */}
          <div>
            <h4 className="font-serif font-bold text-[13px] text-navy-950 border-b border-slate-200 pb-2 mb-3 uppercase tracking-wider">
              {tx({ en: 'Official Schemes', hi: 'आधिकारिक योजनाएं' })}
            </h4>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <Link to="/schemes/nfst" className="text-slate-600 hover:text-navy-900 hover:underline">
                  {tx({ en: 'National Fellowship for ST (NFST)', hi: 'एसटी हेतु राष्ट्रीय फेलोशिप (NFST)' })}
                </Link>
              </li>
              <li>
                <Link to="/schemes/nos" className="text-slate-600 hover:text-navy-900 hover:underline">
                  {tx({ en: 'National Overseas Scholarship (NOS)', hi: 'राष्ट्रीय विदेशी छात्रवृत्ति (NOS)' })}
                </Link>
              </li>
              <li>
                <Link to="/schemes/pre-matric" className="text-slate-600 hover:text-navy-900 hover:underline">
                  {tx({ en: 'Pre-Matric Scholarship (NSP/State)', hi: 'मैट्रिक-पूर्व छात्रवृत्ति (एनएसपी/राज्य)' })}
                </Link>
              </li>
              <li>
                <Link to="/schemes/post-matric" className="text-slate-600 hover:text-navy-900 hover:underline">
                  {tx({ en: 'Post-Matric Scholarship (NSP/State)', hi: 'पोस्ट-मैट्रिक छात्रवृत्ति (एनएसपी/राज्य)' })}
                </Link>
              </li>
              <li>
                <Link to="/schemes/top-class" className="text-slate-600 hover:text-navy-900 hover:underline">
                  {tx({ en: 'Top Class Education Scheme (NSP)', hi: 'शीर्ष श्रेणी शिक्षा योजना (NSP)' })}
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/schemes" className="font-semibold text-navy-800 hover:underline">
                  {tx({ en: 'View All Schemes & Guidelines →', hi: 'सभी योजनाएं एवं दिशानिर्देश →' })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Important Government Links & Policies */}
          <div>
            <h4 className="font-serif font-bold text-[13px] text-navy-950 border-b border-slate-200 pb-2 mb-3 uppercase tracking-wider">
              {tx({ en: 'National Portals & Links', hi: 'राष्ट्रीय पोर्टल एवं नीतियां' })}
            </h4>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <a href="https://tribal.nic.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:text-navy-900 hover:underline">
                  <span>tribal.nic.in (MoTA Official)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:text-navy-900 hover:underline">
                  <span>National Scholarship Portal (NSP)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://digilocker.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:text-navy-900 hover:underline">
                  <span>DigiLocker / National Academic Depository</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://dbtbharat.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:text-navy-900 hover:underline">
                  <span>DBT Bharat Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:text-navy-900 hover:underline">
                  <span>india.gov.in (National Portal)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpdesk & Grievance Contacts */}
          <div>
            <h4 className="font-serif font-bold text-[13px] text-navy-950 border-b border-slate-200 pb-2 mb-3 uppercase tracking-wider">
              {tx({ en: 'Helpdesk & Support', hi: 'हेल्पडेस्क एवं संपर्क' })}
            </h4>
            <div className="space-y-2 text-[12px] text-slate-600">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 shrink-0 text-navy-800 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">011-23381652 / 1800-11-7777</p>
                  <p className="text-[11px] text-slate-500">{tx({ en: 'Toll-Free (Working Days, 9:30 AM–5:30 PM)', hi: 'टोल-फ्री (कार्य दिवस, 9:30 से 5:30)' })}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 shrink-0 text-navy-800 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">fellowship-tribal@nic.in</p>
                  <p className="text-[11px] text-slate-500">{tx({ en: 'Scholarship Division, MoTA', hi: 'छात्रवृत्ति प्रभाग, जनजातीय कार्य मंत्रालय' })}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-navy-800 mt-0.5" />
                <p className="text-[11px] leading-tight text-slate-600">
                  Ministry of Tribal Affairs, Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Policy Sub-footer */}
        <div className="mt-8 border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="hover:underline cursor-pointer">{tx({ en: 'Website Policies', hi: 'वेबसाइट नीतियां' })}</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">{tx({ en: 'Privacy Policy', hi: 'गोपनीयता नीति' })}</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">{tx({ en: 'Terms & Conditions', hi: 'नियम एवं शर्तें' })}</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">{tx({ en: 'Right to Information (RTI)', hi: 'सूचना का अधिकार (RTI)' })}</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">{tx({ en: 'Helpdesk & Feedback', hi: 'हेल्पडेस्क एवं प्रतिक्रिया' })}</span>
          </div>
          <div>
            © {new Date().getFullYear()} Ministry of Tribal Affairs, Government of India.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GovFooter;
