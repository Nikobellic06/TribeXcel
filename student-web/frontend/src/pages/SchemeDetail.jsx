import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Globe,
  BookOpen,
  CheckCircle,
  Award,
  FileText,
  ArrowRight,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import GovHeader from '../components/GovHeader';
import GovFooter from '../components/GovFooter';
import { useAuth } from '../context/AuthContext';

const SCHEME_DATA = {
  nfst: {
    id: 'nfst',
    applyStatus: 'ACTIVE',
    icon: GraduationCap,
    nameEN: 'National Fellowship for Scheduled Tribe Students',
    nameHI: 'राष्ट्रीय अनुसूचित जनजाति अध्येतावृत्ति',
    overviewEN:
      'The National Fellowship for Scheduled Tribe (ST) Students supports ST candidates pursuing M.Phil, integrated M.Phil+Ph.D, and Ph.D programmes at recognised Indian universities and institutions.',
    overviewHI:
      'राष्ट्रीय अनुसूचित जनजाति अध्येतावृत्ति योजना अनुसूचित जनजाति (एसटी) के छात्रों को मान्यता प्राप्त भारतीय विश्वविद्यालयों और संस्थानों में एम.फिल, एकीकृत एम.फिल+पीएच.डी, तथा पीएच.डी कार्यक्रमों में सहायता प्रदान करती है।',
    eligibilityEN: [
      'Belongs to a notified Scheduled Tribe',
      'Secured admission in M.Phil / Integrated M.Phil+Ph.D / Ph.D at a recognised institution',
      'Meets the income and academic criteria prescribed by the scheme',
    ],
    eligibilityHI: [
      'अधिसूचित अनुसूचित जनजाति से संबंधित हो',
      'मान्यता प्राप्त संस्थान में एम.फिल / एकीकृत एम.फिल+पीएच.डी / पीएच.डी में प्रवेश प्राप्त हो',
      'योजना द्वारा निर्धारित आय एवं शैक्षणिक मानदंडों को पूरा करता हो',
    ],
    benefitsEN: [
      'Monthly fellowship for the approved duration of the course',
      'Contingency and HRA support as per scheme norms',
      'Coverage for the full research/study period, subject to renewal',
    ],
    benefitsHI: [
      'पाठ्यक्रम की स्वीकृत अवधि हेतु मासिक अध्येतावृत्ति',
      'योजना मानदंडों के अनुसार आकस्मिकता एवं मकान किराया भत्ता सहायता',
      'नवीनीकरण के अधीन, पूर्ण शोध/अध्ययन अवधि हेतु कवरेज',
    ],
    documents: [
      'Caste Certificate',
      'Income Certificate',
      'Latest Marksheet',
      'Admission Letter',
    ],
    documentsHI: [
      'जाति प्रमाण पत्र',
      'आय प्रमाण पत्र',
      'नवीनतम अंकपत्र',
      'प्रवेश पत्र',
    ],
  },
  nos: {
    id: 'nos',
    applyStatus: 'ACTIVE',
    icon: Globe,
    nameEN: 'National Overseas Scholarship',
    nameHI: 'राष्ट्रीय विदेश छात्रवृत्ति',
    overviewEN:
      'The National Overseas Scholarship enables selected ST students to pursue Post-Graduate and Ph.D. level courses at recognised overseas institutions, with financial assistance covering major study expenses abroad.',
    overviewHI:
      'राष्ट्रीय विदेश छात्रवृत्ति योजना चयनित अनुसूचित जनजाति छात्रों को मान्यता प्राप्त विदेशी संस्थानों में स्नातकोत्तर एवं पीएच.डी स्तर के पाठ्यक्रम करने हेतु सक्षम बनाती है, जिसमें विदेश में अध्ययन के प्रमुख खर्चों हेतु वित्तीय सहायता शामिल है।',
    eligibilityEN: [
      'Belongs to a notified Scheduled Tribe',
      'Secured admission in a recognised overseas institution for PG or Ph.D.',
      'Meets the age, income and academic criteria prescribed by the scheme',
    ],
    eligibilityHI: [
      'अधिसूचित अनुसूचित जनजाति से संबंधित हो',
      'स्नातकोत्तर या पीएच.डी हेतु मान्यता प्राप्त विदेशी संस्थान में प्रवेश प्राप्त हो',
      'योजना द्वारा निर्धारित आयु, आय एवं शैक्षणिक मानदंडों को पूरा करता हो',
    ],
    benefitsEN: [
      'Financial assistance towards tuition fees, living expenses and travel',
      'Annual selection through a defined merit process',
      'Support for the approved duration of the overseas course',
    ],
    benefitsHI: [
      'शिक्षण शुल्क, निर्वाह व्यय एवं यात्रा हेतु वित्तीय सहायता',
      'निर्धारित मेरिट प्रक्रिया के माध्यम से वार्षिक चयन',
      'विदेशी पाठ्यक्रम की स्वीकृत अवधि हेतु सहायता',
    ],
    documents: [
      'Caste Certificate',
      'Income Certificate',
      'Latest Marksheet',
      'Admission Letter',
    ],
    documentsHI: [
      'जाति प्रमाण पत्र',
      'आय प्रमाण पत्र',
      'नवीनतम अंकपत्र',
      'प्रवेश पत्र',
    ],
  },
  'pre-matric': {
    id: 'pre-matric',
    applyStatus: 'COMING_SOON',
    icon: BookOpen,
    nameEN: 'Pre-Matric Scholarship for ST Students',
    nameHI: 'अनुसूचित जनजाति मैट्रिक-पूर्व छात्रवृत्ति',
    overviewEN:
      'The Pre-Matric Scholarship for ST Students supports Scheduled Tribe students studying in Classes IX and X, aiming to reduce the dropout rate before matriculation and encourage continued schooling.',
    overviewHI:
      'अनुसूचित जनजाति छात्रों हेतु मैट्रिक-पूर्व छात्रवृत्ति योजना कक्षा IX एवं X में अध्ययनरत अनुसूचित जनजाति छात्रों को सहायता प्रदान करती है, जिसका उद्देश्य मैट्रिकुलेशन से पूर्व विद्यालय छोड़ने की दर को कम करना तथा निरंतर शिक्षा को प्रोत्साहित करना है।',
    eligibilityEN: [
      'Belongs to a notified Scheduled Tribe',
      'Currently enrolled in Class IX or Class X at a recognised school',
      'Family income within the limit prescribed by the scheme',
    ],
    eligibilityHI: [
      'अधिसूचित अनुसूचित जनजाति से संबंधित हो',
      'मान्यता प्राप्त विद्यालय में कक्षा IX या कक्षा X में अध्ययनरत हो',
      'पारिवारिक आय योजना द्वारा निर्धारित सीमा के भीतर हो',
    ],
    benefitsEN: [
      'Annual scholarship amount to support school-related expenses',
      'Additional support for hostellers, as per scheme norms',
      'Aimed at improving retention through Classes IX-X',
    ],
    benefitsHI: [
      'विद्यालय संबंधी खर्चों हेतु वार्षिक छात्रवृत्ति राशि',
      'योजना मानदंडों के अनुसार छात्रावासी छात्रों हेतु अतिरिक्त सहायता',
      'कक्षा IX-X तक ठहराव सुधारने पर केंद्रित',
    ],
    documents: [
      'Caste Certificate',
      'Income Certificate',
      'School Bonafide Certificate',
    ],
    documentsHI: [
      'जाति प्रमाण पत्र',
      'आय प्रमाण पत्र',
      'विद्यालय बोनाफाइड प्रमाण पत्र',
    ],
  },
};

const processSteps = {
  en: [
    'Register on this portal using your email and roll number',
    'Select this scheme and complete the application form',
    'Upload required documents (manually or via DigiLocker)',
    'Track your application status from your dashboard',
  ],
  hi: [
    'इस पोर्टल पर अपने ईमेल एवं रोल नंबर से पंजीकरण करें',
    'इस योजना का चयन करें और आवेदन फॉर्म पूर्ण करें',
    'आवश्यक दस्तावेज़ अपलोड करें (मैन्युअल रूप से या डिजिलॉकर के माध्यम से)',
    'अपने डैशबोर्ड से आवेदन की स्थिति ट्रैक करें',
  ],
};

const SchemeDetail = () => {
  const { schemeId } = useParams();
  const auth = useAuth();
  const student = auth?.student;
  const [lang, setLang] = useState('en');

  const scheme = SCHEME_DATA[schemeId];
  const isHindi = lang === 'hi';

  if (!scheme) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f7fa] font-sans">
        <GovHeader activeLang={lang} onToggleLang={() => setLang(l => l === 'en' ? 'hi' : 'en')} />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md w-full text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="font-serif text-[22px] font-bold text-[#1c2b3a] mb-2">
              Scheme not found
            </h2>
            <p className="text-[14px] text-gray-600 mb-6">
              The requested scholarship scheme does not exist or has been removed.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-[#1a3557] text-white text-[14px] font-semibold px-6 py-2.5 rounded-md hover:bg-[#102540] transition-colors"
            >
              Return to Landing Page
            </Link>
          </div>
        </main>
        <GovFooter activeLang={lang} />
      </div>
    );
  }

  const SchemeIcon = scheme.icon;
  const eligibilityList = isHindi ? scheme.eligibilityHI : scheme.eligibilityEN;
  const benefitsList = isHindi ? scheme.benefitsHI : scheme.benefitsEN;
  const documentsList = isHindi ? scheme.documentsHI : scheme.documents;
  const stepsList = processSteps[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa] font-sans text-gray-800">
      <GovHeader activeLang={lang} onToggleLang={() => setLang(l => l === 'en' ? 'hi' : 'en')} />

      {/* a) Slim breadcrumb row */}
      <div className="px-6 py-3 bg-[#f8fafc] border-b border-gray-200 text-[12px] text-[#6b7a8d]">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Link to="/" className="hover:underline hover:text-[#1a3557]">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <a href="/#available-schemes" className="hover:underline hover:text-[#1a3557]">
            Available Schemes
          </a>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-[#1a3557] font-medium">{scheme.nameEN}</span>
        </div>
      </div>

      <main id="main-content" className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* b) HEADER BLOCK */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs relative">
            {/* Top-right language toggle pills */}
            <div className="absolute top-6 right-6 flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  lang === 'en'
                    ? 'bg-[#1a3557] text-white shadow-xs'
                    : 'bg-white border border-gray-300 text-[#4b5563] hover:bg-gray-50'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  lang === 'hi'
                    ? 'bg-[#1a3557] text-white shadow-xs'
                    : 'bg-white border border-gray-300 text-[#4b5563] hover:bg-gray-50'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Scheme Icon */}
            <div className="w-14 h-14 rounded-full bg-[#1a3557]/10 flex items-center justify-center text-[#1a3557] mb-4">
              <SchemeIcon className="w-7 h-7" />
            </div>

            {/* Scheme Name in BOTH languages always */}
            <h1 className="font-serif text-[24px] sm:text-[28px] font-bold text-[#1a3557] leading-tight mb-1">
              {scheme.nameEN}
            </h1>
            <p
              className="text-[16px] sm:text-[17px] text-[#4b5563] font-semibold mb-4"
              style={{ fontFamily: "'Noto Sans Devanagari', serif" }}
            >
              {scheme.nameHI}
            </p>

            {/* Eligibility Pill */}
            <div>
              <span className="inline-block text-[12px] font-medium text-[#16a34a] bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                Scheduled Tribe Students
              </span>
            </div>
          </div>

          {/* c) OVERVIEW SECTION */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-[18px] sm:text-[20px] font-bold text-[#1a3557] mb-3 border-b border-gray-200 pb-2">
              {isHindi ? 'अवलोकन' : 'Overview'}
            </h2>
            <p className="text-[14px] text-[#374151] leading-relaxed text-justify">
              {isHindi ? scheme.overviewHI : scheme.overviewEN}
            </p>
          </section>

          {/* d) TWO-COLUMN SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Eligibility Criteria Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
              <h3 className="font-serif text-[17px] font-bold text-[#1a3557] mb-4 border-b border-gray-100 pb-2">
                {isHindi ? 'पात्रता मानदंड' : 'Eligibility Criteria'}
              </h3>
              <ul className="space-y-3">
                {eligibilityList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[14px] text-[#374151] leading-normal">
                    <CheckCircle className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
              <h3 className="font-serif text-[17px] font-bold text-[#1a3557] mb-4 border-b border-gray-100 pb-2">
                {isHindi ? 'लाभ' : 'Benefits'}
              </h3>
              <ul className="space-y-3">
                {benefitsList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[14px] text-[#374151] leading-normal">
                    <Award className="w-4 h-4 text-[#1a3557] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* e) DOCUMENTS REQUIRED SECTION */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-[18px] font-bold text-[#1a3557] mb-4 border-b border-gray-200 pb-2">
              {isHindi ? 'आवश्यक दस्तावेज़' : 'Documents Required'}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {documentsList.map((doc, idx) => (
                <span
                  key={idx}
                  className="bg-[#eef2f7] text-[#1a3557] text-[13px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium border border-blue-100"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1a3557]" />
                  {doc}
                </span>
              ))}
            </div>
          </section>

          {/* f) APPLICATION PROCESS SECTION */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-[18px] font-bold text-[#1a3557] mb-6 border-b border-gray-200 pb-2">
              {isHindi ? 'आवेदन प्रक्रिया' : 'Application Process'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stepsList.map((stepText, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8fafc] border border-[#dde1e7] rounded-xl p-5 flex flex-col items-center text-center shadow-2xs"
                >
                  <span className="text-[11px] font-bold text-[#1a3557] bg-white px-2.5 py-1 rounded-full border border-[#dde1e7] mb-3">
                    {isHindi ? `चरण 0${idx + 1}` : `Step 0${idx + 1}`}
                  </span>
                  <p className="text-[13px] text-[#374151] leading-relaxed font-medium">
                    {stepText}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* g) CTA BUTTON SECTION */}
          <div className="text-center pt-6 pb-4 border-t border-gray-200">
            {scheme.applyStatus === 'ACTIVE' ? (
              student ? (
                <Link
                  to={`/apply/${scheme.id}`}
                  className="inline-flex items-center gap-2 bg-[#1a3557] hover:bg-[#102540] text-white text-[15px] font-semibold px-8 py-3.5 rounded-lg shadow-sm transition-colors"
                >
                  {isHindi ? 'आवेदन जारी रखें' : 'Continue to Application'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-[#1a3557] hover:bg-[#102540] text-white text-[15px] font-semibold px-8 py-3.5 rounded-lg shadow-sm transition-colors"
                >
                  {isHindi ? 'आवेदन करने के लिए साइन अप करें' : 'Sign Up to Apply'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )
            ) : (
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  disabled
                  className="bg-gray-200 text-gray-500 font-semibold px-8 py-3.5 rounded-lg cursor-not-allowed border border-gray-300 text-[15px]"
                >
                  {isHindi ? 'आवेदन शीघ्र ही खुल रहे हैं' : 'Applications Opening Soon'}
                </button>
                <p className="text-[12px] text-[#6b7a8d] text-center mt-2.5">
                  {isHindi
                    ? 'यह योजना अभी इस पोर्टल के माध्यम से आवेदन स्वीकार नहीं कर रही है।'
                    : 'This scheme is not yet accepting applications through this portal.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <GovFooter activeLang={lang} />
    </div>
  );
};

export default SchemeDetail;
