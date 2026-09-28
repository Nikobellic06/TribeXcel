import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, HelpCircle, ShieldCheck, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { SCHEME_LIST, SELECTION_YEAR } from '../config/schemes';
import { formatINR } from '../utils/format';
import Button from './ui/Button';

export default function EligibilityCheckerModal({ open, onClose }) {
  const { t, tx } = useLang();

  const [category, setCategory] = useState('st');
  const [level, setLevel] = useState('school'); // school, ug, masters_abroad, research_india
  const [income, setIncome] = useState('low'); // low (<= 2.5L), mid (2.5L - 6L), high (> 6L)
  const [marks, setMarks] = useState('high'); // high (>= 55%), low (< 55%)

  if (!open) return null;

  // Determine eligibility
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
        reasons.push(tx({ en: 'Only for Class IX & X secondary students', hi: 'केवल कक्षा IX एवं X के माध्यमिक छात्रों हेतु' }));
      }
    } else if (scheme.id === 'nfst') {
      if (level === 'research_india') {
        if (marks === 'high') {
          eligible = true;
          reasons.push(tx({ en: 'Full-time M.Phil / Ph.D in Indian University', hi: 'भारतीय विश्वविद्यालय में पूर्णकालिक एम.फिल / पीएच.डी' }));
          reasons.push(tx({ en: 'Qualifying marks >= 55% (No income ceiling)', hi: 'न्यूनतम अंक 55% (कोई पारिवारिक आय सीमा नहीं)' }));
        } else {
          eligible = false;
          reasons.push(tx({ en: 'Requires minimum 55% marks in Post-Graduation', hi: 'स्नातकोत्तर में न्यूनतम 55% अंक आवश्यक हैं' }));
        }
      } else {
        eligible = false;
        reasons.push(tx({ en: 'Only for M.Phil / Ph.D scholars in India', hi: 'केवल भारत में एम.फिल / पीएच.डी शोधार्थियों हेतु' }));
      }
    } else if (scheme.id === 'nos') {
      if (level === 'masters_abroad') {
        if (income !== 'high' && marks === 'high') {
          eligible = true;
          reasons.push(tx({ en: 'Masters / Ph.D abroad in top 1000 QS ranked institutions', hi: 'शीर्ष 1000 क्यूएस रैंक वाले विदेशी संस्थानों में स्नातकोत्तर / पीएच.डी' }));
          reasons.push(tx({ en: 'Family income <= ₹6,00,000 & qualifying marks >= 55%', hi: 'पारिवारिक आय ₹6 लाख तक तथा योग्यता अंक 55% या अधिक' }));
        } else if (income === 'high') {
          eligible = false;
          reasons.push(tx({ en: 'Family income exceeds ₹6.0 Lakh limit', hi: 'पारिवारिक आय ₹6.0 लाख की सीमा से अधिक है' }));
        } else {
          eligible = false;
          reasons.push(tx({ en: 'Requires minimum 55% marks in qualifying degree', hi: 'योग्यता डिग्री में न्यूनतम 55% अंक आवश्यक हैं' }));
        }
      } else {
        eligible = false;
        reasons.push(tx({ en: 'Only for Master / Ph.D degree studies abroad', hi: 'केवल विदेश में स्नातकोत्तर / शोध अध्ययन हेतु' }));
      }
    }

    return { scheme, eligible, reasons };
  });

  const eligibleSchemes = results.filter((r) => r.eligible);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-line bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-navy px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-ochre" aria-hidden="true" />
            <div>
              <h2 className="text-[16px] font-bold leading-tight font-serif">
                {tx({ en: 'MoTA Scheme Eligibility Self-Assessment', hi: 'मंत्रालय छात्रवृत्ति पात्रता स्व-मूल्यांकन' })}
              </h2>
              <p className="text-[11.5px] text-slate-200">
                {tx({ en: `Official quick assessment for Session ${SELECTION_YEAR}`, hi: `सत्र ${SELECTION_YEAR} हेतु त्वरित आधिकारिक स्व-जाँच` })}
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
              <label className="block text-[12.5px] font-semibold text-ink mb-1.5">
                {tx({ en: '1. Social Category', hi: '1. सामाजिक श्रेणी' })}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-navy focus:outline-none"
              >
                <option value="st">{tx({ en: 'Scheduled Tribe (ST)', hi: 'अनुसूचित जनजाति (एसटी)' })}</option>
                <option value="pvtg">{tx({ en: 'Particularly Vulnerable Tribal Group (PVTG)', hi: 'विशेष रूप से कमजोर जनजातीय समूह (पीवीटीजी)' })}</option>
                <option value="other">{tx({ en: 'General / OBC / SC (Not ST)', hi: 'सामान्य / अन्य (गैर-एसटी)' })}</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-ink mb-1.5">
                {tx({ en: '2. Current Educational Level', hi: '2. वर्तमान शैक्षिक स्तर' })}
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-navy focus:outline-none"
              >
                <option value="school">{tx({ en: 'Class IX or X (Secondary School)', hi: 'कक्षा IX या X (माध्यमिक विद्यालय)' })}</option>
                <option value="research_india">{tx({ en: 'M.Phil / Ph.D in Indian University', hi: 'भारतीय विश्वविद्यालय में एम.फिल / पीएच.डी' })}</option>
                <option value="masters_abroad">{tx({ en: 'Masters / Ph.D Abroad (Overseas)', hi: 'विदेश में स्नातकोत्तर / शोध' })}</option>
                <option value="ug">{tx({ en: 'Undergraduate College (General)', hi: 'सामान्य स्नातक कॉलेज' })}</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-ink mb-1.5">
                {tx({ en: '3. Total Annual Family Income', hi: '3. कुल वार्षिक पारिवारिक आय' })}
              </label>
              <select
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full rounded border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-navy focus:outline-none"
              >
                <option value="low">{tx({ en: 'Up to ₹2,50,000 / year', hi: '₹2,50,000 प्रति वर्ष तक' })}</option>
                <option value="mid">{tx({ en: 'Between ₹2,50,001 and ₹6,00,000', hi: '₹2,50,001 से ₹6,00,000 के बीच' })}</option>
                <option value="high">{tx({ en: 'Above ₹6,00,000 / year', hi: '₹6,00,000 प्रति वर्ष से अधिक' })}</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-ink mb-1.5">
                {tx({ en: '4. Marks in Qualifying Exam', hi: '4. पिछली परीक्षा में अंक' })}
              </label>
              <select
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full rounded border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-navy focus:outline-none"
              >
                <option value="high">{tx({ en: '55% or higher (or equivalent grade)', hi: '55% या अधिक (अथवा समकक्ष ग्रेड)' })}</option>
                <option value="low">{tx({ en: 'Below 55%', hi: '55% से कम' })}</option>
              </select>
            </div>
          </div>

          {/* Results Box */}
          <div className="mt-4 rounded-md border border-line bg-paper p-4">
            <h3 className="text-[13px] font-bold text-navy mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-leaf" />
              {tx({
                en: `Eligible Schemes (${eligibleSchemes.length} Found)`,
                hi: `पात्र योजनाएं (${eligibleSchemes.length} उपलब्ध)`,
              })}
            </h3>

            {eligibleSchemes.length === 0 ? (
              <p className="text-[13px] text-muted leading-relaxed">
                {tx({
                  en: 'Based on the entered criteria, no open MoTA scheme directly matches this combination. Scheduled Tribe candidates studying in Class IX/X (<= 2.5L income), M.Phil/Ph.D in India, or Masters/Ph.D abroad (<= 6L income) qualify.',
                  hi: 'दर्ज किए गए मानदंडों अनुसार कोई योजना सीधे मेल नहीं खाती। कक्षा IX/X के एसटी छात्र (आय <= 2.5 लाख), भारत में शोधार्थी, या विदेश में अध्ययनरत छात्र (आय <= 6 लाख) पात्र हैं।',
                })}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {eligibleSchemes.map(({ scheme, reasons }) => (
                  <li
                    key={scheme.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-leaf/30 bg-white p-3 shadow-2xs"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ochre">
                        {tx(scheme.type)}
                      </span>
                      <h4 className="text-[14px] font-bold text-ink">{tx(scheme.name)}</h4>
                      <p className="text-[12px] text-muted">{reasons.join(' • ')}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        to={`/schemes/${scheme.id}`}
                        onClick={onClose}
                        className="rounded border border-line px-3 py-1.5 text-[12px] font-semibold text-navy hover:bg-paper"
                      >
                        {tx({ en: 'Details', hi: 'विवरण' })}
                      </Link>
                      <Link
                        to={`/apply/${scheme.id}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 rounded bg-navy px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-navy-deep"
                      >
                        {tx({ en: 'Apply Now', hi: 'आवेदन करें' })}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-white px-5 py-3 text-[12px] text-muted">
          <span>
            {tx({
              en: 'Statutory verification applies at the time of final online application.',
              hi: 'अंतिम ऑनलाइन आवेदन के समय सांविधिक नियमों के तहत सत्यापन लागू होता है।',
            })}
          </span>
          <Button size="sm" variant="secondary" onClick={onClose}>
            {tx({ en: 'Close', hi: 'बंद करें' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
