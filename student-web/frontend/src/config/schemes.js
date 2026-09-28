/*
 * Scheme configuration — the single source of truth for the student portal.
 *
 * Every rule here comes from the Ministry of Tribal Affairs guidelines:
 *   - Pre-Matric Scholarship for ST students (Class IX & X), 2021-22 to 2025-26
 *   - National Fellowship for ST students (NFST), Part-A of the
 *     "National Fellowship & Scholarship for Higher Education of ST Students"
 *   - National Overseas Scholarship for ST students (NOS), revised 07.10.2022
 *
 * The form, eligibility checks, document checklist and scheme pages all read
 * from this file. To change a rule (for example the income ceiling), change it
 * here only.
 *
 * `code` is what the backend stores (Application.scheme). `id` is the URL slug.
 */

export const SELECTION_YEAR = '2026-27';
/** Age limits are counted "as on 1st July of the selection year". */
export const AGE_REFERENCE_DATE = '2026-07-01';

export const SCHEMES = {
  'pre-matric': {
    id: 'pre-matric',
    code: 'PRE_MATRIC',
    icon: 'school',
    status: 'open',
    short: { en: 'Pre-Matric', hi: 'मैट्रिक-पूर्व' },
    name: {
      en: 'Pre-Matric Scholarship for ST Students',
      hi: 'अनुसूचित जनजाति छात्रों हेतु मैट्रिक-पूर्व छात्रवृत्ति',
    },
    type: { en: 'Centrally Sponsored Scheme', hi: 'केंद्र प्रायोजित योजना' },
    level: { en: 'Class IX & X', hi: 'कक्षा IX एवं X' },
    window: { en: '1 April – 31 July', hi: '1 अप्रैल – 31 जुलाई' },
    overview: {
      en: 'Supports Scheduled Tribe students in Classes IX and X so that fewer students drop out in the move from elementary to secondary school. The scholarship is awarded by your domicile State/UT and paid directly into your Aadhaar-linked bank account.',
      hi: 'कक्षा IX और X में पढ़ने वाले अनुसूचित जनजाति के छात्रों को सहायता देती है ताकि प्रारंभिक से माध्यमिक स्तर पर पढ़ाई छोड़ने वाले छात्र कम हों। छात्रवृत्ति आपके अधिवास राज्य/संघ राज्य क्षेत्र द्वारा दी जाती है और सीधे आधार से जुड़े बैंक खाते में भेजी जाती है।',
    },
    rules: {
      incomeLimit: 250000,
      orphanIncomeExempt: true,
      allowedClasses: ['IX', 'X'],
      noRepeatClass: true,
      noOtherScholarship: true,
    },
    eligibility: [
      { en: 'Belongs to a Scheduled Tribe notified for your domicile State/UT', hi: 'अपने अधिवास राज्य/संघ राज्य क्षेत्र हेतु अधिसूचित अनुसूचित जनजाति से संबंधित हों' },
      { en: 'Studying in Class IX or X in a Government or Government-recognised school', hi: 'सरकारी या सरकार से मान्यता प्राप्त विद्यालय में कक्षा IX या X में अध्ययनरत हों' },
      { en: 'Family income from all sources up to ₹2,50,000 a year (does not apply to orphans)', hi: 'सभी स्रोतों से पारिवारिक आय ₹2,50,000 प्रति वर्ष तक (अनाथ छात्रों पर लागू नहीं)' },
      { en: 'Bank account in a scheduled bank, linked with Aadhaar and mobile number', hi: 'अनुसूचित बैंक में आधार एवं मोबाइल नंबर से जुड़ा बैंक खाता' },
      { en: 'Not receiving any other scholarship, and not repeating the same class', hi: 'कोई अन्य छात्रवृत्ति प्राप्त नहीं कर रहे हों तथा उसी कक्षा को दोहरा नहीं रहे हों' },
    ],
    benefits: [
      { label: { en: 'Day scholar', hi: 'दिवा छात्र' }, value: { en: '₹225 a month for 10 months (₹2,250 a year) + ₹750 books grant', hi: '₹225 प्रति माह, 10 माह तक (₹2,250 वार्षिक) + ₹750 पुस्तक अनुदान' } },
      { label: { en: 'Hosteller', hi: 'छात्रावासी' }, value: { en: '₹525 a month for 10 months (₹5,250 a year) + ₹1,000 books grant', hi: '₹525 प्रति माह, 10 माह तक (₹5,250 वार्षिक) + ₹1,000 पुस्तक अनुदान' } },
      { label: { en: 'Disability allowance', hi: 'दिव्यांगता भत्ता' }, value: { en: '₹600 a month (day scholar) or ₹800 a month (hosteller), for all 12 months', hi: '₹600 प्रति माह (दिवा छात्र) या ₹800 प्रति माह (छात्रावासी), पूरे 12 माह' } },
    ],
    verification: [
      { en: 'School nodal officer', hi: 'विद्यालय नोडल अधिकारी' },
      { en: 'District nodal officer', hi: 'जिला नोडल अधिकारी' },
      { en: 'State nodal officer', hi: 'राज्य नोडल अधिकारी' },
    ],
    academicForm: 'school',
    hasIncomeRule: true,
  },

  nfst: {
    id: 'nfst',
    code: 'NFST',
    icon: 'graduation',
    status: 'open',
    short: { en: 'NFST', hi: 'एनएफएसटी' },
    name: {
      en: 'National Fellowship for ST Students (M.Phil / Ph.D)',
      hi: 'अनुसूचित जनजाति छात्रों हेतु राष्ट्रीय फेलोशिप (एम.फिल / पीएच.डी)',
    },
    type: { en: 'Central Sector Scheme', hi: 'केंद्रीय क्षेत्र योजना' },
    level: { en: 'M.Phil / Ph.D in India', hi: 'भारत में एम.फिल / पीएच.डी' },
    window: { en: '1 July – 30 September', hi: '1 जुलाई – 30 सितंबर' },
    overview: {
      en: 'A fully funded fellowship for Scheduled Tribe scholars pursuing regular, full-time M.Phil or Ph.D in eligible Indian universities. 750 fresh fellowships are awarded every year on the basis of post-graduation marks.',
      hi: 'पात्र भारतीय विश्वविद्यालयों में नियमित, पूर्णकालिक एम.फिल या पीएच.डी करने वाले अनुसूचित जनजाति शोधार्थियों हेतु पूर्णतः वित्तपोषित फेलोशिप। स्नातकोत्तर अंकों के आधार पर प्रति वर्ष 750 नई फेलोशिप दी जाती हैं।',
    },
    rules: {
      incomeLimit: null,
      minMarks: 55,
      maxAge: 36,
      noOtherScholarship: true,
    },
    slots: {
      total: 750,
      split: [
        { label: { en: 'Divyangjan', hi: 'दिव्यांगजन' }, value: 38 },
        { label: { en: 'PVTG', hi: 'विशेष रूप से कमजोर जनजातीय समूह' }, value: 25 },
        { label: { en: 'Female', hi: 'महिला' }, value: 225 },
        { label: { en: 'ST others', hi: 'अन्य अनुसूचित जनजाति' }, value: 462 },
      ],
    },
    eligibility: [
      { en: 'Belongs to a notified Scheduled Tribe', hi: 'अधिसूचित अनुसूचित जनजाति से संबंधित हों' },
      { en: 'Post-graduation with at least 55% marks (or equivalent grade)', hi: 'न्यूनतम 55% अंकों (या समकक्ष ग्रेड) के साथ स्नातकोत्तर' },
      { en: 'Admission to regular, full-time M.Phil / Ph.D in a UGC 2(f)/12(B), deemed, Government-funded university or Institute of National Importance', hi: 'यूजीसी 2(f)/12(B), डीम्ड, सरकारी अनुदान प्राप्त विश्वविद्यालय या राष्ट्रीय महत्व के संस्थान में नियमित, पूर्णकालिक एम.फिल / पीएच.डी में प्रवेश' },
      { en: 'Not older than 36 years on 1 July of the selection year', hi: 'चयन वर्ष की 1 जुलाई को आयु 36 वर्ष से अधिक न हो' },
      { en: 'No income limit applies to this fellowship', hi: 'इस फेलोशिप हेतु कोई आय सीमा लागू नहीं है' },
    ],
    benefits: [
      { label: { en: 'Fellowship', hi: 'फेलोशिप' }, value: { en: '₹31,000 a month (Ph.D: ₹35,000 a month from year 3)', hi: '₹31,000 प्रति माह (पीएच.डी: तीसरे वर्ष से ₹35,000 प्रति माह)' } },
      { label: { en: 'Contingency', hi: 'आकस्मिक अनुदान' }, value: { en: 'M.Phil ₹10,000–12,000 a year; Ph.D ₹20,500–25,000 a year', hi: 'एम.फिल ₹10,000–12,000 वार्षिक; पीएच.डी ₹20,500–25,000 वार्षिक' } },
      { label: { en: 'HRA', hi: 'मकान किराया भत्ता' }, value: { en: '8%, 16% or 24% as per city, if no hostel is provided', hi: 'छात्रावास न मिलने पर शहर के अनुसार 8%, 16% या 24%' } },
      { label: { en: 'Escort allowance', hi: 'अनुरक्षक भत्ता' }, value: { en: '₹2,000 a month for Divyangjan scholars', hi: 'दिव्यांगजन शोधार्थियों हेतु ₹2,000 प्रति माह' } },
    ],
    verification: [
      { en: 'University nodal officer', hi: 'विश्वविद्यालय नोडल अधिकारी' },
      { en: 'Ministry of Tribal Affairs', hi: 'जनजातीय कार्य मंत्रालय' },
      { en: 'Selection committee', hi: 'चयन समिति' },
    ],
    academicForm: 'research',
    hasIncomeRule: false,
  },

  nos: {
    id: 'nos',
    code: 'NOS',
    icon: 'globe',
    status: 'open',
    short: { en: 'NOS', hi: 'एनओएस' },
    name: {
      en: 'National Overseas Scholarship for ST Students',
      hi: 'अनुसूचित जनजाति छात्रों हेतु राष्ट्रीय विदेश छात्रवृत्ति',
    },
    type: { en: 'Central Sector Scheme', hi: 'केंद्रीय क्षेत्र योजना' },
    level: { en: "Master's / Ph.D / Post-doc abroad", hi: 'विदेश में मास्टर्स / पीएच.डी / पोस्ट-डॉक्टरल' },
    window: { en: 'As notified on the portal', hi: 'पोर्टल पर अधिसूचना अनुसार' },
    overview: {
      en: "Helps meritorious Scheduled Tribe students study for a Master's, Ph.D or post-doctoral research at top-ranked universities abroad. 20 awards are made every year (17 ST + 3 PVTG), and 30% are earmarked for women.",
      hi: 'मेधावी अनुसूचित जनजाति छात्रों को विदेश के शीर्ष विश्वविद्यालयों में मास्टर्स, पीएच.डी या पोस्ट-डॉक्टरल शोध हेतु सहायता। प्रति वर्ष 20 छात्रवृत्तियाँ (17 अनुसूचित जनजाति + 3 पीवीटीजी) दी जाती हैं, जिनमें 30% महिलाओं हेतु आरक्षित हैं।',
    },
    rules: {
      incomeLimit: 600000,
      orphanIncomeExempt: true,
      minMarks: 55,
      qsRankLimit: 1000,
      maxAgeByLevel: { masters: 32, phd: 35, postdoc: 38 },
      oneChildPerFamily: true,
    },
    slots: {
      total: 20,
      split: [
        { label: { en: 'STEM', hi: 'विज्ञान/इंजीनियरिंग/प्रौद्योगिकी/गणित' }, value: 10 },
        { label: { en: 'Management, Economics, Finance, Law', hi: 'प्रबंधन, अर्थशास्त्र, वित्त, विधि' }, value: 4 },
        { label: { en: 'Agriculture, Medicine', hi: 'कृषि, चिकित्सा' }, value: 4 },
        { label: { en: 'Humanities, Social Science, Fine Arts', hi: 'मानविकी, सामाजिक विज्ञान, ललित कला' }, value: 2 },
      ],
    },
    eligibility: [
      { en: 'Belongs to a notified Scheduled Tribe (3 awards reserved for PVTG)', hi: 'अधिसूचित अनुसूचित जनजाति से संबंधित हों (3 छात्रवृत्तियाँ पीवीटीजी हेतु)' },
      { en: "Master's: 55% in Bachelor's, age up to 32; Ph.D: 55% in Master's, age up to 35; Post-doc: Ph.D awarded, age up to 38 (on 1 July)", hi: 'मास्टर्स: स्नातक में 55%, आयु 32 तक; पीएच.डी: मास्टर्स में 55%, आयु 35 तक; पोस्ट-डॉक: पीएच.डी प्राप्त, आयु 38 तक (1 जुलाई को)' },
      { en: 'The marks condition does not apply if you are admitted to a top-1000 QS-ranked university', hi: 'शीर्ष 1000 क्यूएस रैंक वाले विश्वविद्यालय में प्रवेश होने पर अंकों की शर्त लागू नहीं होती' },
      { en: 'Family income from all sources up to ₹6,00,000 a year', hi: 'सभी स्रोतों से पारिवारिक आय ₹6,00,000 प्रति वर्ष तक' },
      { en: 'Only one child of the same parents can receive this award, and only once', hi: 'एक ही माता-पिता की केवल एक संतान को, और केवल एक बार, यह छात्रवृत्ति मिल सकती है' },
    ],
    benefits: [
      { label: { en: 'Maintenance', hi: 'निर्वाह भत्ता' }, value: { en: 'USD 15,400 a year (UK: GBP 9,900)', hi: 'USD 15,400 वार्षिक (यूके: GBP 9,900)' } },
      { label: { en: 'Contingency & equipment', hi: 'आकस्मिक एवं उपकरण' }, value: { en: 'USD 1,532 a year (UK: GBP 1,116)', hi: 'USD 1,532 वार्षिक (यूके: GBP 1,116)' } },
      { label: { en: 'Tuition, visa & insurance', hi: 'शिक्षण शुल्क, वीज़ा एवं बीमा' }, value: { en: 'Actual tuition and compulsory fees, visa fee and medical insurance', hi: 'वास्तविक शिक्षण एवं अनिवार्य शुल्क, वीज़ा शुल्क और चिकित्सा बीमा' } },
      { label: { en: 'Air passage', hi: 'हवाई यात्रा' }, value: { en: 'Economy class, shortest route, India to university and back', hi: 'इकोनॉमी श्रेणी, सबसे छोटा मार्ग, भारत से विश्वविद्यालय और वापसी' } },
    ],
    verification: [
      { en: 'Ministry scrutiny', hi: 'मंत्रालय द्वारा जाँच' },
      { en: 'Merit by QS rank / interview', hi: 'क्यूएस रैंक / साक्षात्कार द्वारा मेरिट' },
      { en: 'Indian Mission abroad', hi: 'विदेश स्थित भारतीय मिशन' },
    ],
    academicForm: 'overseas',
    hasIncomeRule: true,
  },
};

export const SCHEME_LIST = [SCHEMES['pre-matric'], SCHEMES.nfst, SCHEMES.nos];

export const getScheme = (id) => SCHEMES[String(id || '').toLowerCase()] || null;

export const getSchemeByCode = (code) =>
  SCHEME_LIST.find((s) => s.code === String(code || '').toUpperCase()) || null;
