/**
 * Official Ministry of Tribal Affairs (MoTA) Document Configuration
 * Session: 2026-27
 */

const PDF_ONLY = ['application/pdf'];
const PDF_OR_IMAGE = ['application/pdf', 'image/jpeg', 'image/png'];
const IMAGE_ONLY = ['image/jpeg', 'image/png'];

export const DOCUMENTS = {
  photo: {
    id: 'photo',
    label: { en: 'Passport Photograph', hi: 'पासपोर्ट आकार का फोटो' },
    hint: { en: 'Recent color photograph with white background. JPG/PNG up to 2 MB.', hi: 'सफेद पृष्ठभूमि वाला हाल का रंगीन फोटो। 2 एमबी तक।' },
    accept: IMAGE_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  signature: {
    id: 'signature',
    label: { en: 'Applicant Signature', hi: 'आवेदक के हस्ताक्षर' },
    hint: { en: 'Clear scanned signature in black/blue ink on white paper. JPG/PNG up to 2 MB.', hi: 'सफेद कागज पर काली/नीली स्याही से स्पष्ट हस्ताक्षर।' },
    accept: IMAGE_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  class10_certificate: {
    id: 'class10_certificate',
    label: { en: 'Class 10 Certificate (Proof of Date of Birth)', hi: 'कक्षा 10 प्रमाण पत्र (जन्मतिथि का प्रमाण)' },
    hint: { en: 'Secondary School Board pass certificate showing Date of Birth. PDF up to 2 MB.', hi: 'माध्यमिक विद्यालय बोर्ड प्रमाण पत्र जिसमें जन्मतिथि अंकित हो।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: { code: '10CR', issuer: { en: 'CBSE / State School Examination Boards', hi: 'सीबीएसई / राज्य विद्यालय बोर्ड' } },
  },
  st_certificate: {
    id: 'st_certificate',
    label: { en: 'Scheduled Tribe (ST) Certificate', hi: 'अनुसूचित जनजाति (एसटी) प्रमाण पत्र' },
    hint: { en: 'ST certificate issued by the competent Revenue/Administrative Authority (Tehsildar/SDM/DM).', hi: 'सक्षम राजस्व प्राधिकारी (तहसीलदार/एसडीएम/डीएम) द्वारा जारी एसटी प्रमाण पत्र।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: { code: 'CASTC', issuer: { en: 'State Revenue / e-District Department', hi: 'राज्य राजस्व / ई-डिस्ट्रिक्ट विभाग' } },
  },
  pvtg_certificate: {
    id: 'pvtg_certificate',
    label: { en: 'PVTG Certificate', hi: 'पीवीटीजी प्रमाण पत्र' },
    hint: { en: 'Certificate certifying candidate belongs to Particularly Vulnerable Tribal Group.', hi: 'विशेष रूप से कमजोर जनजातीय समूह (PVTG) का प्रमाण पत्र।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: null,
  },
  disability_certificate: {
    id: 'disability_certificate',
    label: { en: 'UDID / Disability Certificate', hi: 'यूडीआईडी / दिव्यांगता प्रमाण पत्र' },
    hint: { en: 'Disability Certificate or UDID card (40% or more disability) issued by authorized Medical Board.', hi: 'सक्षम चिकित्सा बोर्ड द्वारा जारी 40% या अधिक दिव्यांगता का प्रमाण पत्र।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: { code: 'DISCR', issuer: { en: 'Ministry of Social Justice & Empowerment (UDID)', hi: 'सामाजिक न्याय एवं अधिकारिता मंत्रालय' } },
  },
  pg_marksheet: {
    id: 'pg_marksheet',
    label: { en: "Master's Degree Consolidated Marksheet", hi: 'स्नातकोत्तर (मास्टर्स) समेकित अंकतालिका' },
    hint: { en: "Consolidated grade sheet or all semester marksheets of qualifying Master's Degree (minimum 55% marks). Note: M.Phil marks not considered.", hi: 'स्नातकोत्तर डिग्री की समेकित अंकतालिका (न्यूनतम 55% अंक)। ध्यान दें: एम.फिल अंक मान्य नहीं हैं।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: { code: 'DEGRR', issuer: { en: 'National Academic Depository (NAD) / University', hi: 'राष्ट्रीय शैक्षणिक निक्षेपागार (NAD)' } },
  },
  qualifying_degree: {
    id: 'qualifying_degree',
    label: { en: 'Qualifying Degree Certificate & Marksheets', hi: 'अर्हक उपाधि प्रमाण पत्र एवं अंकतालिका' },
    hint: { en: "Bachelor's for Master's; Master's for Ph.D; Ph.D degree for Post-Doctoral programme.", hi: 'मास्टर्स हेतु स्नातक; पीएचडी हेतु स्नातकोत्तर; पोस्ट-डॉक्टरल हेतु पीएचडी प्रमाण पत्र।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: { code: 'DEGRR', issuer: { en: 'National Academic Depository (NAD) / University', hi: 'राष्ट्रीय शैक्षणिक निक्षेपागार' } },
  },
  cgpa_conversion: {
    id: 'cgpa_conversion',
    label: { en: 'CGPA to Percentage Conversion Formula', hi: 'सीजीपीए से प्रतिशत रूपांतरण सूत्र' },
    hint: { en: 'Official conversion formula issued by Registrar / Controller of Examination.', hi: 'विश्वविद्यालय के कुलसचिव / परीक्षा नियंत्रक द्वारा जारी आधिकारिक रूपांतरण सूत्र।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  admission_letter: {
    id: 'admission_letter',
    label: { en: 'University Admission / Joining Document', hi: 'विश्वविद्यालय प्रवेश / कार्यभार ग्रहण दस्तावेज' },
    hint: { en: 'Official document proving regular admission / joining in M.Phil / Ph.D issued by University Registrar/Dean.', hi: 'विश्वविद्यालय कुलसचिव/डीन द्वारा जारी नियमित एम.फिल/पीएचडी प्रवेश या कार्यभार ग्रहण दस्तावेज।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  foreign_admission_letter: {
    id: 'foreign_admission_letter',
    label: { en: 'Foreign University Admission / Offer Letter', hi: 'विदेशी विश्वविद्यालय प्रवेश / प्रस्ताव पत्र' },
    hint: { en: 'Unconditional / conditional offer of admission from foreign institution ranked within QS top 1000.', hi: 'क्यूएस शीर्ष 1000 रैंकिंग वाले विदेशी संस्थान से प्रवेश/प्रस्ताव पत्र।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  family_income_proof: {
    id: 'family_income_proof',
    label: { en: 'Family Income Certificate / ITR', hi: 'पारिवारिक आय प्रमाण पत्र / आईटीआर' },
    hint: { en: 'Income Certificate from Executive Magistrate/Tehsildar or ITR Form 16 of all earning family members (total income <= ₹6,00,000/yr).', hi: 'सक्षम कार्यपालक मजिस्ट्रेट/तहसीलदार द्वारा जारी आय प्रमाण पत्र या परिवार के कमाने वाले सदस्यों का आईटीआर।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: { code: 'INCER', issuer: { en: 'State Revenue Department', hi: 'राज्य राजस्व विभाग' } },
  },
  orphan_certificate: {
    id: 'orphan_certificate',
    label: { en: 'Orphan Certificate / Parents Death Certificates', hi: 'अनाथ प्रमाण पत्र / माता-पिता के मृत्यु प्रमाण पत्र' },
    hint: { en: 'Death certificates of both parents or certificate issued by Child Welfare Committee.', hi: 'माता-पिता दोनों के मृत्यु प्रमाण पत्र अथवा बाल कल्याण समिति द्वारा जारी प्रमाण पत्र।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  employer_noc: {
    id: 'employer_noc',
    label: { en: 'Employer NOC & Experience Certificate', hi: 'नियोक्ता अनापत्ति प्रमाण पत्र (NOC) एवं अनुभव प्रमाण पत्र' },
    hint: { en: 'No Objection Certificate from current employer granting study leave.', hi: 'वर्तमान नियोक्ता द्वारा अध्ययन अवकाश की संस्वीकृति सहित एनओसी।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  gap_certificate: {
    id: 'gap_certificate',
    label: { en: 'Gap Certificate / Affidavit', hi: 'गैप प्रमाण पत्र / शपथ पत्र' },
    hint: { en: 'Notarized affidavit on stamp paper explaining academic or career gap period.', hi: 'शैक्षणिक या व्यावसायिक अंतराल को स्पष्ट करने वाला नोटरीकृत शपथ पत्र।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
};

const yes = (v) => v === 'yes' || v === true;

/**
 * Dynamically computes the document checklist tailored specifically to the applicant's
 * scheme, category, disability status, academic level, and employment condition.
 */
export function getDocumentChecklist(schemeCode, data = {}) {
  const category = data.category || {};
  const academic = data.academic || {};
  const employment = data.employment_gap || {};
  const list = [];
  const add = (id, required = true) => {
    if (DOCUMENTS[id]) list.push({ ...DOCUMENTS[id], required });
  };

  // Common statutory identification documents
  add('photo');
  add('signature');
  add('class10_certificate');
  add('st_certificate');

  if (yes(category.isPVTG)) {
    add('pvtg_certificate');
  }

  if (yes(category.hasDisability) || yes(category.isDivyangjan)) {
    add('disability_certificate');
  }

  const s = String(schemeCode || '').toUpperCase();

  if (s === 'NFST' || s === 'NATIONAL FELLOWSHIP FOR ST STUDENTS') {
    // NFST Official Document Requirements
    add('pg_marksheet');
    if (academic.gradeType === 'cgpa' || academic.usesCGPA) {
      add('cgpa_conversion');
    }
    add('admission_letter');
  } else if (s === 'NOS' || s === 'NATIONAL OVERSEAS SCHOLARSHIP') {
    // NOS Official Document Requirements
    add('qualifying_degree');
    if (academic.gradeType === 'cgpa' || academic.usesCGPA) {
      add('cgpa_conversion');
    }
    add('foreign_admission_letter');

    if (yes(category.isOrphan)) {
      add('orphan_certificate');
    } else {
      add('family_income_proof');
    }

    if (yes(employment.isEmployed)) {
      add('employer_noc');
    }
    if (yes(employment.hasGap)) {
      add('gap_certificate');
    }
  }

  return list;
}
