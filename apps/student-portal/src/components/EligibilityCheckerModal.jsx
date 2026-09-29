import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, HelpCircle, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { SCHEME_LIST, SELECTION_YEAR } from '../config/schemes';
import Button from './ui/Button';

export default function EligibilityCheckerModal({ open, onClose }) {
  const { tx } = useLang();

  const [category, setCategory] = useState('st');
  const [level, setLevel] = useState('research_india'); // school, post_matric, premier, masters_abroad, research_india
  const [income, setIncome] = useState('low'); // low (<= 2.5L), mid (2.5L - 6L), high (> 6L)
  const [marks, setMarks] = useState('high'); // high (>= 55%), low (< 55%)

  if (!open) return null;

  const isST = category === 'st' || category === 'pvtg';

  const results = SCHEME_LIST.map((scheme) => {
    let eligible = false;
    let reasons = [];

    if (!isST) {
      return {
        scheme,
        eligible: false,
        reasons: [tx({ en: 'Must belong to a notified Scheduled Tribe (ST)', hi: 'अधिसूचित अनुसूचित जनजाति (एसटी) से संबंधित होना आवश्यक है' })],
      };
    }

    if (scheme.id === 'pre-matric') {
      if (level === 'school') {
        if (income === 'low') {
          eligible = true;
          reasons.push(tx({ en: 'Studying in Class IX or X', hi: 'कक्षा IX या X में अध्ययनरत' }));
          reasons.push(tx({ en: 'Family income <= ₹2,50,000 per annum', hi: 'पारिवारिक आय ₹2,50,000 तक' }));
        } else {
          eligible = false;
          reasons.push(tx({ en: 'Family income exceeds ₹2.5 Lakh limit', hi: 'पारिवारिक आय ₹2.5 लाख की सीमा से अधिक है' }));
        }
      } else {
        eligible = false;
        reasons.push(tx({ en: 'Applicable only for Class IX & X secondary school students', hi: 'केवल कक्षा IX एवं X के माध्यमिक छात्रों हेतु' }));
      }
    } else if (scheme.id === 'post-matric') {
      if (level === 'post_matric') {
        if (income === 'low') {
          eligible = true;
          reasons.push(tx({ en: 'Post-matriculation studies in India', hi: 'भारत में मैट्रिकोत्तर अध्ययन' }));
          reasons.push(tx({ en: 'Family income <= ₹2,50,000 per annum', hi: 'पारिवारिक आय ₹2,50,000 तक' }));
        } else {
          eligible = false;
          reasons.push(tx({ en: 'Family income exceeds ₹2.5 Lakh limit', hi: 'पारिवारिक आय ₹2.5 लाख से अधिक है' }));
        }
      } else {
        eligible = false;
        reasons.push(tx({ en: 'Applicable for post-matriculation stages (Class XI to PG)', hi: 'कक्षा XI से स्नातकोत्तर स्तर हेतु' }));
      }
    } else if (scheme.id === 'top-class') {
      if (level === 'premier') {
        if (income !== 'high') {
          eligible = true;
          reasons.push(tx({ en: 'Admitted to notified premier institution (IIT/IIM/NIT/AIIMS)', hi: 'अधिसूचित उत्कृष्ट संस्थान में प्रवेश' }));
          reasons.push(tx({ en: 'Family income <= ₹6,00,000 per annum', hi: 'पारिवारिक आय ₹6,00,000 तक' }));
        } else {
          eligible = false;
          reasons.push(tx({ en: 'Family income exceeds ₹6.0 Lakh ceiling', hi: 'पारिवारिक आय ₹6 लाख से अधिक' }));
        }
      } else {
        eligible = false;
        reasons.push(tx({ en: 'Only for 250+ notified premier institutions', hi: 'केवल 250+ अधिसूचित उत्कृष्ट संस्थानों हेतु' }));
      }
    } else if (scheme.id === 'nfst') {
      if (level === 'research_india') {
        if (marks === 'high') {
          eligible = true;
          reasons.push(tx({ en: 'Regular M.Phil / Ph.D in Indian University', hi: 'भारतीय विश्वविद्यालय में नियमित एम.फिल / पीएच.डी' }));
          reasons.push(tx({ en: 'Qualifying Master’s marks >= 55% (No income ceiling)', hi: 'स्नातकोत्तर में न्यूनतम 55% अंक (कोई पारिवारिक आय सीमा नहीं)' }));
        } else {
          eligible = false;
          reasons.push(tx({ en: 'Requires minimum 55% marks in Master’s degree', hi: 'स्नातकोत्तर में न्यूनतम 55% अंक आवश्यक हैं' }));
        }
      } else {
        eligible = false;
        reasons.push(tx({ en: 'Only for regular full-time M.Phil / Ph.D in India', hi: 'केवल भारत में नियमित पूर्णकालिक एम.फिल / पीएच.डी हेतु' }));
      }
    } else if (scheme.id === 'nos') {
      if (level === 'masters_abroad') {
        if (income !== 'high' && marks === 'high') {
          eligible = true;
          reasons.push(tx({ en: 'Master’s / Ph.D / Post-doc abroad in QS Top 1000 institution', hi: 'क्यूएस शीर्ष 1000 विदेशी संस्थान में अध्ययन' }));
          reasons.push(tx({ en: 'Family income <= ₹6,00,000 & qualifying marks >= 55%', hi: 'पारिवारिक आय ₹6 लाख तक तथा योग्यता अंक 55% या अधिक' }));
        } else if (income === 'high') {
          eligible = false;
          reasons.push(tx({ en: 'Family income exceeds ₹6.0 Lakh limit', hi: 'पारिवारिक आय ₹6.0 लाख से अधिक है' }));
        } else {
          eligible = false;
          reasons.push(tx({ en: 'Requires minimum 55% marks in qualifying degree', hi: 'योग्यता डिग्री में न्यूनतम 55% अंक आवश्यक हैं' }));
        }
      } else {
        eligible = false;
        reasons.push(tx({ en: 'Applicable for higher studies in approved foreign universities', hi: 'केवल विदेश में अनुमोदित उच्च अध्ययन हेतु' }));
      }
    }

    return { scheme, eligible, reasons };
  });

  const eligibleSchemes = results.filter((r) => r.eligible);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-800 bg-navy-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <div>
              <h2 className="text-[16px] font-bold leading-tight font-serif">
                {tx({ en: 'MoTA Scheme Eligibility Self-Assessment', hi: 'मंत्रालय छात्रवृत्ति पात्रता स्व-मूल्यांकन' })}
              </h2>
              <p className="text-[11.5px] text-slate-300">
                {tx({ en: `Preliminary eligibility evaluation for Session ${SELECTION_YEAR}`, hi: `सत्र ${SELECTION_YEAR} हेतु प्रारंभिक पात्रता मूल्यांकन` })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Questionnaire */}
        <div className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-900 mb-1.5">
                {tx({ en: '1. Social Category', hi: '1. सामाजिक श्रेणी' })}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 focus:border-navy-700 focus:outline-none"
              >
                <option value="st">{tx({ en: 'Scheduled Tribe (ST)', hi: 'अनुसूचित जनजाति (एसटी)' })}</option>
                <option value="pvtg">{tx({ en: 'Particularly Vulnerable Tribal Group (PVTG)', hi: 'विशेष रूप से कमजोर जनजातीय समूह (PVTG)' })}</option>
                <option value="other">{tx({ en: 'General / OBC / SC (Not ST)', hi: 'सामान्य / अन्य (गैर-एसटी)' })}</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-slate-900 mb-1.5">
                {tx({ en: '2. Educational Level / Programme', hi: '2. शैक्षिक स्तर / पाठ्यक्रम' })}
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 focus:border-navy-700 focus:outline-none"
              >
                <option value="school">{tx({ en: 'Class IX or X (Secondary School)', hi: 'कक्षा IX या X (माध्यमिक विद्यालय)' })}</option>
                <option value="post_matric">{tx({ en: 'Class XI, XII, Diploma, UG, PG in India', hi: 'कक्षा XI, XII, डिप्लोमा, स्नातक, स्नातकोत्तर' })}</option>
                <option value="premier">{tx({ en: 'Premier Notified Institute (IIT/IIM/NIT/AIIMS)', hi: 'अधिसूचित उत्कृष्ट संस्थान (आईआईटी/एम्स/एनआईटी)' })}</option>
                <option value="research_india">{tx({ en: 'M.Phil / Ph.D in Indian University (NFST)', hi: 'भारतीय विश्वविद्यालय में एम.फिल / पीएच.डी' })}</option>
                <option value="masters_abroad">{tx({ en: 'Master’s / Ph.D Abroad (QS Top 1000)', hi: 'विदेश में मास्टर्स / पीएच.डी (क्यूएस शीर्ष 1000)' })}</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-slate-900 mb-1.5">
                {tx({ en: '3. Total Annual Family Income', hi: '3. कुल वार्षिक पारिवारिक आय' })}
              </label>
              <select
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 focus:border-navy-700 focus:outline-none"
              >
                <option value="low">{tx({ en: 'Up to ₹2,50,000 per annum', hi: '₹2,50,000 प्रति वर्ष तक' })}</option>
                <option value="mid">{tx({ en: '₹2,50,001 to ₹6,00,000 per annum', hi: '₹2,50,001 से ₹6,00,000 प्रति वर्ष' })}</option>
                <option value="high">{tx({ en: 'Above ₹6,00,000 per annum', hi: '₹6,00,000 प्रति वर्ष से अधिक' })}</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-slate-900 mb-1.5">
                {tx({ en: '4. Qualifying Examination Marks', hi: '4. अर्हक परीक्षा में अंक' })}
              </label>
              <select
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 focus:border-navy-700 focus:outline-none"
              >
                <option value="high">{tx({ en: '55% or above (or equivalent grade)', hi: '55% या अधिक (अथवा समकक्ष ग्रेड)' })}</option>
                <option value="low">{tx({ en: 'Below 55%', hi: '55% से कम' })}</option>
              </select>
            </div>
          </div>

          {/* Statutory Disclaimer per Section 25 */}
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-[11.5px] leading-relaxed text-amber-900">
            <strong>{tx({ en: 'Statutory Notice: ', hi: 'वैधानिक सूचना: ' })}</strong>
            {tx({
              en: 'This preliminary result does not constitute final selection or approval. Final eligibility is subject to document verification and scrutiny by the competent authority.',
              hi: 'यह प्रारंभिक परिणाम अंतिम चयन या स्वीकृति का गठन नहीं करता है। अंतिम पात्रता सक्षम प्राधिकारी द्वारा दस्तावेज़ सत्यापन और जांच के अधीन है।',
            })}
          </div>

          {/* Preliminary Results */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {tx({ en: 'Preliminary Assessment Result:', hi: 'प्रारंभिक मूल्यांकन परिणाम:' })}
            </h3>

            {eligibleSchemes.length === 0 ? (
              <div className="rounded border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600">
                {tx({
                  en: 'Based on the entered criteria, no matching MoTA scholarship scheme was identified. Please review scheme guidelines for specific relaxations.',
                  hi: 'दर्ज किए गए मानदंडों के अनुसार कोई मेल खाती छात्रवृत्ति नहीं मिली। कृपया विशिष्ट छूट हेतु योजना दिशानिर्देश देखें।',
                })}
              </div>
            ) : (
              <ul className="space-y-2">
                {eligibleSchemes.map(({ scheme, reasons }) => (
                  <li
                    key={scheme.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-emerald-200 bg-emerald-50/50 p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <h4 className="text-xs font-bold text-slate-900">{tx(scheme.name)}</h4>
                      </div>
                      <p className="text-[11px] text-slate-600 ml-6 mt-0.5">{reasons.join(' • ')}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 ml-6 sm:ml-0">
                      <Link
                        to={`/schemes/${scheme.id}`}
                        onClick={onClose}
                        className="rounded border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {tx({ en: 'Guidelines', hi: 'दिशानिर्देश' })}
                      </Link>
                      {scheme.applicationMode === 'DIRECT' ? (
                        <Link
                          to={`/apply/${scheme.id}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 rounded bg-navy-800 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-navy-900"
                        >
                          {tx({ en: 'Apply Directly', hi: 'प्रत्यक्ष आवेदन' })}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <a
                          href={scheme.externalPortalUrl || 'https://scholarships.gov.in'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded border border-navy-700 bg-navy-50 px-2.5 py-1 text-[11px] font-semibold text-navy-800 hover:bg-navy-100"
                        >
                          {tx({ en: 'External Route', hi: 'बाह्य पोर्टल' })}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs">
          <Button size="sm" variant="secondary" onClick={onClose}>
            {tx({ en: 'Close', hi: 'बंद करें' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
