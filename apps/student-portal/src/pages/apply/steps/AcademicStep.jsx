import { useLang } from '../../../i18n/LanguageContext';
import { Field, FormSection, TextInput, SelectInput, RadioGroup, binder } from '../../../components/ui/Field';
import Alert from '../../../components/ui/Alert';
import {
  COUNTRIES,
  GRADE_TYPES,
  NFST_COURSES,
  NFST_STREAMS,
  NOS_ADMISSION_STATUS,
  NOS_FIELDS,
  NOS_LEVELS,
  RESIDENCE_TYPES,
  SCHOOL_BOARDS,
  SCHOOL_TYPES,
  STATES,
  UNIVERSITY_TYPES,
  YES_NO,
} from '../../../config/options';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => String(CURRENT_YEAR - i));
const digits = (n) => (v) => v.replace(/\D/g, '').slice(0, n);
const decimal = (v) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6);

/* Marks block shared by NFST and NOS: percentage, or CGPA + converted %. */
function MarksFields({ bind, values, errors, tx, labelPrefix }) {
  return (
    <>
      <Field label={tx({ en: 'Result given as', hi: 'परिणाम का प्रकार' })} required htmlFor="gradeType" error={errors.gradeType}>
        <RadioGroup {...bind('gradeType')} options={GRADE_TYPES} />
      </Field>
      {values.gradeType === 'cgpa' ? (
        <>
          <Field label={tx({ en: `${labelPrefix} CGPA`.trim(), hi: `${labelPrefix} सीजीपीए`.trim() })} required htmlFor="cgpa" error={errors.cgpa}>
            <TextInput {...bind('cgpa')} transform={decimal} inputMode="decimal" placeholder="8.2" />
          </Field>
          <Field
            label={tx({ en: 'Equivalent percentage', hi: 'समकक्ष प्रतिशत' })}
            required
            htmlFor="convertedPercentage"
            error={errors.convertedPercentage}
            hint={tx({ en: "Use your university's official conversion formula. You will upload the formula with your documents.", hi: 'अपने विश्वविद्यालय का आधिकारिक रूपांतरण सूत्र उपयोग करें। सूत्र दस्तावेज़ों के साथ अपलोड करना होगा।' })}
          >
            <TextInput {...bind('convertedPercentage')} transform={decimal} inputMode="decimal" />
          </Field>
        </>
      ) : (
        <Field label={tx({ en: `${labelPrefix} aggregate %`.trim(), hi: `${labelPrefix} कुल %`.trim() })} required htmlFor="percentage" error={errors.percentage} hint={tx({ en: 'Aggregate of all semesters / years.', hi: 'सभी सेमेस्टर / वर्षों का कुल।' })}>
          <TextInput {...bind('percentage')} transform={decimal} inputMode="decimal" />
        </Field>
      )}
    </>
  );
}

function SchoolForm({ bind, values, errors, tx }) {
  return (
    <div className="space-y-8">
      <FormSection title={tx({ en: 'Current class and school', hi: 'वर्तमान कक्षा एवं विद्यालय' })}>
        <Field label={tx({ en: 'Class', hi: 'कक्षा' })} required htmlFor="className" error={errors.className}>
          <RadioGroup
            {...bind('className')}
            options={[
              { value: 'IX', label: { en: 'Class IX', hi: 'कक्षा IX' } },
              { value: 'X', label: { en: 'Class X', hi: 'कक्षा X' } },
            ]}
          />
        </Field>
        <Field label={tx({ en: 'Day scholar or hosteller', hi: 'दिवा छात्र या छात्रावासी' })} required htmlFor="residence" error={errors.residence} hint={tx({ en: 'Hostellers get a higher monthly amount.', hi: 'छात्रावासी छात्रों को अधिक मासिक राशि मिलती है।' })}>
          <RadioGroup {...bind('residence')} options={RESIDENCE_TYPES} />
        </Field>
        <Field label={tx({ en: 'School name', hi: 'विद्यालय का नाम' })} required htmlFor="schoolName" error={errors.schoolName} className="md:col-span-2">
          <TextInput {...bind('schoolName')} />
        </Field>
        <Field label={tx({ en: 'School U-DISE code', hi: 'विद्यालय यू-डाइस कोड' })} required htmlFor="udiseCode" error={errors.udiseCode} hint={tx({ en: '11-digit code. Ask your school office if you do not know it.', hi: '11 अंकों का कोड। पता न हो तो विद्यालय कार्यालय से पूछें।' })}>
          <TextInput {...bind('udiseCode')} transform={digits(11)} inputMode="numeric" />
        </Field>
        <Field label={tx({ en: 'Type of school', hi: 'विद्यालय का प्रकार' })} required htmlFor="schoolType" error={errors.schoolType}>
          <SelectInput {...bind('schoolType')} options={SCHOOL_TYPES} />
        </Field>
        <Field label={tx({ en: 'Board', hi: 'बोर्ड' })} required htmlFor="board" error={errors.board}>
          <SelectInput {...bind('board')} options={SCHOOL_BOARDS} />
        </Field>
        <Field label={tx({ en: 'School state', hi: 'विद्यालय का राज्य' })} required htmlFor="schoolState" error={errors.schoolState}>
          <SelectInput {...bind('schoolState')} options={STATES} />
        </Field>
        <Field label={tx({ en: 'School district', hi: 'विद्यालय का जिला' })} required htmlFor="schoolDistrict" error={errors.schoolDistrict}>
          <TextInput {...bind('schoolDistrict')} />
        </Field>
      </FormSection>

      <FormSection title={tx({ en: 'Previous class', hi: 'पिछली कक्षा' })}>
        <Field label={tx({ en: 'Marks in last class passed (%)', hi: 'पिछली उत्तीर्ण कक्षा में अंक (%)' })} required htmlFor="previousClassPercent" error={errors.previousClassPercent}>
          <TextInput {...bind('previousClassPercent')} transform={decimal} inputMode="decimal" />
        </Field>
        <Field label={tx({ en: 'Year of passing', hi: 'उत्तीर्ण वर्ष' })} required htmlFor="previousClassYear" error={errors.previousClassYear}>
          <SelectInput {...bind('previousClassYear')} options={YEARS.slice(0, 4)} />
        </Field>
        <Field label={tx({ en: 'Are you repeating the same class this year?', hi: 'क्या आप इस वर्ष उसी कक्षा को दोहरा रहे हैं?' })} required htmlFor="repeatingClass" error={errors.repeatingClass}>
          <RadioGroup {...bind('repeatingClass')} options={YES_NO} />
        </Field>
        <Field label={tx({ en: 'Are you getting any other scholarship?', hi: 'क्या आपको कोई अन्य छात्रवृत्ति मिल रही है?' })} required htmlFor="otherScholarship" error={errors.otherScholarship}>
          <RadioGroup {...bind('otherScholarship')} options={YES_NO} />
        </Field>
      </FormSection>
      {(values.repeatingClass === 'yes' || values.otherScholarship === 'yes') && (
        <Alert tone="error" title={tx({ en: 'Not eligible as filled', hi: 'भरे गए विवरण अनुसार पात्र नहीं' })}>
          {tx({ en: 'The scholarship is not given for a repeated class or alongside another scholarship.', hi: 'दोहराई गई कक्षा या किसी अन्य छात्रवृत्ति के साथ यह छात्रवृत्ति नहीं दी जाती।' })}
        </Alert>
      )}
    </div>
  );
}

function ResearchForm({ bind, values, errors, tx }) {
  return (
    <div className="space-y-8">
      <FormSection title={tx({ en: 'Research programme', hi: 'शोध कार्यक्रम' })}>
        <Field label={tx({ en: 'Course', hi: 'पाठ्यक्रम' })} required htmlFor="courseLevel" error={errors.courseLevel}>
          <SelectInput {...bind('courseLevel')} options={NFST_COURSES} />
        </Field>
        <Field label={tx({ en: 'Stream', hi: 'संकाय' })} required htmlFor="stream" error={errors.stream} hint={tx({ en: 'Decides the contingency grant.', hi: 'इससे आकस्मिक अनुदान तय होता है।' })}>
          <SelectInput {...bind('stream')} options={NFST_STREAMS} />
        </Field>
        <Field label={tx({ en: 'Subject / department', hi: 'विषय / विभाग' })} required htmlFor="subject" error={errors.subject}>
          <TextInput {...bind('subject')} />
        </Field>
        <Field label={tx({ en: 'Research topic', hi: 'शोध विषय' })} optional htmlFor="researchTopic">
          <TextInput {...bind('researchTopic')} />
        </Field>
        <Field label={tx({ en: 'University / institute', hi: 'विश्वविद्यालय / संस्थान' })} required htmlFor="universityName" error={errors.universityName} className="md:col-span-2">
          <TextInput {...bind('universityName')} />
        </Field>
        <Field label={tx({ en: 'Type of university', hi: 'विश्वविद्यालय का प्रकार' })} required htmlFor="universityType" error={errors.universityType}>
          <SelectInput {...bind('universityType')} options={UNIVERSITY_TYPES} />
        </Field>
        <Field label={tx({ en: 'AISHE code', hi: 'एआईएसएचई कोड' })} optional htmlFor="aisheCode" hint="U-0123 / C-12345">
          <TextInput {...bind('aisheCode')} transform={(v) => v.toUpperCase().slice(0, 10)} />
        </Field>
        <Field label={tx({ en: 'Date of admission / registration', hi: 'प्रवेश / पंजीकरण की तिथि' })} required htmlFor="admissionDate" error={errors.admissionDate} hint={tx({ en: 'Course duration is counted from this date.', hi: 'पाठ्यक्रम अवधि इसी तिथि से गिनी जाती है।' })}>
          <TextInput {...bind('admissionDate')} type="date" />
        </Field>
        <Field label={tx({ en: 'Accommodation', hi: 'आवास' })} required htmlFor="accommodation" error={errors.accommodation} hint={tx({ en: 'HRA is paid only if the university does not give you hostel.', hi: 'मकान किराया भत्ता तभी मिलता है जब विश्वविद्यालय छात्रावास न दे।' })}>
          <RadioGroup
            {...bind('accommodation')}
            options={[
              { value: 'hostel', label: { en: 'University hostel', hi: 'विश्वविद्यालय छात्रावास' } },
              { value: 'own', label: { en: 'Own arrangement (HRA)', hi: 'स्वयं की व्यवस्था (एचआरए)' } },
            ]}
          />
        </Field>
      </FormSection>

      <FormSection title={tx({ en: 'Post-graduation', hi: 'स्नातकोत्तर' })} description={tx({ en: 'Merit is decided by post-graduation marks. At least 55% is needed.', hi: 'मेरिट स्नातकोत्तर अंकों से तय होती है। न्यूनतम 55% आवश्यक है।' })}>
        <Field label={tx({ en: 'Degree', hi: 'डिग्री' })} required htmlFor="pgDegree" error={errors.pgDegree} hint="M.A., M.Sc., M.Tech., M.Com.">
          <TextInput {...bind('pgDegree')} />
        </Field>
        <Field label={tx({ en: 'University', hi: 'विश्वविद्यालय' })} required htmlFor="pgUniversity" error={errors.pgUniversity}>
          <TextInput {...bind('pgUniversity')} />
        </Field>
        <Field label={tx({ en: 'Year of passing', hi: 'उत्तीर्ण वर्ष' })} required htmlFor="pgYear" error={errors.pgYear}>
          <SelectInput {...bind('pgYear')} options={YEARS} />
        </Field>
        <MarksFields bind={bind} values={values} errors={errors} tx={tx} labelPrefix={tx({ en: 'PG', hi: 'स्नातकोत्तर' })} />
      </FormSection>

      <FormSection title={tx({ en: 'Other declarations', hi: 'अन्य घोषणाएँ' })}>
        <Field label={tx({ en: 'Are you getting any other fellowship or scholarship currently?', hi: 'क्या आपको अभी कोई अन्य फेलोशिप या छात्रवृत्ति मिल रही है?' })} required htmlFor="otherFellowship" error={errors.otherFellowship} hint={tx({ en: 'Simultaneous fellowship from any other government or UGC source is not permissible.', hi: 'किसी अन्य सरकारी या यूजीसी स्रोत से एक साथ फेलोशिप की अनुमति नहीं है।' })}>
          <RadioGroup {...bind('otherFellowship')} options={YES_NO} />
        </Field>
      </FormSection>
    </div>
  );
}

function OverseasForm({ bind, values, errors, tx }) {
  const qualifying = {
    masters: { en: "Bachelor's degree", hi: 'स्नातक डिग्री' },
    phd: { en: "Master's degree", hi: 'मास्टर्स डिग्री' },
    postdoc: { en: "Master's degree (with Ph.D awarded)", hi: 'मास्टर्स डिग्री (पीएच.डी प्राप्त)' },
  }[values.courseLevel] || { en: 'Qualifying degree', hi: 'योग्यता डिग्री' };

  return (
    <div className="space-y-8">
      <FormSection title={tx({ en: 'Course abroad', hi: 'विदेश में पाठ्यक्रम' })}>
        <Field label={tx({ en: 'Level of study', hi: 'अध्ययन स्तर' })} required htmlFor="courseLevel" error={errors.courseLevel} hint={tx({ en: "Age limit: Master's 32, Ph.D 35, Post-doc 38 years.", hi: 'आयु सीमा: मास्टर्स 32, पीएच.डी 35, पोस्ट-डॉक 38 वर्ष।' })}>
          <SelectInput {...bind('courseLevel')} options={NOS_LEVELS} />
        </Field>
        <Field label={tx({ en: 'Field of study', hi: 'अध्ययन का क्षेत्र' })} required htmlFor="fieldOfStudy" error={errors.fieldOfStudy} hint={tx({ en: 'A separate merit list is made for each field.', hi: 'प्रत्येक क्षेत्र हेतु अलग मेरिट सूची बनती है।' })}>
          <SelectInput {...bind('fieldOfStudy')} options={NOS_FIELDS} />
        </Field>
        <Field label={tx({ en: 'Course name', hi: 'पाठ्यक्रम का नाम' })} required htmlFor="courseName" error={errors.courseName} className="md:col-span-2" hint="e.g. MSc Data Science">
          <TextInput {...bind('courseName')} />
        </Field>
        <Field
          label={tx({ en: 'Topic concerns Indian culture, heritage, history or India-based social studies?', hi: 'क्या विषय भारतीय संस्कृति, विरासत, इतिहास या भारत-आधारित सामाजिक अध्ययन से संबंधित है?' })}
          optional
          htmlFor="indiaTopic"
          className="md:col-span-2"
          hint={tx({ en: 'The selection committee may decide such topics are not covered under NOS guidelines.', hi: 'चयन समिति ऐसे विषयों को योजना से बाहर मान सकती है।' })}
        >
          <RadioGroup {...bind('indiaTopic')} options={YES_NO} />
        </Field>
      </FormSection>

      <FormSection title={tx({ en: 'Foreign university', hi: 'विदेशी विश्वविद्यालय' })}>
        <Field label={tx({ en: 'University name', hi: 'विश्वविद्यालय का नाम' })} required htmlFor="universityName" error={errors.universityName} className="md:col-span-2">
          <TextInput {...bind('universityName')} />
        </Field>
        <Field label={tx({ en: 'Country', hi: 'देश' })} required htmlFor="country" error={errors.country}>
          <SelectInput {...bind('country')} options={COUNTRIES} />
        </Field>
        <Field label={tx({ en: 'City', hi: 'शहर' })} optional htmlFor="city">
          <TextInput {...bind('city')} />
        </Field>
        <Field
          label={tx({ en: 'QS World University Ranking', hi: 'क्यूएस विश्व विश्वविद्यालय रैंकिंग' })}
          htmlFor="qsRank"
          error={errors.qsRank}
          hint={tx({ en: 'Latest QS rank of this campus. Must be within top 1000 for eligibility.', hi: 'इस परिसर की नवीनतम क्यूएस रैंक। पात्रता हेतु शीर्ष 1000 में होना अनिवार्य है।' })}
        >
          <TextInput {...bind('qsRank')} transform={digits(4)} inputMode="numeric" />
        </Field>
        <Field label={tx({ en: 'Admission status', hi: 'प्रवेश की स्थिति' })} required htmlFor="admissionStatus" error={errors.admissionStatus}>
          <SelectInput {...bind('admissionStatus')} options={NOS_ADMISSION_STATUS} />
        </Field>
        <Field label={tx({ en: 'Course start date', hi: 'पाठ्यक्रम आरंभ तिथि' })} optional htmlFor="courseStartDate">
          <TextInput {...bind('courseStartDate')} type="date" />
        </Field>
        <Field label={tx({ en: 'Course duration (months)', hi: 'पाठ्यक्रम अवधि (माह)' })} required htmlFor="courseDurationMonths" error={errors.courseDurationMonths} hint={tx({ en: "Support is limited to 1–2 years for Master's, 4 for Ph.D, 2 for post-doc.", hi: 'सहायता मास्टर्स हेतु 1–2 वर्ष, पीएच.डी हेतु 4 और पोस्ट-डॉक हेतु 2 वर्ष तक।' })}>
          <TextInput {...bind('courseDurationMonths')} transform={digits(2)} inputMode="numeric" />
        </Field>
        <Field label={tx({ en: 'Test scores', hi: 'परीक्षा अंक' })} optional htmlFor="testScores" hint="GRE 320, TOEFL 105, IELTS 7.5">
          <TextInput {...bind('testScores')} />
        </Field>
      </FormSection>

      <FormSection title={tx(qualifying)}>
        <Field label={tx({ en: 'Degree', hi: 'डिग्री' })} required htmlFor="qualifyingDegree" error={errors.qualifyingDegree}>
          <TextInput {...bind('qualifyingDegree')} />
        </Field>
        <Field label={tx({ en: 'University', hi: 'विश्वविद्यालय' })} required htmlFor="qualifyingUniversity" error={errors.qualifyingUniversity}>
          <TextInput {...bind('qualifyingUniversity')} />
        </Field>
        <Field label={tx({ en: 'Year of passing', hi: 'उत्तीर्ण वर्ष' })} required htmlFor="qualifyingYear" error={errors.qualifyingYear}>
          <SelectInput {...bind('qualifyingYear')} options={YEARS} />
        </Field>
        <MarksFields bind={bind} values={values} errors={errors} tx={tx} labelPrefix="" />
      </FormSection>

      <FormSection title={tx({ en: 'Employment & Gap details', hi: 'रोजगार एवं अंतर विवरण' })}>
        <Field label={tx({ en: 'Are you currently employed?', hi: 'क्या आप वर्तमान में कार्यरत हैं?' })} required htmlFor="isEmployed" error={errors.isEmployed}>
          <RadioGroup {...bind('isEmployed')} options={YES_NO} />
        </Field>
        {values.isEmployed === 'yes' && (
          <>
            <Field label={tx({ en: 'Employer organization name', hi: 'नियोक्ता संस्था का नाम' })} required htmlFor="employerName" error={errors.employerName}>
              <TextInput {...bind('employerName')} />
            </Field>
            <Field label={tx({ en: 'Designation / Post', hi: 'पदनाम' })} required htmlFor="designation" error={errors.designation}>
              <TextInput {...bind('designation')} />
            </Field>
          </>
        )}
        <Field label={tx({ en: 'Is there any gap of more than 6 months in your academic career?', hi: 'क्या आपके शैक्षणिक करियर में 6 माह से अधिक का कोई अंतराल है?' })} required htmlFor="hasAcademicGap" error={errors.hasAcademicGap}>
          <RadioGroup {...bind('hasAcademicGap')} options={YES_NO} />
        </Field>
      </FormSection>

      <FormSection title={tx({ en: 'Declarations about previous awards', hi: 'पूर्व छात्रवृत्ति संबंधी घोषणा' })}>
        <Field label={tx({ en: 'Has a brother or sister already received this scholarship?', hi: 'क्या आपके भाई या बहन को यह छात्रवृत्ति पहले मिल चुकी है?' })} required htmlFor="siblingAvailed" error={errors.siblingAvailed} hint={tx({ en: 'Not more than two children of the same parents are eligible.', hi: 'एक ही माता-पिता के दो से अधिक बच्चे पात्र नहीं हैं।' })}>
          <RadioGroup {...bind('siblingAvailed')} options={YES_NO} />
        </Field>
        <Field label={tx({ en: 'Have you received this scholarship before?', hi: 'क्या आपको यह छात्रवृत्ति पहले मिल चुकी है?' })} required htmlFor="previousAward" error={errors.previousAward}>
          <RadioGroup {...bind('previousAward')} options={YES_NO} />
        </Field>
      </FormSection>
    </div>
  );
}

function PostMatricForm({ bind, values, errors, tx }) {
  const POST_MATRIC_LEVELS = [
    { value: 'Class XI', label: { en: 'Class XI (Higher Secondary)', hi: 'कक्षा XI (उच्चतर माध्यमिक)' } },
    { value: 'Class XII', label: { en: 'Class XII (Senior Secondary)', hi: 'कक्षा XII (वरिष्ठ माध्यमिक)' } },
    { value: 'ITI / Diploma', label: { en: 'ITI / Polytechnic Diploma', hi: 'आईटीआई / पॉलिटेक्निक डिप्लोमा' } },
    { value: 'Undergraduate', label: { en: 'Undergraduate (B.A., B.Sc., B.Com., B.Tech., etc.)', hi: 'स्नातक' } },
    { value: 'Postgraduate', label: { en: 'Postgraduate (M.A., M.Sc., M.Com., M.Tech., etc.)', hi: 'स्नातकोत्तर' } },
    { value: 'Professional', label: { en: 'Professional Courses (MBBS, LLB, B.Ed., etc.)', hi: 'व्यावसायिक पाठ्यक्रम' } },
  ];

  return (
    <div className="space-y-8">
      <FormSection title={tx({ en: 'Course and Institution Details', hi: 'पाठ्यक्रम एवं संस्थान विवरण' })}>
        <Field label={tx({ en: 'Course Level', hi: 'पाठ्यक्रम स्तर' })} required htmlFor="courseLevel" error={errors.courseLevel}>
          <SelectInput {...bind('courseLevel')} options={POST_MATRIC_LEVELS} />
        </Field>
        <Field label={tx({ en: 'Current Course / Degree Name', hi: 'वर्तमान पाठ्यक्रम / डिग्री का नाम' })} required htmlFor="currentCourse" error={errors.currentCourse} hint="e.g. B.Tech Computer Science">
          <TextInput {...bind('currentCourse')} />
        </Field>
        <Field label={tx({ en: 'Current Year of Study', hi: 'वर्तमान अध्ययन वर्ष' })} required htmlFor="currentYear" error={errors.currentYear}>
          <SelectInput
            {...bind('currentYear')}
            options={[
              { value: '1st Year', label: { en: '1st Year', hi: 'प्रथम वर्ष' } },
              { value: '2nd Year', label: { en: '2nd Year', hi: 'द्वितीय वर्ष' } },
              { value: '3rd Year', label: { en: '3rd Year', hi: 'तृतीय वर्ष' } },
              { value: '4th Year', label: { en: '4th Year', hi: 'चतुर्थ वर्ष' } },
              { value: '5th Year', label: { en: '5th Year', hi: 'पंचम वर्ष' } },
            ]}
          />
        </Field>
        <Field label={tx({ en: 'Total Course Duration (Years)', hi: 'कुल पाठ्यक्रम अवधि (वर्ष)' })} required htmlFor="courseDuration" error={errors.courseDuration}>
          <SelectInput
            {...bind('courseDuration')}
            options={[
              { value: '1', label: { en: '1 Year', hi: '1 वर्ष' } },
              { value: '2', label: { en: '2 Years', hi: '2 वर्ष' } },
              { value: '3', label: { en: '3 Years', hi: '3 वर्ष' } },
              { value: '4', label: { en: '4 Years', hi: '4 वर्ष' } },
              { value: '5', label: { en: '5 Years', hi: '5 वर्ष' } },
            ]}
          />
        </Field>
        <Field label={tx({ en: 'Institution Name', hi: 'संस्थान का नाम' })} required htmlFor="institutionName" error={errors.institutionName} className="md:col-span-2">
          <TextInput {...bind('institutionName')} />
        </Field>
        <Field label={tx({ en: 'Affiliating University or Board', hi: 'संबद्ध विश्वविद्यालय या बोर्ड' })} required htmlFor="universityOrBoard" error={errors.universityOrBoard}>
          <TextInput {...bind('universityOrBoard')} />
        </Field>
        <Field label={tx({ en: 'Institution State', hi: 'संस्थान का राज्य' })} required htmlFor="institutionState" error={errors.institutionState}>
          <SelectInput {...bind('institutionState')} options={STATES} />
        </Field>
        <Field label={tx({ en: 'Enrollment / Registration Number', hi: 'नामांकन / पंजीकरण संख्या' })} required htmlFor="enrollmentNumber" error={errors.enrollmentNumber}>
          <TextInput {...bind('enrollmentNumber')} />
        </Field>
        <Field label={tx({ en: 'Admission Year', hi: 'प्रवेश वर्ष' })} required htmlFor="admissionYear" error={errors.admissionYear}>
          <SelectInput {...bind('admissionYear')} options={YEARS.slice(0, 6)} />
        </Field>
        <Field label={tx({ en: 'Hostel Status', hi: 'छात्रावास की स्थिति' })} required htmlFor="residence" error={errors.residence}>
          <RadioGroup {...bind('residence')} options={RESIDENCE_TYPES} />
        </Field>
      </FormSection>

      <FormSection title={tx({ en: 'State / Local Government Integration', hi: 'राज्य / स्थानीय प्रशासन एकीकरण' })}>
        <Field label={tx({ en: 'Sub-District / Tehsil / Block', hi: 'उप-जिला / तहसील / प्रखंड' })} required htmlFor="blockName" error={errors.blockName}>
          <TextInput {...bind('blockName')} />
        </Field>
        <Field label={tx({ en: 'State Portal / Samagra / e-District Ref (if any)', hi: 'राज्य पोर्टल / समग्र आईडी (यदि उपलब्ध हो)' })} optional htmlFor="statePortalRef">
          <TextInput {...bind('statePortalRef')} />
        </Field>
      </FormSection>
    </div>
  );
}

function TopClassForm({ bind, values, errors, tx }) {
  const isRenewal = values.applicationType === 'RENEWAL';

  return (
    <div className="space-y-8">
      <FormSection title={tx({ en: 'Application Flow Type', hi: 'आवेदन प्रवाह प्रकार' })}>
        <Field label={tx({ en: 'Application Category', hi: 'आवेदन श्रेणी' })} required htmlFor="applicationType" error={errors.applicationType}>
          <RadioGroup
            {...bind('applicationType')}
            options={[
              { value: 'FRESH', label: { en: 'Fresh Application (1st Year Admission)', hi: 'नवीन आवेदन (प्रथम वर्ष प्रवेश)' } },
              { value: 'RENEWAL', label: { en: 'Renewal Application (2nd Year Onwards)', hi: 'नवीनीकरण आवेदन (द्वितीय वर्ष से आगे)' } },
            ]}
          />
        </Field>
      </FormSection>

      <FormSection title={tx({ en: 'Notified Premier Institution', hi: 'अधिसूचित उत्कृष्ट संस्थान' })}>
        <Field label={tx({ en: 'Premier Institute Name (IIT, IIM, NIT, AIIMS, NLU, etc.)', hi: 'उत्कृष्ट संस्थान का नाम' })} required htmlFor="premierInstituteName" error={errors.premierInstituteName} className="md:col-span-2">
          <TextInput {...bind('premierInstituteName')} placeholder="e.g. Indian Institute of Technology (IIT) Delhi" />
        </Field>
        <Field label={tx({ en: 'Programme / Degree', hi: 'कार्यक्रम / डिग्री' })} required htmlFor="programmeName" error={errors.programmeName} hint="e.g. B.Tech Computer Science, MBA, MBBS">
          <TextInput {...bind('programmeName')} />
        </Field>
        <Field label={tx({ en: 'Student Roll / Registration No.', hi: 'विद्यार्थी रोल / पंजीकरण संख्या' })} required htmlFor="rollNumber" error={errors.rollNumber}>
          <TextInput {...bind('rollNumber')} />
        </Field>
      </FormSection>

      {!isRenewal ? (
        <FormSection title={tx({ en: 'Entrance Exam & Fee Structure (Fresh Intake)', hi: 'प्रवेश परीक्षा एवं शुल्क संरचना' })}>
          <Field label={tx({ en: 'Entrance Examination', hi: 'प्रवेश परीक्षा' })} required htmlFor="entranceExamName" error={errors.entranceExamName} hint="JEE Advanced / CAT / NEET-UG / CLAT / etc.">
            <TextInput {...bind('entranceExamName')} />
          </Field>
          <Field label={tx({ en: 'All India Rank / Category Rank', hi: 'अखिल भारतीय रैंक' })} required htmlFor="entranceRank" error={errors.entranceRank}>
            <TextInput {...bind('entranceRank')} inputMode="numeric" />
          </Field>
          <Field label={tx({ en: 'Date of Admission', hi: 'प्रवेश तिथि' })} required htmlFor="admissionDate" error={errors.admissionDate}>
            <TextInput {...bind('admissionDate')} type="date" />
          </Field>
          <Field label={tx({ en: 'Annual Tuition Fee (₹)', hi: 'वार्षिक शिक्षण शुल्क (₹)' })} required htmlFor="tuitionFeePerAnnum" error={errors.tuitionFeePerAnnum} hint="Reimbursed directly up to scheme limits">
            <TextInput {...bind('tuitionFeePerAnnum')} inputMode="numeric" />
          </Field>
          <Field label={tx({ en: 'Other Non-Refundable Charges (₹)', hi: 'अन्य गैर-वापसी शुल्क (₹)' })} optional htmlFor="nonRefundableCharges">
            <TextInput {...bind('nonRefundableCharges')} inputMode="numeric" />
          </Field>
        </FormSection>
      ) : (
        <FormSection title={tx({ en: 'Academic Performance for Renewal', hi: 'नवीनीकरण हेतु शैक्षणिक प्रदर्शन' })} description={tx({ en: 'Minimum 50% passing marks in previous academic year required. No active backlogs allowed.', hi: 'पिछले शैक्षणिक वर्ष में न्यूनतम 50% उत्तीर्ण अंक आवश्यक हैं।' })}>
          <Field label={tx({ en: 'Current Semester / Year', hi: 'वर्तमान सेमेस्टर / वर्ष' })} required htmlFor="currentYearSemester" error={errors.currentYearSemester} hint="e.g. 3rd Year / 5th Semester">
            <TextInput {...bind('currentYearSemester')} />
          </Field>
          <Field label={tx({ en: 'Previous Year Passing Marks (%)', hi: 'पिछले वर्ष के उत्तीर्ण अंक (%)' })} required htmlFor="previousYearMarksPercentage" error={errors.previousYearMarksPercentage} hint="Must be at least 50%">
            <TextInput {...bind('previousYearMarksPercentage')} transform={decimal} inputMode="decimal" />
          </Field>
          <Field label={tx({ en: 'Do you have any active / uncleared backlogs?', hi: 'क्या कोई बकाया (बैकलॉग) पेपर है?' })} required htmlFor="hasBacklogs" error={errors.hasBacklogs}>
            <RadioGroup {...bind('hasBacklogs')} options={YES_NO} />
          </Field>
          <Field label={tx({ en: 'Promoted to the next academic year?', hi: 'अगले शैक्षणिक वर्ष में पदोन्नत किया गया?' })} required htmlFor="promotedToNextYear" error={errors.promotedToNextYear}>
            <RadioGroup {...bind('promotedToNextYear')} options={YES_NO} />
          </Field>
          <Field label={tx({ en: 'Current Year Tuition Fee (₹)', hi: 'चालू वर्ष शिक्षण शुल्क (₹)' })} required htmlFor="tuitionFeePerAnnum" error={errors.tuitionFeePerAnnum}>
            <TextInput {...bind('tuitionFeePerAnnum')} inputMode="numeric" />
          </Field>
        </FormSection>
      )}
    </div>
  );
}

export default function AcademicStep({ scheme, values, setValue, errors }) {
  const { tx } = useLang();
  const bind = binder(values, errors, setValue);
  const props = { bind, values, errors, tx };

  if (scheme.academicForm === 'school') return <SchoolForm {...props} />;
  if (scheme.academicForm === 'research') return <ResearchForm {...props} />;
  if (scheme.academicForm === 'post-matric') return <PostMatricForm {...props} />;
  if (scheme.academicForm === 'top-class') return <TopClassForm {...props} />;
  return <OverseasForm {...props} />;
}
