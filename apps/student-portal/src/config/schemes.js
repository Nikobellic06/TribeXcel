/**
 * Ministry of Tribal Affairs (MoTA), Government of India
 * Authoritative Scheme Catalogue & Configuration
 * Session: 2026-27 (Version: 2026.1)
 */

export const SELECTION_YEAR = '2026-27';
export const AGE_REFERENCE_DATE = '2026-07-01';

export const SCHEMES = {
  nfst: {
    id: 'nfst',
    code: 'NFST',
    icon: 'graduation',
    status: 'open',
    applicationMode: 'DIRECT',
    short: { en: 'NFST', hi: 'एनएफएसटी' },
    name: {
      en: 'National Fellowship for ST Students (M.Phil / Ph.D)',
      hi: 'अनुसूचित जनजाति छात्रों हेतु राष्ट्रीय अध्येतावृत्ति (एम.फिल / पीएच.डी)',
    },
    type: { en: 'Central Sector Direct Scheme', hi: 'केंद्रीय क्षेत्र प्रत्यक्ष योजना' },
    level: { en: 'M.Phil / Ph.D in Indian Universities', hi: 'भारत में एम.फिल / पीएच.डी' },
    window: { en: '1 July 2026 – 31 October 2026', hi: '1 जुलाई 2026 – 31 अक्टूबर 2026' },
    overview: {
      en: 'A fully funded fellowship for Scheduled Tribe research scholars pursuing regular, full-time M.Phil and Ph.D programmes in recognized Indian Universities, IITs, NITs, and Institutes of National Importance. 750 fresh fellowships awarded annually.',
      hi: 'मान्यता प्राप्त भारतीय विश्वविद्यालयों, आईआईटी, एनआईटी एवं राष्ट्रीय महत्व के संस्थानों में नियमित, पूर्णकालिक एम.फिल एवं पीएच.डी करने वाले अनुसूचित जनजाति शोधार्थियों हेतु पूर्णतः वित्तपोषित अध्येतावृत्ति। प्रतिवर्ष 750 नई अध्येतावृत्तियां प्रदान की जाती हैं।',
    },
    rules: {
      incomeLimit: null, // No family income ceiling under official NFST guidelines
      minMarks: 55, // Minimum percentage in Master's degree
      maxAge: 36, // General ST maximum age limit
      noOtherScholarship: true,
      admittedRegularOnly: true,
    },
    slots: {
      total: 750,
      split: [
        { label: { en: 'Divyangjan', hi: 'दिव्यांगजन' }, value: 38 },
        { label: { en: 'PVTG', hi: 'विशेष रूप से कमजोर जनजातीय समूह' }, value: 25 },
        { label: { en: 'Female Candidates', hi: 'महिला अभ्यर्थी' }, value: 225 },
        { label: { en: 'General ST', hi: 'सामान्य अनुसूचित जनजाति' }, value: 462 },
      ],
    },
    eligibility: [
      { en: 'Candidate must belong to a notified Scheduled Tribe (ST)', hi: 'अभ्यर्थी को अधिसूचित अनुसूचित जनजाति (एसटी) से संबंधित होना चाहिए' },
      { en: 'Master’s degree with at least 55% aggregate marks (M.Phil marks are not considered for minimum qualifying marks)', hi: 'न्यूनतम 55% अंकों के साथ स्नातकोत्तर उपाधि (न्यूनतम अर्हक अंकों हेतु एम.फिल के अंक मान्य नहीं हैं)' },
      { en: 'Confirmed admission / registration in regular full-time M.Phil / Ph.D programme in an eligible university', hi: 'पात्र विश्वविद्यालय में नियमित पूर्णकालिक एम.फिल / पीएच.डी में पुष्ट प्रवेश / पंजीकरण' },
      { en: 'Not older than 36 years as on 1st July of the selection year', hi: 'चयन वर्ष की 1 जुलाई को आयु 36 वर्ष से अधिक न हो' },
      { en: 'No income limit applies to this fellowship under Ministry guidelines', hi: 'मंत्रालय के दिशानिर्देशों के अनुसार इस अध्येतावृत्ति हेतु कोई पारिवारिक आय सीमा नहीं है' },
    ],
    benefits: [
      { label: { en: 'Junior Research Fellowship (JRF)', hi: 'कनिष्ठ शोध अध्येतावृत्ति' }, value: { en: '₹37,000 / month (Years 1 & 2)', hi: '₹37,000 प्रति माह (प्रथम 2 वर्ष)' } },
      { label: { en: 'Senior Research Fellowship (SRF)', hi: 'वरिष्ठ शोध अध्येतावृत्ति' }, value: { en: '₹42,000 / month (Remaining period)', hi: '₹42,000 प्रति माह (शेष अवधि)' } },
      { label: { en: 'Contingency Allowance', hi: 'आकस्मिक अनुदान' }, value: { en: 'Humanities: ₹10,000–₹20,500/yr; Science: ₹12,000–₹25,000/yr', hi: 'मानविकी: ₹10,000–₹20,500/वर्ष; विज्ञान: ₹12,000–₹25,000/वर्ष' } },
      { label: { en: 'House Rent Allowance (HRA)', hi: 'मकान किराया भत्ता' }, value: { en: 'As per central government norms (8%, 16%, or 27% based on city category)', hi: 'केंद्र सरकार के मानदंडों अनुसार (शहर श्रेणी के आधार पर 8%, 16% या 27%)' } },
      { label: { en: 'Escorts / Reader Allowance', hi: 'अनुरक्षक भत्ता' }, value: { en: '₹2,000 / month for physically handicapped / blind scholars', hi: 'दिव्यांगजन / दृष्टिबाधित शोधार्थियों हेतु ₹2,000 प्रति माह' } },
    ],
    verification: [
      { en: 'University Nodal Officer / Dean', hi: 'विश्वविद्यालय नोडल अधिकारी' },
      { en: 'Ministry of Tribal Affairs Scrutiny Cell', hi: 'जनजातीय कार्य मंत्रालय संवीक्षा प्रकोष्ठ' },
      { en: 'National Selection Committee', hi: 'राष्ट्रीय चयन समिति' },
    ],
    officialSource: {
      portalUrl: 'https://fellowship.tribal.gov.in',
      guidelinesUrl: 'https://tribal.nic.in/NFST.aspx',
    },
    hasIncomeRule: false,
  },

  nos: {
    id: 'nos',
    code: 'NOS',
    icon: 'globe',
    status: 'open',
    applicationMode: 'DIRECT',
    short: { en: 'NOS', hi: 'एनओएस' },
    name: {
      en: 'National Overseas Scholarship for ST Students',
      hi: 'अनुसूचित जनजाति छात्रों हेतु राष्ट्रीय विदेशी छात्रवृत्ति',
    },
    type: { en: 'Central Sector Direct Scheme', hi: 'केंद्रीय क्षेत्र प्रत्यक्ष योजना' },
    level: { en: "Master's / Ph.D / Post-Doctoral Abroad", hi: 'विदेश में मास्टर्स / पीएच.डी / पोस्ट-डॉक्टरल' },
    window: { en: 'As notified for Session 2026-27', hi: 'सत्र 2026-27 हेतु पोर्टल पर अधिसूचना अनुसार' },
    overview: {
      en: "Provides financial assistance to meritorious Scheduled Tribe students for pursuing Master’s level courses, Ph.D. and Post-Doctoral research in accredited foreign universities ranked within the top 1000 in QS World University Rankings. 20 awards per year.",
      hi: 'क्यूएस विश्व रैंकिंग के शीर्ष 1000 विश्वविद्यालयों में मास्टर्स, पीएच.डी एवं पोस्ट-डॉक्टरल शोध हेतु मेधावी अनुसूचित जनजाति छात्रों को वित्तीय सहायता। प्रतिवर्ष 20 छात्रवृत्तियां।',
    },
    rules: {
      incomeLimit: 600000, // Total family income <= Rs. 6.00 Lakhs / annum
      orphanIncomeExempt: true,
      minMarks: 55,
      qsRankLimit: 1000,
      maxAgeByLevel: {
        masters: 32,
        phd: 35,
        postdoc: 38,
      },
      twoChildrenRule: true,
      noPreviousAward: true,
    },
    slots: {
      total: 20,
      split: [
        { label: { en: 'Scheduled Tribe (General)', hi: 'अनुसूचित जनजाति (सामान्य)' }, value: 17 },
        { label: { en: 'Particularly Vulnerable Tribal Groups (PVTG)', hi: 'विशेष रूप से कमजोर जनजातीय समूह' }, value: 3 },
      ],
    },
    eligibility: [
      { en: 'Belongs to a notified Scheduled Tribe (ST)', hi: 'अधिसूचित अनुसूचित जनजाति (एसटी) से संबंधित हों' },
      { en: 'At least 55% marks or equivalent grade in qualifying degree (Bachelor’s for Master’s; Master’s for Ph.D; Ph.D for Post-Doc)', hi: 'अर्हक उपाधि में न्यूनतम 55% अंक या समकक्ष ग्रेड' },
      { en: 'Total family income from all sources must not exceed ₹6,00,000 per annum (orphans exempt)', hi: 'सभी स्रोतों से कुल पारिवारिक आय ₹6,00,000 प्रति वर्ष से अधिक न हो (अनाथ अभ्यर्थी मुक्त)' },
      { en: 'Confirmed admission in foreign university ranked within top 1000 QS World University Rankings', hi: 'क्यूएस विश्व रैंकिंग के शीर्ष 1000 में शामिल विदेशी विश्वविद्यालय में पुष्ट प्रवेश' },
      { en: 'Age limits on 1st July: Master’s: 32 yrs, Ph.D: 35 yrs, Post-Doc: 38 yrs', hi: '1 जुलाई को आयु सीमा: मास्टर्स: 32 वर्ष, पीएच.डी: 35 वर्ष, पोस्ट-डॉक्टरल: 38 वर्ष' },
      { en: 'Not more than two children of the same parents eligible', hi: 'एक ही माता-पिता के दो से अधिक बच्चे पात्र नहीं होंगे' },
    ],
    benefits: [
      { label: { en: 'Annual Maintenance Allowance', hi: 'वार्षिक निर्वाह भत्ता' }, value: { en: 'USA: USD 15,400; UK: GBP 9,900; Other countries: USD equivalent', hi: 'यूएसए: 15,400 डॉलर; यूके: 9,900 पाउंड' } },
      { label: { en: 'Tuition Fees', hi: 'शिक्षण शुल्क' }, value: { en: 'Actual tuition fees paid directly to the foreign university', hi: 'विदेशी विश्वविद्यालय को सीधे वास्तविक शिक्षण शुल्क भुगतान' } },
      { label: { en: 'Contingency Allowance', hi: 'आकस्मिक अनुदान' }, value: { en: 'USD 1,500 / annum (or GBP 1,100 / annum)', hi: '1,500 अमेरिकी डॉलर प्रति वर्ष' } },
      { label: { en: 'Airfare & Travel', hi: 'हवाई किराया एवं यात्रा' }, value: { en: 'Economy class airfare to destination and return upon completion', hi: 'गंतव्य हेतु एवं पाठ्यक्रम समाप्ति पर वापसी हेतु इकोनॉमी श्रेणी विमान किराया' } },
    ],
    verification: [
      { en: 'Overseas Scholarship Division, MoTA', hi: 'विदेशी छात्रवृत्ति प्रभाग, जनजातीय कार्य मंत्रालय' },
      { en: 'MoTA Expert Selection Committee', hi: 'विशेषज्ञ चयन समिति, जनजातीय कार्य मंत्रालय' },
      { en: 'Indian Missions / Embassies Abroad', hi: 'विदेश स्थित भारतीय दूतावास' },
    ],
    officialSource: {
      portalUrl: 'https://overseas.tribal.gov.in',
      guidelinesUrl: 'https://tribal.nic.in/NOS.aspx',
    },
    hasIncomeRule: true,
  },

  'pre-matric': {
    id: 'pre-matric',
    code: 'PRE_MATRIC',
    icon: 'school',
    status: 'open',
    applicationMode: 'EXTERNAL_FEDERATED',
    short: { en: 'Pre-Matric', hi: 'मैट्रिक-पूर्व' },
    name: {
      en: 'Pre-Matric Scholarship Scheme for ST Students',
      hi: 'अनुसूचित जनजाति छात्रों हेतु मैट्रिक-पूर्व छात्रवृत्ति योजना',
    },
    type: { en: 'Centrally Sponsored Scheme (Federated Portal Workflow)', hi: 'केंद्र प्रायोजित योजना (बाह्य राज्य/एनएसपी पोर्टल)' },
    level: { en: 'Class IX & X in India', hi: 'कक्षा IX एवं X' },
    window: { en: 'Processed via State Portals / NSP', hi: 'राज्य छात्रवृत्ति पोर्टल / एनएसपी के माध्यम से' },
    overview: {
      en: 'Centrally sponsored scholarship scheme implemented through State Governments and UT Administrations to support ST parents in sending children to school at Class IX and X levels. Applications are submitted via the designated State Portal or National Scholarship Portal (NSP).',
      hi: 'कक्षा IX और X के अनुसूचित जनजाति छात्रों हेतु राज्य सरकारों और संघ राज्य क्षेत्रों द्वारा क्रियान्वित केंद्र प्रायोजित योजना। आवेदन संबंधित राज्य पोर्टल अथवा राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) के माध्यम से जमा किए जाते हैं।',
    },
    externalPortalName: 'National Scholarship Portal / State Portals',
    externalPortalUrl: 'https://scholarships.gov.in',
    applicationRouteNotice: {
      en: 'Applications for this scheme are processed through the designated State/UT Portal or National Scholarship Portal (NSP). TribeXcel provides official scheme details, eligibility evaluation, and direct redirection to the application authority.',
      hi: 'इस योजना के आवेदन संबंधित राज्य/संघ राज्य क्षेत्र के पोर्टल अथवा राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) द्वारा संसाधित किए जाते हैं। TribeXcel योजना विवरण, पात्रता जांच एवं आधिकारिक पोर्टल पुनर्निर्देशन प्रदान करता है।',
    },
    rules: {
      incomeLimit: 250000,
      orphanIncomeExempt: true,
      allowedClasses: ['IX', 'X'],
    },
    eligibility: [
      { en: 'Belongs to a notified Scheduled Tribe (ST)', hi: 'अधिसूचित अनुसूचित जनजाति से संबंधित हों' },
      { en: 'Regular student studying in Class IX or X in a recognized government/aided school', hi: 'मान्यता प्राप्त विद्यालय में कक्षा IX या X में नियमित अध्ययनरत हों' },
      { en: 'Family income from all sources up to ₹2,50,000 per annum (orphans exempt)', hi: 'पारिवारिक आय ₹2,50,000 प्रति वर्ष तक (अनाथ अभ्यर्थी मुक्त)' },
    ],
    benefits: [
      { label: { en: 'Day Scholar', hi: 'दिवा छात्र' }, value: { en: '₹2,250 per annum + ₹750 book grant', hi: '₹2,250 वार्षिक + ₹750 पुस्तक अनुदान' } },
      { label: { en: 'Hosteller', hi: 'छात्रावासी' }, value: { en: '₹5,250 per annum + ₹1,000 book grant', hi: '₹5,250 वार्षिक + ₹1,000 पुस्तक अनुदान' } },
    ],
    officialSource: {
      portalUrl: 'https://scholarships.gov.in',
      guidelinesUrl: 'https://tribal.nic.in/preMatric.aspx',
    },
    hasIncomeRule: true,
  },

  'post-matric': {
    id: 'post-matric',
    code: 'POST_MATRIC',
    icon: 'book-open',
    status: 'open',
    applicationMode: 'EXTERNAL_FEDERATED',
    short: { en: 'Post-Matric', hi: 'पोस्ट-मैट्रिक' },
    name: {
      en: 'Post-Matric Scholarship Scheme for ST Students',
      hi: 'अनुसूचित जनजाति छात्रों हेतु पोस्ट-मैट्रिक छात्रवृत्ति योजना',
    },
    type: { en: 'Centrally Sponsored Scheme (Federated Portal Workflow)', hi: 'केंद्र प्रायोजित योजना (राज्य/एनएसपी पोर्टल)' },
    level: { en: 'Class XI, XII, ITI, Diploma, UG, PG in India', hi: 'कक्षा XI, XII, डिप्लोमा, स्नातक, स्नातकोत्तर' },
    window: { en: 'Processed via State Portals / NSP', hi: 'राज्य छात्रवृत्ति पोर्टल / एनएसपी के माध्यम से' },
    overview: {
      en: 'An open-ended entitlement scheme providing comprehensive financial assistance to Scheduled Tribe students studying at post-matriculation or post-secondary stages across India.',
      hi: 'मैट्रिकोत्तर या माध्यमिकोत्तर स्तर पर अध्ययनरत अनुसूचित जनजाति के छात्रों को व्यापक वित्तीय सहायता प्रदान करने वाली योजना। आवेदन राज्य पोर्टलों एवं एनएसपी के माध्यम से स्वीकार किए जाते हैं।',
    },
    externalPortalName: 'National Scholarship Portal / State Tribal Portals',
    externalPortalUrl: 'https://scholarships.gov.in',
    applicationRouteNotice: {
      en: 'Applications are submitted through the State/UT Scholarship Portal or NSP under State-specific schemes. Direct benefit transfers (DBT) are managed jointly by States and MoTA.',
      hi: 'आवेदन राज्य/संघ राज्य क्षेत्र के छात्रवृत्ति पोर्टल अथवा एनएसपी के माध्यम से प्रस्तुत किए जाते हैं। डीबीटी भुगतान राज्य एवं जनजातीय कार्य मंत्रालय द्वारा संयुक्त रूप से किया जाता है।',
    },
    rules: {
      incomeLimit: 250000,
      orphanIncomeExempt: true,
    },
    eligibility: [
      { en: 'Belongs to a notified Scheduled Tribe (ST)', hi: 'अधिसूचित अनुसूचित जनजाति से संबंधित हों' },
      { en: 'Studying in post-matriculation courses (Class XI onwards) in recognized institutions', hi: 'मान्यता प्राप्त संस्थानों में कक्षा XI से स्नातकोत्तर स्तर पर अध्ययनरत हों' },
      { en: 'Annual family income not exceeding ₹2,50,000 per annum', hi: 'पारिवारिक वार्षिक आय ₹2,50,000 से अधिक न हो' },
    ],
    benefits: [
      { label: { en: 'Compulsory Non-Refundable Fees', hi: 'अनिवार्य गैर-वापसी योग्य शुल्क' }, value: { en: 'Reimbursement of tuition, library, examination, and laboratory fees', hi: 'शिक्षण, पुस्तकालय, परीक्षा एवं प्रयोगशाला शुल्क की प्रतिपूर्ति' } },
      { label: { en: 'Maintenance Allowance', hi: 'निर्वाह भत्ता' }, value: { en: 'Group-specific monthly allowance up to ₹1,200/month', hi: 'पाठ्यक्रम समूह अनुसार ₹1,200 प्रति माह तक' } },
    ],
    officialSource: {
      portalUrl: 'https://scholarships.gov.in',
      guidelinesUrl: 'https://tribal.nic.in/postMatric.aspx',
    },
    hasIncomeRule: true,
  },

  'top-class': {
    id: 'top-class',
    code: 'TOP_CLASS',
    icon: 'award',
    status: 'open',
    applicationMode: 'EXTERNAL_FEDERATED',
    short: { en: 'Top Class', hi: 'शीर्ष श्रेणी' },
    name: {
      en: 'National Scholarship for Higher Education (Top Class) for ST Students',
      hi: 'अनुसूचित जनजाति छात्रों हेतु शीर्ष श्रेणी शिक्षा राष्ट्रीय छात्रवृत्ति',
    },
    type: { en: 'Central Sector Scheme (NSP Portal Workflow)', hi: 'केंद्रीय क्षेत्र योजना (एनएसपी पोर्टल)' },
    level: { en: 'Premier Notified Institutes (IIT, IIM, NIT, AIIMS, NLU, etc.)', hi: 'अधिसूचित उत्कृष्ट संस्थान' },
    window: { en: 'Processed via National Scholarship Portal (NSP)', hi: 'एनएसपी के माध्यम से' },
    overview: {
      en: 'Recognizes and promotes quality education among ST students by providing full financial support for studies in 250+ notified premier institutions across India including IITs, IIMs, NITs, and AIIMS. 1000 fresh scholarships awarded every year.',
      hi: 'आईआईटी, आईआईएम, एनआईटी, एम्स सहित 250+ अधिसूचित उत्कृष्ट संस्थानों में अध्ययनरत अनुसूचित जनजाति के छात्रों को पूर्ण वित्तीय सहायता प्रदान करने वाली योजना। प्रतिवर्ष 1000 नई छात्रवृत्तियां।',
    },
    externalPortalName: 'National Scholarship Portal (NSP)',
    externalPortalUrl: 'https://scholarships.gov.in',
    applicationRouteNotice: {
      en: 'Applications for the Top Class Education scheme are scrutinized and processed centrally through the National Scholarship Portal (NSP). Candidates must apply directly on scholarships.gov.in.',
      hi: 'शीर्ष श्रेणी शिक्षा योजना के आवेदन केंद्रीय रूप से राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) के माध्यम से संसाधित किए जाते हैं। अभ्यर्थी सीधे scholarships.gov.in पर आवेदन करें।',
    },
    rules: {
      incomeLimit: 600000,
      premierOnly: true,
    },
    slots: {
      total: 1000,
    },
    eligibility: [
      { en: 'Belongs to a notified Scheduled Tribe (ST)', hi: 'अधिसूचित अनुसूचित जनजाति से संबंधित हों' },
      { en: 'Secured admission in one of the 250+ premier institutions notified by the Ministry', hi: 'मंत्रालय द्वारा अधिसूचित 250+ उत्कृष्ट संस्थानों में से किसी एक में प्रवेश प्राप्त किया हो' },
      { en: 'Total family income from all sources up to ₹6,00,000 per annum', hi: 'पारिवारिक वार्षिक आय ₹6,00,000 तक हो' },
    ],
    benefits: [
      { label: { en: 'Tuition Fee', hi: 'शिक्षण शुल्क' }, value: { en: 'Full tuition fee and non-refundable charges (up to ₹2.00 Lakhs/yr in private institutes)', hi: 'पूर्ण शिक्षण शुल्क (निजी संस्थानों में ₹2.00 लाख/वर्ष तक)' } },
      { label: { en: 'Living Expenses', hi: 'जीवन निर्वाह व्यय' }, value: { en: '₹3,000 / month (₹36,000 / annum)', hi: '₹3,000 प्रति माह' } },
      { label: { en: 'Books & Stationery', hi: 'पुस्तकें एवं स्टेशनरी' }, value: { en: '₹5,000 / annum', hi: '₹5,000 प्रति वर्ष' } },
      { label: { en: 'Computer Grant', hi: 'कंप्यूटर अनुदान' }, value: { en: '₹45,000 one-time assistance for laptop/desktop', hi: '₹45,000 एकमुश्त सहायता' } },
    ],
    officialSource: {
      portalUrl: 'https://scholarships.gov.in',
      guidelinesUrl: 'https://tribal.nic.in/topClass.aspx',
    },
    hasIncomeRule: true,
  },
};

export const SCHEME_LIST = Object.values(SCHEMES);

export function getScheme(codeOrId) {
  if (!codeOrId) return null;
  const key = String(codeOrId).toLowerCase().replace(/_/g, '-');
  if (SCHEMES[key]) return SCHEMES[key];
  return Object.values(SCHEMES).find(
    (s) => s.code === codeOrId || s.id === codeOrId || s.code === String(codeOrId).toUpperCase()
  ) || null;
}

export const getSchemeByCode = getScheme;
