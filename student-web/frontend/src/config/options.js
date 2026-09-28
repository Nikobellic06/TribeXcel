/* Shared dropdown options for the portal forms. */

export const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export const GENDERS = [
  { value: 'Female', label: { en: 'Female', hi: 'महिला' } },
  { value: 'Male', label: { en: 'Male', hi: 'पुरुष' } },
  { value: 'Other', label: { en: 'Other', hi: 'अन्य' } },
];

export const YES_NO = [
  { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } },
  { value: 'no', label: { en: 'No', hi: 'नहीं' } },
];

export const OCCUPATIONS = [
  { value: 'Agriculture / farming', label: { en: 'Agriculture / farming', hi: 'कृषि / खेती' } },
  { value: 'Daily wage labour', label: { en: 'Daily wage labour', hi: 'दैनिक मज़दूरी' } },
  { value: 'Forest produce', label: { en: 'Forest produce collection', hi: 'वन उपज संग्रह' } },
  { value: 'Self-employed', label: { en: 'Self-employed / small business', hi: 'स्व-रोज़गार / लघु व्यवसाय' } },
  { value: 'Government service', label: { en: 'Government service', hi: 'सरकारी सेवा' } },
  { value: 'Private service', label: { en: 'Private service', hi: 'निजी सेवा' } },
  { value: 'Homemaker', label: { en: 'Homemaker', hi: 'गृहिणी' } },
  { value: 'Not applicable', label: { en: 'Not applicable / deceased', hi: 'लागू नहीं / दिवंगत' } },
];

export const SCHOOL_BOARDS = [
  { value: 'State Board', label: { en: 'State Board', hi: 'राज्य बोर्ड' } },
  { value: 'CBSE', label: { en: 'CBSE', hi: 'सीबीएसई' } },
  { value: 'CISCE', label: { en: 'CISCE (ICSE)', hi: 'सीआईएससीई (आईसीएसई)' } },
  { value: 'NIOS', label: { en: 'NIOS', hi: 'एनआईओएस' } },
];

export const SCHOOL_TYPES = [
  { value: 'Government', label: { en: 'Government school', hi: 'सरकारी विद्यालय' } },
  { value: 'Government-aided', label: { en: 'Government-aided school', hi: 'सरकारी सहायता प्राप्त विद्यालय' } },
  { value: 'EMRS / Ashram', label: { en: 'EMRS / Ashram school', hi: 'एकलव्य / आश्रम विद्यालय' } },
  { value: 'Private recognised', label: { en: 'Private, Government-recognised', hi: 'निजी, सरकार से मान्यता प्राप्त' } },
];

export const RESIDENCE_TYPES = [
  { value: 'day', label: { en: 'Day scholar', hi: 'दिवा छात्र' } },
  { value: 'hostel', label: { en: 'Hosteller', hi: 'छात्रावासी' } },
];

export const NFST_COURSES = [
  { value: 'M.Phil', label: { en: 'M.Phil (2 years)', hi: 'एम.फिल (2 वर्ष)' } },
  { value: 'Ph.D', label: { en: 'Ph.D (5 years)', hi: 'पीएच.डी (5 वर्ष)' } },
  { value: 'M.Phil + Ph.D', label: { en: 'Integrated M.Phil + Ph.D (5 years)', hi: 'एकीकृत एम.फिल + पीएच.डी (5 वर्ष)' } },
];

export const NFST_STREAMS = [
  { value: 'Humanities & Social Sciences', label: { en: 'Humanities & Social Sciences', hi: 'मानविकी एवं सामाजिक विज्ञान' } },
  { value: 'Science', label: { en: 'Science', hi: 'विज्ञान' } },
  { value: 'Engineering & Technology', label: { en: 'Engineering & Technology', hi: 'इंजीनियरिंग एवं प्रौद्योगिकी' } },
];

export const UNIVERSITY_TYPES = [
  { value: 'UGC 2(f)/12(B)', label: { en: 'University / college under UGC 2(f) / 12(B)', hi: 'यूजीसी 2(f) / 12(B) के अंतर्गत विश्वविद्यालय / महाविद्यालय' } },
  { value: 'Deemed university', label: { en: 'Deemed-to-be university (UGC grant-eligible)', hi: 'डीम्ड विश्वविद्यालय (यूजीसी अनुदान पात्र)' } },
  { value: 'Government-funded', label: { en: 'Receives Central / State Government grants', hi: 'केंद्र / राज्य सरकार से अनुदान प्राप्त' } },
  { value: 'Institute of National Importance', label: { en: 'Institute of National Importance', hi: 'राष्ट्रीय महत्व का संस्थान' } },
];

export const GRADE_TYPES = [
  { value: 'percent', label: { en: 'Percentage', hi: 'प्रतिशत' } },
  { value: 'cgpa', label: { en: 'CGPA / grade', hi: 'सीजीपीए / ग्रेड' } },
];

export const NOS_LEVELS = [
  { value: 'masters', label: { en: "Master's degree", hi: 'मास्टर्स डिग्री' } },
  { value: 'phd', label: { en: 'Ph.D', hi: 'पीएच.डी' } },
  { value: 'postdoc', label: { en: 'Post-doctoral research', hi: 'पोस्ट-डॉक्टरल शोध' } },
];

export const NOS_FIELDS = [
  { value: 'STEM', label: { en: 'Pure / applied science, engineering, technology, mathematics', hi: 'शुद्ध / अनुप्रयुक्त विज्ञान, इंजीनियरिंग, प्रौद्योगिकी, गणित' } },
  { value: 'Management, Economics, Finance, Law', label: { en: 'Management, economics, finance, law', hi: 'प्रबंधन, अर्थशास्त्र, वित्त, विधि' } },
  { value: 'Agriculture, Medicine', label: { en: 'Agriculture, medicine', hi: 'कृषि, चिकित्सा' } },
  { value: 'Humanities, Social Science, Fine Arts', label: { en: 'Humanities, social science, fine arts', hi: 'मानविकी, सामाजिक विज्ञान, ललित कला' } },
];

export const NOS_ADMISSION_STATUS = [
  { value: 'studying', label: { en: 'Already admitted and studying', hi: 'प्रवेश लेकर अध्ययनरत' } },
  { value: 'offer', label: { en: 'Offer received, yet to join', hi: 'प्रस्ताव प्राप्त, अभी शामिल नहीं हुए' } },
  { value: 'applied', label: { en: 'Applied, offer awaited', hi: 'आवेदन किया, प्रस्ताव की प्रतीक्षा' } },
];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands',
  'Ireland', 'New Zealand', 'Singapore', 'Japan', 'South Korea', 'Switzerland', 'Sweden',
  'Finland', 'Denmark', 'Norway', 'Italy', 'Spain', 'Other',
];
