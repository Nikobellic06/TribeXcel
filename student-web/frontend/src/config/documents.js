/*
 * Document catalogue.
 *
 * `digilocker` — when set, the student can fetch this document from DigiLocker
 *   (issuer + DigiLocker document type code). Photo, signature and letters
 *   issued by a school/university are not in DigiLocker, so they are manual only.
 * `aiAlias`   — the name the AI verification engine expects for this document.
 * `accept`    — allowed file types for manual upload. `maxKB` — size limit.
 */

const PDF_IMG = ['application/pdf', 'image/jpeg', 'image/png'];
const IMG = ['image/jpeg', 'image/png'];

export const DOCUMENTS = {
  photo: {
    id: 'photo',
    label: { en: 'Passport-size photograph', hi: 'पासपोर्ट आकार का फ़ोटो' },
    hint: { en: 'Recent colour photo, face clearly visible. JPG or PNG, up to 300 KB.', hi: 'हाल का रंगीन फ़ोटो, चेहरा साफ़ दिखे। JPG या PNG, अधिकतम 300 KB।' },
    accept: IMG,
    maxKB: 300,
    digilocker: null,
  },
  signature: {
    id: 'signature',
    label: { en: 'Signature', hi: 'हस्ताक्षर' },
    hint: { en: 'Sign in black or blue ink on white paper. JPG or PNG, up to 200 KB.', hi: 'सफ़ेद काग़ज़ पर काली या नीली स्याही से हस्ताक्षर। JPG या PNG, अधिकतम 200 KB।' },
    accept: IMG,
    maxKB: 200,
    digilocker: null,
  },
  st_certificate: {
    id: 'st_certificate',
    label: { en: 'Scheduled Tribe (ST) certificate', hi: 'अनुसूचित जनजाति (एसटी) प्रमाण पत्र' },
    hint: { en: 'Issued by the competent authority of your State/UT.', hi: 'आपके राज्य/संघ राज्य क्षेत्र के सक्षम प्राधिकारी द्वारा जारी।' },
    accept: PDF_IMG,
    maxKB: 1024,
    aiAlias: 'Caste Certificate',
    digilocker: { code: 'CSTCR', issuer: { en: 'State Revenue Department', hi: 'राज्य राजस्व विभाग' } },
  },
  pvtg_certificate: {
    id: 'pvtg_certificate',
    label: { en: 'PVTG certificate', hi: 'पीवीटीजी प्रमाण पत्र' },
    hint: { en: 'Only if you belong to a Particularly Vulnerable Tribal Group.', hi: 'केवल यदि आप विशेष रूप से कमजोर जनजातीय समूह से हैं।' },
    accept: PDF_IMG,
    maxKB: 1024,
    digilocker: { code: 'CSTCR', issuer: { en: 'State Revenue Department', hi: 'राज्य राजस्व विभाग' } },
  },
  income_certificate: {
    id: 'income_certificate',
    label: { en: 'Family income certificate', hi: 'पारिवारिक आय प्रमाण पत्र' },
    hint: { en: 'Issued by the notified authority (Tehsildar or equivalent). Self-declarations are not accepted.', hi: 'अधिसूचित प्राधिकारी (तहसीलदार या समकक्ष) द्वारा जारी। स्व-घोषणा मान्य नहीं है।' },
    accept: PDF_IMG,
    maxKB: 1024,
    aiAlias: 'Income Certificate',
    digilocker: { code: 'INCER', issuer: { en: 'State Revenue Department', hi: 'राज्य राजस्व विभाग' } },
  },
  domicile_certificate: {
    id: 'domicile_certificate',
    label: { en: 'Domicile certificate', hi: 'अधिवास (निवास) प्रमाण पत्र' },
    hint: { en: 'Decides which State/UT awards your scholarship.', hi: 'इससे तय होता है कि कौन-सा राज्य/संघ राज्य क्षेत्र छात्रवृत्ति देगा।' },
    accept: PDF_IMG,
    maxKB: 1024,
    digilocker: { code: 'DOMCR', issuer: { en: 'State Revenue Department', hi: 'राज्य राजस्व विभाग' } },
  },
  disability_certificate: {
    id: 'disability_certificate',
    label: { en: 'Disability certificate (UDID)', hi: 'दिव्यांगता प्रमाण पत्र (यूडीआईडी)' },
    hint: { en: 'Certified by a competent medical authority of the State/UT.', hi: 'राज्य/संघ राज्य क्षेत्र के सक्षम चिकित्सा प्राधिकारी द्वारा प्रमाणित।' },
    accept: PDF_IMG,
    maxKB: 1024,
    digilocker: { code: 'UDIDC', issuer: { en: 'Dept. of Empowerment of Persons with Disabilities', hi: 'दिव्यांगजन सशक्तिकरण विभाग' } },
  },
  class10_certificate: {
    id: 'class10_certificate',
    label: { en: 'Class 10 certificate (proof of date of birth)', hi: 'कक्षा 10 प्रमाण पत्र (जन्मतिथि का प्रमाण)' },
    hint: { en: 'Matriculation or equivalent pass certificate.', hi: 'मैट्रिक या समकक्ष उत्तीर्ण प्रमाण पत्र।' },
    accept: PDF_IMG,
    maxKB: 1024,
    digilocker: { code: 'SSCER', issuer: { en: 'School Board (CBSE / State Board)', hi: 'विद्यालय बोर्ड (सीबीएसई / राज्य बोर्ड)' } },
  },
  previous_marksheet: {
    id: 'previous_marksheet',
    label: { en: 'Marksheet of the last class passed', hi: 'पिछली उत्तीर्ण कक्षा की अंकतालिका' },
    hint: { en: 'Class VIII marksheet for Class IX, or Class IX marksheet for Class X.', hi: 'कक्षा IX हेतु कक्षा VIII की, या कक्षा X हेतु कक्षा IX की अंकतालिका।' },
    accept: PDF_IMG,
    maxKB: 1024,
    aiAlias: 'Latest Marksheet',
    digilocker: null,
  },
  school_bonafide: {
    id: 'school_bonafide',
    label: { en: 'School bonafide / enrolment certificate', hi: 'विद्यालय बोनाफ़ाइड / नामांकन प्रमाण पत्र' },
    hint: { en: 'Signed and stamped by the head of your school for session 2026-27.', hi: 'सत्र 2026-27 हेतु प्रधानाचार्य द्वारा हस्ताक्षरित एवं मुहरबंद।' },
    accept: PDF_IMG,
    maxKB: 1024,
    aiAlias: 'Admission Letter',
    digilocker: null,
  },
  ug_marksheet: {
    id: 'ug_marksheet',
    label: { en: "Bachelor's degree marksheet (all semesters)", hi: 'स्नातक डिग्री अंकतालिका (सभी सेमेस्टर)' },
    hint: { en: 'Aggregate marks in %, or CGPA with the university conversion formula.', hi: 'कुल अंक % में, या विश्वविद्यालय के रूपांतरण सूत्र सहित सीजीपीए।' },
    accept: PDF_IMG,
    maxKB: 2048,
    aiAlias: 'Latest Marksheet',
    digilocker: { code: 'DGMST', issuer: { en: 'University (National Academic Depository)', hi: 'विश्वविद्यालय (राष्ट्रीय शैक्षणिक निक्षेपागार)' } },
  },
  pg_marksheet: {
    id: 'pg_marksheet',
    label: { en: "Post-graduation (Master's) marksheet", hi: 'स्नातकोत्तर (मास्टर्स) अंकतालिका' },
    hint: { en: 'Aggregate marks in %, or CGPA with the university conversion formula.', hi: 'कुल अंक % में, या विश्वविद्यालय के रूपांतरण सूत्र सहित सीजीपीए।' },
    accept: PDF_IMG,
    maxKB: 2048,
    aiAlias: 'Latest Marksheet',
    digilocker: { code: 'DGMST', issuer: { en: 'University (National Academic Depository)', hi: 'विश्वविद्यालय (राष्ट्रीय शैक्षणिक निक्षेपागार)' } },
  },
  cgpa_conversion: {
    id: 'cgpa_conversion',
    label: { en: 'CGPA to percentage conversion formula', hi: 'सीजीपीए से प्रतिशत रूपांतरण सूत्र' },
    hint: { en: 'Issued and authenticated by your university.', hi: 'आपके विश्वविद्यालय द्वारा जारी एवं प्रमाणित।' },
    accept: PDF_IMG,
    maxKB: 1024,
    digilocker: null,
  },
  phd_certificate: {
    id: 'phd_certificate',
    label: { en: 'Ph.D degree / completion certificate', hi: 'पीएच.डी डिग्री / पूर्णता प्रमाण पत्र' },
    hint: { en: 'Required for post-doctoral research.', hi: 'पोस्ट-डॉक्टरल शोध हेतु आवश्यक।' },
    accept: PDF_IMG,
    maxKB: 2048,
    digilocker: { code: 'DGCER', issuer: { en: 'University (National Academic Depository)', hi: 'विश्वविद्यालय (राष्ट्रीय शैक्षणिक निक्षेपागार)' } },
  },
  admission_letter: {
    id: 'admission_letter',
    label: { en: 'Admission / joining certificate from the university', hi: 'विश्वविद्यालय से प्रवेश / कार्यभार ग्रहण प्रमाण पत्र' },
    hint: { en: 'For M.Phil, Ph.D or integrated M.Phil + Ph.D.', hi: 'एम.फिल, पीएच.डी या एकीकृत एम.फिल + पीएच.डी हेतु।' },
    accept: PDF_IMG,
    maxKB: 1024,
    aiAlias: 'Admission Letter',
    digilocker: null,
  },
  premier_offer_letter: {
    id: 'premier_offer_letter',
    label: { en: 'Offer letter from IIT / AIIMS / IIM / IISER', hi: 'आईआईटी / एम्स / आईआईएम / आईआईएसईआर से प्रस्ताव पत्र' },
    hint: { en: 'These applicants get priority under the scheme.', hi: 'इन आवेदकों को योजना में प्राथमिकता मिलती है।' },
    accept: PDF_IMG,
    maxKB: 1024,
    digilocker: null,
  },
  offer_letter: {
    id: 'offer_letter',
    label: { en: 'Offer of admission from the foreign university', hi: 'विदेशी विश्वविद्यालय से प्रवेश प्रस्ताव पत्र' },
    hint: { en: 'Unconditional offer preferred. Mention the QS rank in the academic step.', hi: 'बिना शर्त प्रस्ताव वरीय। क्यूएस रैंक शैक्षणिक चरण में भरें।' },
    accept: PDF_IMG,
    maxKB: 2048,
    aiAlias: 'Admission Letter',
    digilocker: null,
  },
};

const yes = (v) => v === 'yes';

/**
 * The document checklist for a scheme, adjusted to what the student has filled
 * in so far (for example the PVTG certificate appears only if they said PVTG).
 * Returns [{ ...document, required }].
 */
export function getDocumentChecklist(schemeId, data = {}) {
  const category = data.category || {};
  const academic = data.academic || {};
  const list = [];
  const add = (id, required = true) => list.push({ ...DOCUMENTS[id], required });

  add('photo');
  add('signature');
  add('st_certificate');

  if (schemeId === 'pre-matric') {
    add('domicile_certificate');
    if (!yes(category.isOrphan)) add('income_certificate');
    add('school_bonafide');
    add('previous_marksheet', false);
  }

  if (schemeId === 'nfst') {
    if (yes(category.isPVTG)) add('pvtg_certificate');
    add('class10_certificate');
    add('pg_marksheet');
    if (academic.gradeType === 'cgpa') add('cgpa_conversion');
    add('admission_letter');
    if (yes(academic.premierOffer)) add('premier_offer_letter');
  }

  if (schemeId === 'nos') {
    if (yes(category.isPVTG)) add('pvtg_certificate');
    if (!yes(category.isOrphan)) add('income_certificate');
    add('class10_certificate');
    if (academic.courseLevel === 'masters') add('ug_marksheet');
    else add('pg_marksheet');
    if (academic.courseLevel === 'postdoc') add('phd_certificate');
    if (academic.gradeType === 'cgpa') add('cgpa_conversion');
    add('offer_letter', academic.admissionStatus !== 'applied');
  }

  if (yes(category.hasDisability)) add('disability_certificate');

  return list;
}
