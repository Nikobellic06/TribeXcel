import { useMemo } from 'react';
import { BadgeCheck, SquarePen, TriangleAlert } from 'lucide-react';
import { useLang } from '../../../i18n/LanguageContext';
import { Checkbox } from '../../../components/ui/Field';
import Alert from '../../../components/ui/Alert';
import EligibilityPanel from '../../../components/apply/EligibilityPanel';
import { getDocumentChecklist } from '../../../config/documents';
import {
  GENDERS,
  GRADE_TYPES,
  NFST_COURSES,
  NFST_STREAMS,
  NOS_ADMISSION_STATUS,
  NOS_FIELDS,
  NOS_LEVELS,
  OCCUPATIONS,
  RESIDENCE_TYPES,
  SCHOOL_TYPES,
  UNIVERSITY_TYPES,
  YES_NO,
} from '../../../config/options';
import { STEPS } from '../../../config/steps';
import { formatDate, formatINR, maskAccount } from '../../../utils/format';

function Section({ title, onEdit, rows, editLabel }) {
  return (
    <section className="overflow-hidden rounded-md border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-2.5">
        <h3 className="text-[14px] font-bold text-navy">{title}</h3>
        {onEdit && (
          <button type="button" onClick={onEdit} className="no-print inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:underline">
            <SquarePen className="h-3.5 w-3.5" aria-hidden="true" />
            {editLabel}
          </button>
        )}
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2">
        {rows
          .filter(([, value]) => value !== null && value !== undefined && value !== '')
          .map(([label, value]) => (
            <div key={label} className="border-b border-line px-4 py-2.5 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
              <dt className="text-[12px] text-muted">{label}</dt>
              <dd className="mt-0.5 break-words text-[13.5px] font-medium text-ink">{value}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}

export default function ReviewStep({ scheme, data, errors, setDeclaration, goTo, checks, incompleteSteps, blocked }) {
  const { t, tx, lang } = useLang();
  const p = data.personal || {};
  const c = data.category || {};
  const a = data.academic || {};
  const b = data.bank || {};
  const docs = data.documents || {};
  const d = data.declarations || {};

  const opt = (options, value) => {
    const found = options.find((o) => o.value === value);
    return found ? tx(found.label) : value;
  };
  const yn = (v) => (v ? opt(YES_NO, v) : '');
  const marks = a.gradeType === 'cgpa' ? `${a.cgpa} CGPA (${a.convertedPercentage}%)` : a.percentage ? `${a.percentage}%` : '';

  const academicRows = useMemo(() => {
    if (scheme.academicForm === 'school') {
      return [
        [tx({ en: 'Class', hi: 'कक्षा' }), a.className],
        [tx({ en: 'Day scholar / hosteller', hi: 'दिवा छात्र / छात्रावासी' }), opt(RESIDENCE_TYPES, a.residence)],
        [tx({ en: 'School', hi: 'विद्यालय' }), a.schoolName],
        [tx({ en: 'U-DISE code', hi: 'यू-डाइस कोड' }), a.udiseCode],
        [tx({ en: 'Type of school', hi: 'विद्यालय का प्रकार' }), opt(SCHOOL_TYPES, a.schoolType)],
        [tx({ en: 'Board', hi: 'बोर्ड' }), a.board],
        [tx({ en: 'School location', hi: 'विद्यालय का स्थान' }), [a.schoolDistrict, a.schoolState].filter(Boolean).join(', ')],
        [tx({ en: 'Previous class marks', hi: 'पिछली कक्षा के अंक' }), a.previousClassPercent ? `${a.previousClassPercent}% (${a.previousClassYear})` : ''],
        [tx({ en: 'Repeating class', hi: 'कक्षा दोहरा रहे' }), yn(a.repeatingClass)],
        [tx({ en: 'Other scholarship', hi: 'अन्य छात्रवृत्ति' }), yn(a.otherScholarship)],
      ];
    }
    if (scheme.academicForm === 'research') {
      return [
        [tx({ en: 'Course', hi: 'पाठ्यक्रम' }), opt(NFST_COURSES, a.courseLevel)],
        [tx({ en: 'Stream', hi: 'संकाय' }), opt(NFST_STREAMS, a.stream)],
        [tx({ en: 'Subject', hi: 'विषय' }), a.subject],
        [tx({ en: 'Research topic', hi: 'शोध विषय' }), a.researchTopic],
        [tx({ en: 'University', hi: 'विश्वविद्यालय' }), a.universityName],
        [tx({ en: 'University type', hi: 'विश्वविद्यालय का प्रकार' }), opt(UNIVERSITY_TYPES, a.universityType)],
        [tx({ en: 'Admission date', hi: 'प्रवेश तिथि' }), formatDate(a.admissionDate, lang)],
        [tx({ en: 'Accommodation', hi: 'आवास' }), a.accommodation === 'hostel' ? tx({ en: 'University hostel', hi: 'विश्वविद्यालय छात्रावास' }) : a.accommodation ? tx({ en: 'Own arrangement (HRA)', hi: 'स्वयं की व्यवस्था (एचआरए)' }) : ''],
        [tx({ en: 'Post-graduation', hi: 'स्नातकोत्तर' }), [a.pgDegree, a.pgUniversity, a.pgYear].filter(Boolean).join(', ')],
        [tx({ en: 'PG marks', hi: 'स्नातकोत्तर अंक' }), marks],
        [tx({ en: 'Other fellowship', hi: 'अन्य फेलोशिप' }), yn(a.otherFellowship)],
      ];
    }
    return [
      [tx({ en: 'Level', hi: 'स्तर' }), opt(NOS_LEVELS, a.courseLevel)],
      [tx({ en: 'Field', hi: 'क्षेत्र' }), opt(NOS_FIELDS, a.fieldOfStudy)],
      [tx({ en: 'Course', hi: 'पाठ्यक्रम' }), a.courseName],
      [tx({ en: 'University', hi: 'विश्वविद्यालय' }), [a.universityName, a.city, a.country].filter(Boolean).join(', ')],
      [tx({ en: 'QS rank', hi: 'क्यूएस रैंक' }), a.qsRank],
      [tx({ en: 'Admission status', hi: 'प्रवेश की स्थिति' }), opt(NOS_ADMISSION_STATUS, a.admissionStatus)],
      [tx({ en: 'Duration', hi: 'अवधि' }), a.courseDurationMonths ? tx({ en: `${a.courseDurationMonths} months`, hi: `${a.courseDurationMonths} माह` }) : ''],
      [tx({ en: 'Qualifying degree', hi: 'योग्यता डिग्री' }), [a.qualifyingDegree, a.qualifyingUniversity, a.qualifyingYear].filter(Boolean).join(', ')],
      [tx({ en: 'Marks', hi: 'अंक' }), marks],
      [tx({ en: 'Result type', hi: 'परिणाम का प्रकार' }), opt(GRADE_TYPES, a.gradeType)],
      [tx({ en: 'Test scores', hi: 'परीक्षा अंक' }), a.testScores],
      [tx({ en: 'Currently employed', hi: 'वर्तमान में कार्यरत' }), yn(a.isEmployed)],
      [tx({ en: 'Employer details', hi: 'नियोक्ता विवरण' }), a.isEmployed === 'yes' ? [a.employerName, a.designation].filter(Boolean).join(' - ') : ''],
      [tx({ en: 'Academic gap > 6 months', hi: 'शैक्षणिक अंतराल > 6 माह' }), yn(a.hasAcademicGap)],
      [tx({ en: 'Sibling received award', hi: 'भाई/बहन को छात्रवृत्ति मिली' }), yn(a.siblingAvailed)],
      [tx({ en: 'Received award before', hi: 'पहले छात्रवृत्ति मिली' }), yn(a.previousAward)],
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, scheme.academicForm, lang]);

  const checklist = getDocumentChecklist(scheme.id, data);
  const editLabel = t('common.edit');

  const singleText =
    scheme.id === 'nfst'
      ? { en: 'I am not receiving any other fellowship, or I will give it up and refund it if selected.', hi: 'मुझे कोई अन्य फेलोशिप नहीं मिल रही है, या चयन होने पर मैं उसे छोड़कर राशि लौटा दूँगा/दूँगी।' }
      : { en: 'I am not receiving any other scholarship or stipend for the same course from any government source.', hi: 'मुझे इसी पाठ्यक्रम हेतु किसी सरकारी स्रोत से कोई अन्य छात्रवृत्ति या वजीफ़ा नहीं मिल रहा है।' };

  return (
    <div className="space-y-6">
      {incompleteSteps.length > 0 && (
        <Alert tone="error" title={tx({ en: 'Some steps are incomplete', hi: 'कुछ चरण अधूरे हैं' })}>
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            {incompleteSteps.map((key) => (
              <button key={key} type="button" onClick={() => goTo(key)} className="font-semibold text-navy underline-offset-2 hover:underline">
                {t(STEPS.find((s) => s.key === key).labelKey)}
              </button>
            ))}
          </span>
        </Alert>
      )}

      <EligibilityPanel checks={checks} detailed />
      {blocked && (
        <Alert tone="error" title={tx({ en: 'You cannot submit this application yet', hi: 'आप अभी यह आवेदन जमा नहीं कर सकते' })}>
          {tx({
            en: 'One or more scheme criteria are not met based on what you entered. If a value is wrong, correct it in the relevant step.',
            hi: 'आपके द्वारा भरे विवरण अनुसार योजना का एक या अधिक मानदंड पूरा नहीं होता। यदि कोई विवरण गलत है, तो संबंधित चरण में सुधारें।',
          })}
        </Alert>
      )}

      <Section
        title={t('step.personal')}
        onEdit={() => goTo('personal')}
        editLabel={editLabel}
        rows={[
          [tx({ en: 'Full name', hi: 'पूरा नाम' }), p.fullName],
          [tx({ en: 'Date of birth', hi: 'जन्मतिथि' }), formatDate(p.dob, lang)],
          [tx({ en: 'Gender', hi: 'लिंग' }), opt(GENDERS, p.gender)],
          [tx({ en: "Father's name", hi: 'पिता का नाम' }), p.fatherName],
          [tx({ en: "Mother's name", hi: 'माता का नाम' }), p.motherName],
          [tx({ en: 'Mobile', hi: 'मोबाइल' }), [p.mobile, p.altMobile].filter(Boolean).join(', ')],
          [tx({ en: 'Email', hi: 'ईमेल' }), p.email],
          [tx({ en: 'Address', hi: 'पता' }), [p.addressLine, p.district, p.state, p.pincode].filter(Boolean).join(', ')],
        ]}
      />

      <Section
        title={t('step.category')}
        onEdit={() => goTo('category')}
        editLabel={editLabel}
        rows={[
          [tx({ en: 'Category', hi: 'श्रेणी' }), tx({ en: 'Scheduled Tribe', hi: 'अनुसूचित जनजाति' })],
          [tx({ en: 'Tribe', hi: 'जनजाति' }), c.tribeName],
          [tx({ en: 'ST certificate', hi: 'एसटी प्रमाण पत्र' }), [c.stCertificateNo, c.stIssuingAuthority, formatDate(c.stIssueDate, lang)].filter(Boolean).join(', ')],
          [tx({ en: 'Domicile State/UT', hi: 'अधिवास राज्य' }), c.domicileState],
          [tx({ en: 'PVTG', hi: 'पीवीटीजी' }), yn(c.isPVTG)],
          [tx({ en: 'Disability', hi: 'दिव्यांगता' }), c.hasDisability === 'yes' ? `${yn('yes')}, ${c.disabilityPercent}%` : yn(c.hasDisability)],
          [tx({ en: 'Orphan', hi: 'अनाथ' }), yn(c.isOrphan)],
          [tx({ en: "Parents' occupation", hi: 'माता-पिता का व्यवसाय' }), [opt(OCCUPATIONS, c.fatherOccupation), opt(OCCUPATIONS, c.motherOccupation)].filter(Boolean).join(' / ')],
          [tx({ en: 'Annual family income', hi: 'वार्षिक पारिवारिक आय' }), c.familyIncome && c.isOrphan !== 'yes' ? formatINR(c.familyIncome) : ''],
          [tx({ en: 'Income certificate', hi: 'आय प्रमाण पत्र' }), c.isOrphan !== 'yes' ? [c.incomeCertificateNo, formatDate(c.incomeCertificateDate, lang)].filter(Boolean).join(', ') : ''],
        ]}
      />

      <Section title={t('step.academic')} onEdit={() => goTo('academic')} editLabel={editLabel} rows={academicRows} />

      <Section
        title={t('step.bank')}
        onEdit={() => goTo('bank')}
        editLabel={editLabel}
        rows={[
          [tx({ en: 'Account holder', hi: 'खाताधारक' }), b.accountHolder],
          [tx({ en: 'Account number', hi: 'खाता संख्या' }), maskAccount(b.accountNumber)],
          ['IFSC', b.ifsc],
          [tx({ en: 'Bank and branch', hi: 'बैंक एवं शाखा' }), [b.bankName, b.branchName].filter(Boolean).join(', ')],
          [tx({ en: 'Aadhaar seeded', hi: 'आधार से जुड़ा' }), b.aadhaarSeeded === 'yes' ? t('common.yes') : ''],
        ]}
      />

      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-2.5">
          <h3 className="text-[14px] font-bold text-navy">{t('step.documents')}</h3>
          <button type="button" onClick={() => goTo('documents')} className="no-print inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:underline">
            <SquarePen className="h-3.5 w-3.5" aria-hidden="true" />
            {editLabel}
          </button>
        </div>
        <ul className="divide-y divide-line">
          {checklist.map((doc) => {
            const rec = docs[doc.id];
            return (
              <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
                <span className="text-ink">{tx(doc.label)}</span>
                {rec ? (
                  <div className="flex items-center gap-2">
                    {rec.aiVerification?.preliminaryStatus === 'VERIFIED' && (
                      <span className="hidden sm:inline-flex items-center gap-1 rounded bg-leaf-soft px-2 py-0.5 text-[11px] font-semibold text-leaf border border-leaf/25">
                        <BadgeCheck className="h-3 w-3" />
                        {tx({ en: 'Preliminary Validated', hi: 'प्रारंभिक रूप से सत्यापित' })}
                      </span>
                    )}
                    <span className={`inline-flex shrink-0 items-center gap-1 font-semibold ${rec.source === 'digilocker' ? 'text-leaf' : 'text-navy'}`}>
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      {rec.source === 'digilocker' ? 'DigiLocker' : tx({ en: 'Uploaded', hi: 'अपलोड' })}
                    </span>
                  </div>
                ) : (
                  <span className={`inline-flex shrink-0 items-center gap-1 ${doc.required ? 'font-semibold text-alert' : 'text-muted'}`}>
                    {doc.required && <TriangleAlert className="h-4 w-4" aria-hidden="true" />}
                    {doc.required ? tx({ en: 'Missing', hi: 'अनुपलब्ध' }) : t('common.optional')}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-serif text-[17px] font-bold text-navy">{tx({ en: 'Declaration', hi: 'घोषणा' })}</h3>
        <Checkbox id="decl-truthful" checked={d.truthful} invalid={Boolean(errors.truthful)} onChange={(v) => setDeclaration('truthful', v)}>
          {tx({
            en: 'I declare that the information given in this application is true. If any of it is found false, the scholarship may be cancelled and the full amount recovered with interest.',
            hi: 'मैं घोषणा करता/करती हूँ कि इस आवेदन में दी गई जानकारी सत्य है। कोई जानकारी असत्य पाए जाने पर छात्रवृत्ति रद्द की जा सकती है और पूरी राशि ब्याज सहित वसूल की जा सकती है।',
          })}
        </Checkbox>
        <Checkbox id="decl-consent" checked={d.consent} invalid={Boolean(errors.consent)} onChange={(v) => setDeclaration('consent', v)}>
          {tx({
            en: 'I consent to Aadhaar-based authentication and to my details and documents being shared with the verifying school / university, State and Ministry officials for this scholarship.',
            hi: 'मैं आधार-आधारित प्रमाणीकरण तथा इस छात्रवृत्ति हेतु अपने विवरण और दस्तावेज़ सत्यापनकर्ता विद्यालय / विश्वविद्यालय, राज्य एवं मंत्रालय के अधिकारियों से साझा किए जाने की सहमति देता/देती हूँ।',
          })}
        </Checkbox>
        <Checkbox id="decl-single" checked={d.singleScholarship} invalid={Boolean(errors.singleScholarship)} onChange={(v) => setDeclaration('singleScholarship', v)}>
          {tx(singleText)}
        </Checkbox>
      </section>
    </div>
  );
}
