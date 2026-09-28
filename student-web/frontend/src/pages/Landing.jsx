import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  ShieldCheck,
  Award,
  ArrowRight,
  GraduationCap,
  Globe,
  BookOpen,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Building,
  Users,
  FileCheck2,
} from 'lucide-react';
import GovHeader from '../components/GovHeader';
import GovFooter from '../components/GovFooter';
import EligibilityCheckerModal from '../components/EligibilityCheckerModal';
import { useLang } from '../i18n/LanguageContext';

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { isHindi } = useLang();

  // Auto-advance hero carousel every 5000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const slides = [
    {
      kicker: isHindi ? 'भारत सरकार की पहल' : 'GOVERNMENT OF INDIA INITIATIVE',
      heading: isHindi
        ? 'मैट्रिक-पूर्व, NFST एवं NOS छात्रवृत्ति के लिए ऑनलाइन आवेदन करें'
        : 'Apply Online for Pre-Matric, NFST & NOS Scholarships',
      subtext: isHindi
        ? 'एक बार पंजीकरण करें, आवेदन प्रस्तुत करें, दस्तावेज अपलोड करें और अपनी स्थिति ट्रैक करें - जनजातीय शिक्षा के लिए एक आधिकारिक पोर्टल।'
        : 'Register once, submit your application, upload documents, and track your status — all in one official portal for Tribal Education.',
      buttonText: isHindi ? 'प्रारंभ करें' : 'Get Started',
      buttonLink: '/signup',
      Icon: GraduationCap,
    },
    {
      kicker: isHindi ? 'अनुसूचित जनजाति के छात्रों का सशक्तिकरण' : 'EMPOWERING ST STUDENTS NATIONWIDE',
      heading: isHindi
        ? 'राष्ट्रव्यापी जनजातीय छात्रों के लिए शिक्षा तक पहुंच को सरल बनाना'
        : 'Simplifying Access to Education for Tribal Students Nationwide',
      subtext: isHindi
        ? 'सुगम डिजिटल आवेदन, स्वचालित सत्यापन और प्रत्यक्ष फेलोशिप सहायता के माध्यम से अनुसूचित जनजाति के छात्रों को सशक्त बनाना।'
        : 'Empowering Scheduled Tribe students through seamless digital applications, automated verification, and direct fellowship support.',
      buttonText: isHindi ? 'योजना के बारे में जानें' : 'Learn About the Scheme',
      buttonAnchor: '#about-scheme',
      Icon: BookOpen,
    },
    {
      kicker: isHindi ? 'पारदर्शी एवं डिजिटल शासन' : 'TRANSPARENT & DIGITIZED GOVERNANCE',
      heading: isHindi
        ? 'अपने आवेदन को वास्तविक समय में ट्रैक करें — सबमिशन से चयन तक'
        : 'Track Your Application in Real Time — From Submission to Selection',
      subtext: isHindi
        ? 'त्वरित स्थिति ट्रैकिंग, डिजिलॉकर प्रमाणीकरण और समर्पित हेल्पलाइन सहायता के साथ पूर्ण पारदर्शी प्रक्रिया।'
        : 'Complete end-to-end transparency with instant status tracking, DigiLocker authentication, and dedicated helpdesk support.',
      buttonText: isHindi ? 'प्रारंभ करें' : 'Get Started',
      buttonLink: '/signup',
      Icon: ClipboardCheck,
    },
  ];

  const notices = isHindi
    ? [
        'शैक्षणिक वर्ष 2026-27 के लिए आवेदन खुले हैं',
        'डिजिलॉकर उपयोगकर्ताओं के लिए दस्तावेज़ सत्यापन दिशानिर्देश अद्यतन किए गए हैं',
        'एम.फिल / पीएच.डी उम्मीदवारों के लिए मेरिट सूची प्रकाशन अनुसूची घोषित',
        'हेल्पडेस्क सहायता सोमवार से शुक्रवार (प्रातः 9:00 से शाम 5:30) उपलब्ध है',
      ]
    : [
        'Applications open for the 2026-27 academic year',
        'Document verification guidelines updated for DigiLocker users',
        'Merit list publication schedule announced for M.Phil / Ph.D candidates',
        'Helpdesk support available Monday to Friday (9:00 AM to 5:30 PM)',
      ];

  const newsItems = isHindi
    ? [
        '2026-27 आवेदन चक्र के संबंध में सूचना जारी',
        'दस्तावेज़ सत्यापन के लिए दिशानिर्देश प्रकाशित किए गए',
        'नए प्रश्नों के साथ एफएक्यू अनुभाग को अद्यतन किया गया',
        'हेल्पडेस्क संपर्क विवरण संशोधित किए गए',
        'पोर्टल रखरखाव अनुसूची की घोषणा की गई',
        'योजना पात्रता मानदंड स्पष्ट किए गए',
      ]
    : [
        'Notice regarding the 2026-27 application cycle',
        'Guidelines for document verification published',
        'FAQ section updated with new questions',
        'Helpdesk contact details revised',
        'Portal maintenance schedule announced',
        'Scheme eligibility criteria clarified',
      ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa] font-sans text-gray-800">
      {/* GovHeader Component */}
      <GovHeader />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {/* 3. HERO CAROUSEL */}
        <section className="relative w-full h-[420px] md:h-[460px] bg-[#eef2f7] overflow-hidden flex items-center border-b border-gray-200">
          {slides.map((slide, index) => {
            const WatermarkIcon = slide.Icon;
            const isActive = index === currentSlide;
            return (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-between px-6 sm:px-12 md:px-16 max-w-6xl mx-auto w-full ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Left Text Content */}
                <div className="max-w-2xl z-20 py-8">
                  <span className="text-[11px] sm:text-[12px] font-bold text-[#1a3557] tracking-wider uppercase block mb-2">
                    {slide.kicker}
                  </span>
                  <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[36px] font-bold text-[#1c2b3a] leading-tight mb-3">
                    {slide.heading}
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-[#4b5563] mb-6 leading-relaxed max-w-xl">
                    {slide.subtext}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="#available-schemes"
                      className="inline-flex items-center gap-2 bg-[#1a3557] hover:bg-[#102540] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm"
                    >
                      {isHindi ? 'योजनाएं देखें' : 'Explore Schemes'}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setEligibilityOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-[#fef3c7] border border-[#d97706] text-[#92400e] hover:bg-[#fde68a] text-[13.5px] font-bold px-4 py-2.5 rounded-md transition-colors shadow-2xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#b45309]" />
                      {isHindi ? 'पात्रता जांचें' : 'Check Eligibility'}
                    </button>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-1.5 border border-line bg-white hover:bg-paper text-ink text-[13.5px] font-semibold px-4 py-2.5 rounded-md transition-colors shadow-2xs"
                    >
                      {isHindi ? 'नया पंजीकरण' : 'Register'}
                    </Link>
                  </div>
                </div>

                {/* Right Decorative Watermark Graphic */}
                <div className="hidden md:flex items-center justify-center shrink-0 pr-8">
                  <div className="relative flex items-center justify-center w-64 h-64">
                    <div className="absolute inset-0 rounded-full bg-[#1a3557]/5 animate-pulse" />
                    <WatermarkIcon className="w-40 h-40 text-[#1a3557] opacity-15" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1a3557] hidden sm:flex items-center justify-center shadow-md border border-gray-200 transition-colors focus:outline-none"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1a3557] hidden sm:flex items-center justify-center shadow-md border border-gray-200 transition-colors focus:outline-none"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                  idx === currentSlide ? 'w-7 bg-[#1a3557]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Jump to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* 4. SCROLLING NOTICE TICKER */}
        <section className="w-full bg-[#dbeafe] border-y border-[#93c5fd] h-10 overflow-hidden flex items-center relative z-10">
          <div className="flex items-center pl-4 pr-3 py-1 bg-[#dbeafe] z-20 shrink-0">
            <span className="bg-[#1a3557] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              {isHindi ? 'सूचनाएं' : 'NOTICES'}
            </span>
          </div>
          <div className="overflow-hidden w-full flex items-center">
            <div className="animate-marquee flex items-center whitespace-nowrap gap-8 text-[13px] text-[#1a3557] font-medium">
              {[...notices, ...notices].map((notice, idx) => (
                <span key={idx} className="flex items-center gap-3">
                  <span>{notice}</span>
                  <span className="text-blue-400 font-bold">•</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 5. ABOUT THE SCHEME SECTION & MINISTERS */}
        <section id="about-scheme" className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs mb-6">
            <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
              {isHindi ? 'मंत्रालय एवं योजना के बारे में' : 'About the Ministry & Scheme'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Left 3 columns: Main prose and Key Objectives */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-4">
                <h3 className="font-serif text-[17px] font-bold text-[#1a3557] border-b border-gray-200 pb-1.5">
                  {isHindi ? 'मंत्रालय के बारे में' : 'About The Ministry'}
                </h3>
                <p className="text-justify text-[14px] text-[#374151] leading-relaxed">
                  {isHindi
                    ? 'जनजातीय कार्य मंत्रालय की स्थापना 1999 में सामाजिक न्याय और अधिकारिता मंत्रालय के विभाजन के बाद अनुसूचित जनजातियों (ST) के एकीकृत सामाजिक-आर्थिक विकास पर अधिक केंद्रित दृष्टिकोण प्रदान करने के उद्देश्य से की गई थी। मंत्रालय के कार्यक्रम और योजनाएं वित्तीय सहायता के माध्यम से एसटी की स्थिति को ध्यान में रखते हुए अन्य केंद्रीय मंत्रालयों, राज्य सरकारों का समर्थन करने और संस्थानों में महत्वपूर्ण अंतर को भरने के लिए हैं।'
                    : 'The Ministry of Tribal Affairs was set up in 1999 after the bifurcation of Ministry of Social Justice and Empowerment with the objective of providing a more focused approach on the integrated socio-economic development of the Scheduled Tribes (STs). The programmes and schemes of the Ministry are intended to support and supplement other Central Ministries, State Governments and fill critical gaps in institutions.'}
                </p>

                <h3 className="font-serif text-[17px] font-bold text-[#1a3557] border-b border-gray-200 pb-1.5 pt-2">
                  {isHindi ? 'राष्ट्रीय फेलोशिप योजना एवं पोर्टल के बारे में' : 'About The National Fellowship Scheme & Portal'}
                </h3>
                <p className="text-justify text-[14px] text-[#374151] leading-relaxed">
                  {isHindi
                    ? 'राष्ट्रीय फेलोशिप एवं छात्रवृत्ति पोर्टल जनजातीय कार्य मंत्रालय की एक प्रमुख पहल है। हर साल 750 नए एसटी छात्रों को भारतीय विश्वविद्यालयों में एम.फिल. और पीएच.डी. पाठ्यक्रमों के लिए फेलोशिप प्रदान की जाती है। यह पोर्टल डिजिलॉकर से एकीकृत है और पारदर्शी डिजिटल सत्यापन प्रक्रिया प्रदान करता है।'
                    : 'The National Fellowship & Scholarship Portal is a major Central Sector initiative of Ministry of Tribal Affairs. Every year 750 fresh ST students are awarded fellowship for pursuing M.Phil. and Ph.D. courses in Indian Universities. The portal is integrated with DigiLocker for instant credential validation and automated verification.'}
                </p>
              </div>

              {/* Key Objectives Box */}
              <div className="bg-[#f8fafc] border border-gray-200 rounded-lg p-5 shadow-xs">
                <h4 className="font-serif font-bold text-[15px] text-[#1a3557] border-b border-gray-200 pb-2 mb-3">
                  {isHindi ? 'मुख्य उद्देश्य' : 'Key Objectives'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] text-[#374151]">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#1a3557] shrink-0 mt-0.5" />
                    <span>{isHindi ? 'आवेदन प्रसंस्करण समय कम करें' : 'Reduce processing time'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#1a3557] shrink-0 mt-0.5" />
                    <span>{isHindi ? 'पारदर्शी मेरिट चयन सुनिश्चित करें' : 'Ensure transparent selection'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#1a3557] shrink-0 mt-0.5" />
                    <span>{isHindi ? 'डिजिटल-प्रथम पहुंच सक्षम करें' : 'Enable digital-first access'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#1a3557] shrink-0 mt-0.5" />
                    <span>{isHindi ? 'निर्णयों पर मानवीय निगरानी बनाए रखें' : 'Maintain human oversight on decisions'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 column: OFFICIAL MINISTERS PHOTOS (Exact layout like fellowship.tribal.gov.in) */}
            <div className="lg:col-span-1 space-y-6 flex flex-col items-center">
              {/* Minister 1: Sh. Jual Oram */}
              <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm text-center w-full max-w-[200px]">
                <img
                  src="/minister_jual_oram.png"
                  alt="Sh. Jual Oram - Hon'ble Minister"
                  className="w-full h-auto rounded border border-gray-100 object-cover mx-auto"
                />
                <div className="mt-2.5">
                  <span className="font-bold text-[14px] text-[#1c2b3a] block leading-tight">
                    {isHindi ? 'श्री जुएल ओराम' : 'Sh. Jual Oram'}
                  </span>
                  <span className="text-[12px] text-gray-600 block mt-0.5 font-medium">
                    {isHindi ? 'माननीय मंत्री' : "Hon'ble Minister"}
                  </span>
                </div>
              </div>

              {/* Minister 2: Sh. Durgadas Uikey */}
              <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm text-center w-full max-w-[200px]">
                <img
                  src="/minister_durgadas_uikey.png"
                  alt="Sh. Durgadas Uikey - Hon'ble MoS"
                  className="w-full h-auto rounded border border-gray-100 object-cover mx-auto"
                />
                <div className="mt-2.5">
                  <span className="font-bold text-[14px] text-[#1c2b3a] block leading-tight">
                    {isHindi ? 'श्री दुर्गादास उइके' : 'Sh. Durgadas Uikey'}
                  </span>
                  <span className="text-[12px] text-gray-600 block mt-0.5 font-medium">
                    {isHindi ? 'माननीय राज्य मंत्री' : "Hon'ble MoS"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ABOUT THE DIGITAL PORTAL SECTION */}
        <section id="about-portal" className="py-10 px-4 sm:px-6 max-w-6xl mx-auto border-t border-gray-200/80">
          <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs mb-4">
            <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
              {isHindi ? 'डिजिटल पोर्टल के बारे में' : 'About the Digital Portal'}
            </h2>
          </div>
          <p className="text-justify text-[14px] text-[#374151] leading-relaxed bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
            {isHindi
              ? 'यह डिजिटल पोर्टल प्रोटोटाइप स्मार्ट इंडिया हैकाथॉन 2026 के समस्या विवरण SIH26239 के तहत डिज़ाइन और विकसित किया गया था। उच्च-दक्षता छात्रवृत्ति जीवनचक्र प्रबंधन को प्रदर्शित करने के लिए निर्मित, पोर्टल डिजिलॉकर एपीआई मानकों, स्वचालित दस्तावेज़ सत्यापन वर्कफ़्लो और वेब और मोबाइल इंटरफेस के माध्यम से वास्तविक समय की स्थिति ट्रैकिंग को एकीकृत करता है। कृपया ध्यान दें कि यह प्रणाली जनजातीय शिक्षा के लिए आधुनिक डिजिटल गवर्नेंस क्षमताओं को प्रदर्शित करने के लिए टीम TribeXcel द्वारा बनाई गई एक आधिकारिक हैकाथॉन प्रदर्शन प्रोटोटाइप के रूप में कार्य करती है।'
              : 'This digital portal prototype was designed and developed as part of Smart India Hackathon 2026 for Problem Statement SIH26239. Built to demonstrate high-efficiency scholarship lifecycle management, the portal integrates DigiLocker API standards, automated document validation workflows, and real-time status tracking via web and mobile interfaces. Please note that this system functions as an official hackathon demonstration prototype created by Team TribeXcel to showcase modern digital governance capabilities for tribal education.'}
          </p>
        </section>

        {/* 7. NEWS & UPDATES WIDGET */}
        <section id="news-updates" className="py-10 px-4 sm:px-6 max-w-6xl mx-auto border-t border-gray-200/80">
          <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs mb-4">
            <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
              {isHindi ? 'समाचार और अपडेट' : 'News & Updates'}
            </h2>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100 shadow-xs">
            {newsItems.map((item, idx) => (
              <div
                key={idx}
                className="py-3 px-4 flex items-start gap-3 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-[#1a3557] mt-0.5 shrink-0" />
                <a href="#" className="text-[13px] text-[#1a3557] hover:underline font-medium">
                  {item}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 8. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-t border-gray-200/80">
          <div className="text-center mb-10">
            <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs">
              <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
                {isHindi ? 'यह कैसे काम करता है' : 'How It Works'}
              </h2>
            </div>
            <p className="text-[14px] text-[#6b7a8d] mt-2">
              {isHindi ? 'अपनी फेलोशिप या छात्रवृत्ति प्राप्त करने की सरल 3-चरण प्रक्रिया' : 'Simple 3-step process to get your fellowship or scholarship'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#1a3557]/10 flex items-center justify-center text-[#1a3557] mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-bold text-[#1a3557] bg-[#f5f7fa] px-2.5 py-1 rounded-full border border-[#dde1e7] mb-2">
                {isHindi ? 'चरण 01' : 'Step 01'}
              </span>
              <h3 className="font-serif text-[17px] font-semibold text-[#1c2b3a] mb-2">
                {isHindi ? 'पंजीकरण और आवेदन करें' : 'Register & Apply'}
              </h3>
              <p className="text-[14px] text-[#6b7a8d] leading-relaxed">
                {isHindi
                  ? 'मूल विवरण के साथ अपनी छात्र प्रोफ़ाइल बनाएं और आवेदन शुरू करने के लिए अपनी पात्र योजना चुनें।'
                  : 'Create your student profile with basic details and choose your eligible scheme to start your application.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#1a3557]/10 flex items-center justify-center text-[#1a3557] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-bold text-[#1a3557] bg-[#f5f7fa] px-2.5 py-1 rounded-full border border-[#dde1e7] mb-2">
                {isHindi ? 'चरण 02' : 'Step 02'}
              </span>
              <h3 className="font-serif text-[17px] font-semibold text-[#1c2b3a] mb-2">
                {isHindi ? 'सत्यापित हों' : 'Get Verified'}
              </h3>
              <p className="text-[14px] text-[#6b7a8d] leading-relaxed">
                {isHindi
                  ? 'हमारी प्रणाली डिजिलॉकर के माध्यम से सुगम और पारदर्शी सत्यापन के लिए आपके दस्तावेजों की स्वचालित रूप से जांच करती है।'
                  : 'Our system checks your documents automatically via DigiLocker for seamless and transparent verification.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#1a3557]/10 flex items-center justify-center text-[#1a3557] mb-4">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-bold text-[#1a3557] bg-[#f5f7fa] px-2.5 py-1 rounded-full border border-[#dde1e7] mb-2">
                {isHindi ? 'चरण 03' : 'Step 03'}
              </span>
              <h3 className="font-serif text-[17px] font-semibold text-[#1c2b3a] mb-2">
                {isHindi ? 'चयनित हों' : 'Get Selected'}
              </h3>
              <p className="text-[14px] text-[#6b7a8d] leading-relaxed">
                {isHindi
                  ? 'अपनी स्थिति ऑनलाइन ट्रैक करें, स्वचालित सूचनाएं प्राप्त करें और प्रत्यक्ष फेलोशिप संवितरण सहायता प्राप्त करें।'
                  : 'Track your status online, receive automated notifications, and obtain direct fellowship disbursement support.'}
              </p>
            </div>
          </div>
        </section>

        {/* 9. AVAILABLE SCHEMES SECTION */}
        <section id="available-schemes" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-t border-gray-200/80">
          <div className="text-center mb-10">
            <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs">
              <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
                {isHindi ? 'उपलब्ध योजनाएं' : 'Available Schemes'}
              </h2>
            </div>
            <p className="text-[14px] text-[#6b7a8d] mt-2">
              {isHindi ? 'एसटी छात्रों के लिए मैट्रिक-पूर्व छात्रवृत्ति, राष्ट्रीय फेलोशिप और विदेश छात्रवृत्ति' : 'Pre-matric scholarship, national fellowship and overseas scholarship for ST students'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scheme 1: NFST */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-[17px] font-semibold text-[#1c2b3a]">
                      {isHindi ? 'NFST योजना' : 'NFST Scheme'}
                    </h3>
                    <span className="inline-block text-[12px] font-medium text-[#16a34a] bg-green-50 border border-green-200 px-2 py-0.5 rounded mt-0.5">
                      {isHindi ? 'अनुसूचित जनजाति के छात्र' : 'Scheduled Tribe Students'}
                    </span>
                  </div>
                </div>
                <p className="text-[14px] text-[#6b7a8d] leading-relaxed mb-4">
                  {isHindi
                    ? 'भारतीय विश्वविद्यालयों और संस्थानों में एम.फिल. और पीएच.डी. डिग्री प्राप्त करने वाले अनुसूचित जनजाति के छात्रों के लिए राष्ट्रीय फेलोशिप।'
                    : 'National Fellowship for Higher Education of ST Students pursuing M.Phil. and Ph.D. degrees in Indian Universities and Institutions.'}
                </p>
              </div>
              <div className="pt-3 border-t border-[#dde1e7]">
                <Link
                  to="/schemes/nfst"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1a3557] hover:underline"
                >
                  {isHindi ? 'अधिक जानें' : 'Learn More'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Scheme 2: NOS */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-[17px] font-semibold text-[#1c2b3a]">
                      {isHindi ? 'NOS योजना' : 'NOS Scheme'}
                    </h3>
                    <span className="inline-block text-[12px] font-medium text-[#16a34a] bg-green-50 border border-green-200 px-2 py-0.5 rounded mt-0.5">
                      {isHindi ? 'अनुसूचित जनजाति के छात्र' : 'Scheduled Tribe Students'}
                    </span>
                  </div>
                </div>
                <p className="text-[14px] text-[#6b7a8d] leading-relaxed mb-4">
                  {isHindi
                    ? 'विदेशों में पोस्ट ग्रेजुएट और पीएच.डी. पाठ्यक्रमों को आगे बढ़ाने के लिए चयनित एसटी छात्रों को वित्तीय सहायता प्रदान करने वाली राष्ट्रीय विदेशी छात्रवृत्ति।'
                    : 'National Overseas Scholarship providing financial assistance to selected ST students for pursuing Post Graduate and Ph.D. courses abroad.'}
                </p>
              </div>
              <div className="pt-3 border-t border-[#dde1e7]">
                <Link
                  to="/schemes/nos"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1a3557] hover:underline"
                >
                  {isHindi ? 'अधिक जानें' : 'Learn More'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Scheme 3: Pre-Matric */}
            <div className="bg-white border border-[#dde1e7] rounded-xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-[#f5f7fa] border border-[#dde1e7] text-[#1a3557]">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-[17px] font-semibold text-[#1c2b3a]">
                      {isHindi ? 'मैट्रिक-पूर्व छात्रवृत्ति' : 'Pre-Matric Scholarship'}
                    </h3>
                    <span className="inline-block text-[12px] font-medium text-[#16a34a] bg-green-50 border border-green-200 px-2 py-0.5 rounded mt-0.5">
                      {isHindi ? 'अनुसूचित जनजाति के छात्र' : 'Scheduled Tribe Students'}
                    </span>
                  </div>
                </div>
                <p className="text-[14px] text-[#6b7a8d] leading-relaxed mb-4">
                  {isHindi
                    ? 'कक्षा IX और X में अध्ययनरत अनुसूचित जनजाति के छात्रों के लिए वित्तीय सहायता, जिसका उद्देश्य मैट्रिकुलेशन से पहले पढ़ाई छोड़ने की दर को कम करना है।'
                    : 'Financial assistance for Scheduled Tribe students studying in Classes IX and X, aimed at reducing dropout before matriculation.'}
                </p>
              </div>
              <div className="pt-3 border-t border-[#dde1e7]">
                <Link
                  to="/schemes/pre-matric"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1a3557] hover:underline"
                >
                  {isHindi ? 'अधिक जानें' : 'Learn More'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 10. WHO CAN APPLY SECTION */}
        <section id="who-can-apply" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-t border-gray-200/80">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs">
              <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
                {isHindi ? 'कौन आवेदन कर सकता है?' : 'Who Can Apply?'}
              </h2>
            </div>
            <p className="text-[14px] text-[#6b7a8d] mt-2">
              {isHindi ? 'जनजातीय कार्य मंत्रालय की योजनाओं हेतु सामान्य पात्रता मानदंड' : 'General statutory eligibility criteria across Ministry of Tribal Affairs schemes'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-line bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-soft text-navy mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-[15px] font-bold text-ink mb-1.5">
                {isHindi ? 'अनुसूचित जनजाति (ST) पहचान' : 'Scheduled Tribe (ST)'}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                {isHindi
                  ? 'उम्मीदवार को भारत के संविधान के अनुच्छेद 342 के तहत अधिसूचित अनुसूचित जनजाति से संबंधित होना चाहिए।'
                  : 'Applicant must belong to a Scheduled Tribe notified under Article 342 of the Constitution of India.'}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-soft text-navy mb-3">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-[15px] font-bold text-ink mb-1.5">
                {isHindi ? 'मान्यता प्राप्त संस्थान' : 'Recognised Institutions'}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                {isHindi
                  ? 'सरकारी या सहायता प्राप्त स्कूल (कक्षा IX/X), यूजीसी-मान्यता प्राप्त विश्वविद्यालय (शोध), या शीर्ष 1000 क्यूएस संस्थान (विदेश)।'
                  : 'Enrolled in Govt/aided schools (Class IX/X), UGC-recognised universities (NFST), or Top 1000 QS ranked universities abroad (NOS).'}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-soft text-navy mb-3">
                <ShieldCheck className="h-5 w-5 text-ochre" />
              </div>
              <h3 className="font-serif text-[15px] font-bold text-ink mb-1.5">
                {isHindi ? 'विशेष प्राथमिकता समूह' : 'Priority Groups (PVTG)'}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                {isHindi
                  ? 'विशेष रूप से कमजोर जनजातीय समूहों (PVTG) और दिव्यांगजन छात्रों हेतु विशेष स्लॉट आरक्षण एवं पात्रता छूट।'
                  : 'Special reservation slots and allowances earmarked for Particularly Vulnerable Tribal Groups (PVTG) and Divyangjan scholars.'}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-soft text-navy mb-3">
                <FileCheck2 className="h-5 w-5 text-leaf" />
              </div>
              <h3 className="font-serif text-[15px] font-bold text-ink mb-1.5">
                {isHindi ? 'पारिवारिक आय सीमा' : 'Income Limits (Where Applicable)'}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                {isHindi
                  ? 'मैट्रिक-पूर्व हेतु ₹2.5 लाख/वर्ष, विदेश छात्रवृत्ति हेतु ₹6.0 लाख/वर्ष। राष्ट्रीय फेलोशिप (NFST) में कोई आय सीमा नहीं है।'
                  : 'Family income up to ₹2.5 Lakh for Pre-Matric, ₹6.0 Lakh for NOS. National Fellowship (NFST) has NO income ceiling.'}
              </p>
            </div>
          </div>
        </section>

        {/* 11. REQUIRED DOCUMENTS SUMMARY TABLE */}
        <section id="required-documents" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-t border-gray-200/80">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs">
              <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
                {isHindi ? 'अनिवार्य दस्तावेज़ चेकलिस्ट' : 'Mandatory Document Checklist'}
              </h2>
            </div>
            <p className="text-[14px] text-[#6b7a8d] mt-2">
              {isHindi ? 'आवेदन शुरू करने से पहले निम्नलिखित प्रमाणपत्र एवं दस्तावेज़ तैयार रखें' : 'Keep the following certificates and documents ready before applying'}
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-line bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-line bg-navy text-white text-[12px] uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">{isHindi ? 'दस्तावेज़' : 'Document'}</th>
                  <th className="px-4 py-3 font-semibold">{isHindi ? 'जारीकर्ता प्राधिकारी' : 'Issuing Authority'}</th>
                  <th className="px-4 py-3 font-semibold">{isHindi ? 'लागू योजना' : 'Applicable Scheme'}</th>
                  <th className="px-4 py-3 font-semibold">{isHindi ? 'डिजिलॉकर' : 'DigiLocker'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                <tr className="hover:bg-paper">
                  <td className="px-4 py-3 font-semibold">Scheduled Tribe (ST) Certificate</td>
                  <td className="px-4 py-3 text-muted">Tehsildar / SDO / District Magistrate</td>
                  <td className="px-4 py-3"><span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy">All Schemes</span></td>
                  <td className="px-4 py-3 text-leaf font-semibold">✓ Supported (CSTCR)</td>
                </tr>
                <tr className="hover:bg-paper">
                  <td className="px-4 py-3 font-semibold">Family Income Certificate</td>
                  <td className="px-4 py-3 text-muted">Competent Revenue Authority (Current FY)</td>
                  <td className="px-4 py-3"><span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Pre-Matric & NOS</span></td>
                  <td className="px-4 py-3 text-leaf font-semibold">✓ Supported (INCER)</td>
                </tr>
                <tr className="hover:bg-paper">
                  <td className="px-4 py-3 font-semibold">Domicile / Residence Certificate</td>
                  <td className="px-4 py-3 text-muted">Circle Officer / Tehsildar / State Portal</td>
                  <td className="px-4 py-3"><span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy">Pre-Matric & NOS</span></td>
                  <td className="px-4 py-3 text-leaf font-semibold">✓ Supported (DOMCR)</td>
                </tr>
                <tr className="hover:bg-paper">
                  <td className="px-4 py-3 font-semibold">Academic Marksheet & Certificates</td>
                  <td className="px-4 py-3 text-muted">Recognised School Board / UGC University</td>
                  <td className="px-4 py-3"><span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy">All Schemes</span></td>
                  <td className="px-4 py-3 text-leaf font-semibold">✓ Class X / Univ Marksheets</td>
                </tr>
                <tr className="hover:bg-paper">
                  <td className="px-4 py-3 font-semibold">Admission Letter / Bonafide Certificate</td>
                  <td className="px-4 py-3 text-muted">Head of School / Registrar of University</td>
                  <td className="px-4 py-3"><span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy">All Schemes</span></td>
                  <td className="px-4 py-3 text-muted font-medium">Institutional Upload (PDF)</td>
                </tr>
                <tr className="hover:bg-paper">
                  <td className="px-4 py-3 font-semibold">Bank Passbook / Proof (Aadhaar Seeded)</td>
                  <td className="px-4 py-3 text-muted">Scheduled Commercial Bank (DBT Active)</td>
                  <td className="px-4 py-3"><span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy">All Schemes</span></td>
                  <td className="px-4 py-3 text-muted font-medium">Bank Account Upload (PDF/JPG)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 12. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
        <section id="faq" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-t border-gray-200/80">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs">
              <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
                {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
              </h2>
            </div>
            <p className="text-[14px] text-[#6b7a8d] mt-2">
              {isHindi ? 'आवेदन प्रक्रिया, सत्यापन और लाभों से जुड़े महत्वपूर्ण उत्तर' : 'Essential answers regarding application rules, verification, and disbursement'}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: isHindi ? 'क्या डिजिलॉकर के बिना भी आवेदन किया जा सकता है?' : 'Can I apply if my certificates are not available on DigiLocker?',
                a: isHindi
                  ? 'हाँ। आप अपने प्रमाणपत्रों की स्पष्ट पीडीएफ अथवा फोटो कॉपी मैन्युअल रूप से अपलोड कर सकते हैं। अपलोड के तुरंत बाद सिस्टम एआई-सहायता प्राप्त प्रारंभिक दस्तावेज़ विश्लेषण करता है ताकि स्पष्टता की जांच हो सके।'
                  : 'Yes. You can manually upload clear PDF or image copies of your certificates. The portal runs real-time AI-assisted document intelligence to extract and validate mandatory fields immediately upon upload.'
              },
              {
                q: isHindi ? 'राष्ट्रीय फेलोशिप (NFST) के लिए क्या कोई पारिवारिक आय सीमा है?' : 'Is there an income ceiling for the National Fellowship (NFST)?',
                a: isHindi
                  ? 'नहीं। राष्ट्रीय फेलोशिप (NFST) योजना के तहत कोई पारिवारिक आय सीमा लागू नहीं होती। चयन विशुद्ध रूप से स्नातकोत्तर (PG) अंकों की मेरिट के आधार पर 750 सीटों के लिए किया जाता है।'
                  : 'No. There is strictly NO income ceiling for the National Fellowship (NFST). Fellowships are awarded on academic merit in Post-Graduation across 750 national slots.'
              },
              {
                q: isHindi ? 'यदि मेरे आवेदन में कोई त्रुटि पाई जाती है तो क्या होगा?' : 'What happens if my application is marked Defective or Correction Required?',
                a: isHindi
                  ? 'आवेदन अस्वीकार नहीं किया जाता। आपको "Correction Required" सूचना प्राप्त होगी जिसमें अधिकारी की टिप्पणी और सुधार के निर्देश होंगे। आप अपने डैशबोर्ड से सीधे त्रुटिपूर्ण दस्तावेज़ बदलकर पुनः जमा कर सकते हैं।'
                  : 'Your application is not rejected. It enters the "Correction Required" state with explicit officer remarks. You can replace the specific defective document and resubmit directly from your student dashboard.'
              },
              {
                q: isHindi ? 'एआई-सहायता प्राप्त दस्तावेज़ सत्यापन का क्या महत्व है?' : 'What role does AI-assisted verification play in the portal?',
                a: isHindi
                  ? 'एआई सत्यापन एक प्रारंभिक तकनीकी सहायता है जो दस्तावेज़ के प्रकार, नाम, आय, और अंकों को स्वचालित रूप से पढ़कर छात्र को त्वरित प्रतिक्रिया देता है। अंतिम निर्णय हमेशा अधिकृत नोडल अधिकारियों द्वारा लिया जाता है।'
                  : 'AI verification performs preliminary optical character extraction, quality checks, and schema matching to assist the student and verify authenticity early. Final statutory authority strictly rests with authorized government nodal officers.'
              },
              {
                q: isHindi ? 'छात्रवृत्ति राशि का भुगतान किस प्रकार किया जाता है?' : 'How is the scholarship amount disbursed to the student?',
                a: isHindi
                  ? 'सभी स्वीकृत छात्रवृत्ति एवं फेलोशिप का भुगतान प्रत्यक्ष लाभ अंतरण (DBT) के माध्यम से सीधे छात्र के आधार-सीडेड बैंक खाते में किया जाता है।'
                  : 'All scholarship and fellowship stipends are disbursed directly to the scholar\'s Aadhaar-seeded bank account through the Public Financial Management System (PFMS) via Direct Benefit Transfer (DBT).'
              }
            ].map((faq, idx) => (
              <div key={idx} className="rounded-lg border border-line bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-serif font-bold text-[14.5px] text-navy hover:bg-paper transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform text-muted ${openFaq === idx ? 'rotate-180 text-navy' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="border-t border-line bg-paper px-4 py-3 text-[13px] leading-relaxed text-[#374151]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 13. HELPDESK & SUPPORT SECTION */}
        <section id="help-support" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-t border-gray-200/80">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-[#dbeafe] to-white px-5 py-2.5 rounded border-l-4 border-[#1a3557] shadow-xs">
              <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1a3557]">
                {isHindi ? 'हेल्पडेस्क एवं तकनीकी सहायता' : 'Helpdesk & Grievance Support'}
              </h2>
            </div>
            <p className="text-[14px] text-[#6b7a8d] mt-2">
              {isHindi ? 'आवेदन या पोर्टल से संबंधित किसी भी सहायता हेतु संपर्क करें' : 'Dedicated support lines for students applying under MoTA schemes'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-3 rounded-lg border border-line bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-soft text-navy">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif text-[14px] font-bold text-ink">
                  {isHindi ? 'राष्ट्रीय टोल-फ्री हेल्पलाइन' : 'National Toll-Free Helpline'}
                </h4>
                <p className="mt-1 font-mono font-bold text-[15px] text-navy">1800-11-7777</p>
                <p className="text-[11.5px] text-muted mt-0.5">
                  {isHindi ? 'सोमवार से शुक्रवार (प्रातः 9:30 से शाम 5:30)' : 'Mon – Fri, 09:30 AM to 05:30 PM (IST)'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-line bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-soft text-navy">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif text-[14px] font-bold text-ink">
                  {isHindi ? 'आधिकारिक सहायता ईमेल' : 'Official Support Desk'}
                </h4>
                <p className="mt-1 font-mono font-bold text-[14px] text-navy">scholarship-mota@gov.in</p>
                <p className="text-[11.5px] text-muted mt-0.5">
                  {isHindi ? 'प्रतिक्रिया समय: 1-2 कार्य दिवस' : 'Expected response time: 24–48 working hours'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-line bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-soft text-navy">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif text-[14px] font-bold text-ink">
                  {isHindi ? 'मंत्रालय नोडल कार्यालय' : 'Ministry Office Location'}
                </h4>
                <p className="mt-1 text-[12.5px] text-ink font-medium">
                  Ministry of Tribal Affairs, Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 14. RESOURCE LINKS ROW */}
        <section id="resources" className="py-8 px-4 sm:px-6 border-t border-gray-200 bg-[#f8fafc] text-center">
          <h3 className="text-[13px] font-bold text-[#6b7a8d] uppercase tracking-wide mb-4">
            {isHindi ? 'संबंधित संसाधन' : 'Related Resources'}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-y-2 text-[13px] text-[#1a3557] font-medium">
            <a href="#" className="hover:underline">
              {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </a>
            <span className="mx-3 text-gray-300">•</span>
            <a href="#" className="hover:underline">
              {isHindi ? 'उपयोग की शर्तें' : 'Terms of Use'}
            </a>
            <span className="mx-3 text-gray-300">•</span>
            <a href="#" className="hover:underline">
              {isHindi ? 'पहुंच वक्तव्य' : 'Accessibility Statement'}
            </a>
            <span className="mx-3 text-gray-300">•</span>
            <a href="#sitemap" className="hover:underline">
              {isHindi ? 'साइटमैप' : 'Sitemap'}
            </a>
            <span className="mx-3 text-gray-300">•</span>
            <a href="#" className="hover:underline">
              {isHindi ? 'आरटीआई' : 'RTI'}
            </a>
            <span className="mx-3 text-gray-300">•</span>
            <a href="#" className="hover:underline">
              {isHindi ? 'शिकायत निवारण' : 'Grievance Redressal'}
            </a>
          </div>
        </section>

        {/* 11. FINAL CTA BAND */}
        <section id="contact" className="bg-[#1a3557] text-white py-12 px-4 text-center border-t border-slate-700">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-[22px] md:text-[26px] font-bold mb-3">
              {isHindi ? 'आवेदन करने के लिए तैयार हैं?' : 'Ready to apply?'}
            </h2>
            <p className="text-[14px] md:text-[15px] text-gray-200 mb-6 leading-relaxed">
              {isHindi
                ? 'अपनी फेलोशिप या छात्रवृत्ति आवेदन शुरू करने के लिए मिनटों में अपना खाता बनाएं।'
                : 'Create your account in minutes to start your fellowship or scholarship application.'}
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-white text-[#1a3557] hover:bg-gray-100 font-semibold px-7 py-3 rounded-md min-h-[44px] transition-colors shadow-sm"
            >
              {isHindi ? 'अभी साइन अप करें' : 'Sign Up Now'}
            </Link>
          </div>
        </section>
      </main>

      {/* Eligibility Checker Modal */}
      <EligibilityCheckerModal open={eligibilityOpen} onClose={() => setEligibilityOpen(false)} />

      {/* GovFooter Component */}
      <GovFooter />
    </div>
  );
};

export default Landing;
