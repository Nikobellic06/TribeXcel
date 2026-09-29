/**
 * Official Ministry of Tribal Affairs (MoTA) Document Configuration
 * Session: 2026-27 (Version: 2026.1)
 * Canonical Document Checklist Engine for all 5 MoTA Schemes
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
    hint: { en: 'Income Certificate from Executive Magistrate/Tehsildar or ITR Form 16 of earning family members.', hi: 'सक्षम कार्यपालक मजिस्ट्रेट/तहसीलदार द्वारा जारी आय प्रमाण पत्र।' },
    accept: PDF_OR_IMAGE,
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
  domicile_certificate: {
    id: 'domicile_certificate',
    label: { en: 'Domicile / Residential Certificate', hi: 'मूल निवास / अधिवास प्रमाण पत्र' },
    hint: { en: 'Domicile Certificate issued by competent Revenue Authority (Tehsildar/SDM).', hi: 'सक्षम राजस्व प्राधिकारी द्वारा जारी मूल निवास प्रमाण पत्र।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: { code: 'DOMCR', issuer: { en: 'State Revenue / e-District Department', hi: 'राज्य राजस्व / ई-डिस्ट्रिक्ट विभाग' } },
  },
  bonafide_certificate: {
    id: 'bonafide_certificate',
    label: { en: 'Institute Bonafide Certificate', hi: 'संस्थान बोनाफाइड प्रमाण पत्र' },
    hint: { en: 'Current bonafide certificate issued by Head of Institution verifying enrollment.', hi: 'संस्थान प्रमुख द्वारा जारी चालू सत्र का बोनाफाइड प्रमाण पत्र।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  fee_receipt: {
    id: 'fee_receipt',
    label: { en: 'Official Institute Fee Receipt / Structure', hi: 'संस्थान शुल्क रसीद / शुल्क संरचना' },
    hint: { en: 'Official fee breakdown and payment receipt for current academic year.', hi: 'चालू शैक्षणिक वर्ष का आधिकारिक शुल्क विवरण एवं भुगतान रसीद।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: null,
  },
  bank_passbook: {
    id: 'bank_passbook',
    label: { en: 'Bank Passbook / Cancelled Cheque', hi: 'बैंक पासबुक / रद्द चेक' },
    hint: { en: 'First page of bank passbook or cancelled cheque clearly showing Account Number and IFSC.', hi: 'बैंक पासबुक का प्रथम पृष्ठ या रद्द चेक जिसमें खाता संख्या एवं आईएफएससी स्पष्ट हो।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: null,
  },
  last_passing_marksheet: {
    id: 'last_passing_marksheet',
    label: { en: 'Last Passing Semester / Annual Marksheet', hi: 'अंतिम उत्तीर्ण सत्र की अंकतालिका' },
    hint: { en: 'Official marksheet of the most recently completed academic year/semester.', hi: 'अंतिम उत्तीर्ण वर्ष या सेमेस्टर की आधिकारिक अंकतालिका।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  visa_and_studentid: {
    id: 'visa_and_studentid',
    label: { en: 'Student Visa & Foreign University ID', hi: 'विद्यार्थी वीज़ा एवं विदेशी विश्वविद्यालय पहचान पत्र' },
    hint: { en: 'Copy of valid student visa and foreign institution student identity card.', hi: 'वैध छात्र वीज़ा एवं विदेशी संस्थान के पहचान पत्र की प्रति।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: null,
  },
  joining_letter: {
    id: 'joining_letter',
    label: { en: 'Department Joining Letter', hi: 'विभाग कार्यभार ग्रहण पत्र' },
    hint: { en: 'Official joining certificate from academic department abroad.', hi: 'विदेशी शैक्षणिक विभाग से कार्यभार ग्रहण प्रमाण पत्र।' },
    accept: PDF_ONLY,
    maxKB: 2048,
    digilocker: null,
  },
  class12_marksheet: {
    id: 'class12_marksheet',
    label: { en: 'Class 12 Senior Secondary Marksheet', hi: 'कक्षा 12 समेकित अंकतालिका' },
    hint: { en: 'Higher Secondary / Intermediate passing certificate and marksheet. PDF/JPG up to 2 MB.', hi: 'उच्च माध्यमिक / इंटरमीडिएट उत्तीर्ण प्रमाण पत्र एवं अंकतालिका।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: { code: '12CR', issuer: { en: 'CBSE / CISCE / State Education Board', hi: 'सीबीएसई / राज्य विद्यालय बोर्ड' } },
  },
  other_document: {
    id: 'other_document',
    label: { en: 'Additional Supporting Document', hi: 'अतिरिक्त सहायक दस्तावेज़' },
    hint: { en: 'Any additional certificate, affidavit, or recommendation letter supporting your application. PDF/JPG up to 2 MB.', hi: 'कोई भी अतिरिक्त प्रमाण पत्र, शपथ पत्र या अनुशंसा पत्र।' },
    accept: PDF_OR_IMAGE,
    maxKB: 2048,
    digilocker: { code: 'OTHER', issuer: { en: 'Authorized Issuing Authority', hi: 'अधिकृत जारीकर्ता प्राधिकरण' } },
  },
};

const yes = (v) => v === 'yes' || v === true;

/**
 * Dynamically computes the document checklist tailored specifically to the applicant's
 * scheme, application type (Fresh vs Renewal), and conditional profile flags.
 */
export function getDocumentChecklist(schemeCode, data = {}) {
  const category = data.category || {};
  const academic = data.academic || {};
  const employment = data.employment_gap || {};
  const appType = (data.applicationType || 'FRESH').toUpperCase();
  const list = [];
  const added = new Set();

  const add = (id, required = true) => {
    if (DOCUMENTS[id] && !added.has(id)) {
      added.add(id);
      list.push({ ...DOCUMENTS[id], required });
    }
  };

  const s = String(schemeCode || '').toUpperCase().replace(/-/g, '_');

  // Common statutory identification documents
  add('photo', true);
  add('signature', true);

  if (s === 'PRE_MATRIC') {
    add('st_certificate', true);
    add('class10_certificate', true);
    if (yes(category.isOrphan)) {
      add('orphan_certificate', true);
    } else {
      add('family_income_proof', true);
    }
    add('domicile_certificate', true);
    if (yes(category.isPVTG)) add('pvtg_certificate', true);
    if (yes(category.hasDisability)) add('disability_certificate', true);
  } else if (s === 'POST_MATRIC') {
    add('st_certificate', true);
    add('class10_certificate', true);
    if (yes(category.isOrphan)) {
      add('orphan_certificate', true);
    } else {
      add('family_income_proof', true);
    }
    add('domicile_certificate', true);
    if (yes(category.isPVTG)) add('pvtg_certificate', true);
    if (yes(category.hasDisability)) add('disability_certificate', true);
  } else if (s === 'TOP_CLASS') {
    if (appType === 'RENEWAL') {
      add('last_passing_marksheet', true);
      add('bonafide_certificate', true);
      add('fee_receipt', true);
      add('bank_passbook', true);
    } else {
      // FRESH
      add('st_certificate', true);
      add('class10_certificate', true);
      if (yes(category.isOrphan)) {
        add('orphan_certificate', true);
      } else {
        add('family_income_proof', true);
      }
      add('bonafide_certificate', true);
      add('fee_receipt', true);
      add('bank_passbook', true);
    }
    if (yes(category.isPVTG)) add('pvtg_certificate', true);
    if (yes(category.hasDisability)) add('disability_certificate', true);
  } else if (s === 'NFST') {
    add('st_certificate', true);
    add('class10_certificate', true);
    add('pg_marksheet', true);
    add('admission_letter', true);
    if (academic.gradeType === 'cgpa' || academic.usesCGPA) {
      add('cgpa_conversion', true);
    }
    if (yes(category.isPVTG)) add('pvtg_certificate', true);
    if (yes(category.hasDisability)) add('disability_certificate', true);
  } else if (s === 'NOS') {
    add('st_certificate', true);
    add('class10_certificate', true);
    add('qualifying_degree', true);
    add('foreign_admission_letter', true);
    if (yes(category.isOrphan)) {
      add('orphan_certificate', true);
    } else {
      add('family_income_proof', true);
    }
    if (academic.gradeType === 'cgpa' || academic.usesCGPA) {
      add('cgpa_conversion', true);
    }
    if (yes(academic.hasJoinedForeignUniversity)) {
      add('visa_and_studentid', true);
      add('joining_letter', true);
    }
    if (yes(employment.isEmployed)) {
      add('employer_noc', true);
    }
    if (yes(employment.hasGap)) {
      add('gap_certificate', true);
    }
    if (yes(category.isPVTG)) add('pvtg_certificate', true);
    if (yes(category.hasDisability)) add('disability_certificate', true);
  } else {
    // Fallback default
    add('st_certificate', true);
    add('class10_certificate', true);
    add('family_income_proof', true);
  }

  return list;
}
