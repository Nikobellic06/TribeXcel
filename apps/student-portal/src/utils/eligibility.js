import { AGE_REFERENCE_DATE } from '../config/schemes';
import { ageOn, formatINR } from './format';
import { isBlank } from './validation';

/*
 * Live eligibility check shown to the student while filling the form.
 * It never blocks saving a draft — it tells the student early what the
 * verifying officer will look at, so fewer applications come back deficient.
 *
 * Each check: { id, status: 'pass' | 'fail' | 'warn' | 'pending', label, detail }
 * `label` / `detail` are { en, hi } objects.
 */

const yes = (v) => v === 'yes';

function marksFrom(academic) {
  if (academic.gradeType === 'cgpa') return academic.convertedPercentage;
  return academic.percentage;
}

function ageCheck(dob, maxAge) {
  const age = ageOn(dob, AGE_REFERENCE_DATE);
  const label = { en: `Age up to ${maxAge} years on 1 July 2026`, hi: `1 जुलाई 2026 को आयु ${maxAge} वर्ष तक` };
  if (age === null) return { id: 'age', status: 'pending', label, detail: { en: 'Add your date of birth.', hi: 'अपनी जन्मतिथि भरें।' } };
  return age <= maxAge
    ? { id: 'age', status: 'pass', label, detail: { en: `You will be ${age}.`, hi: `आपकी आयु ${age} वर्ष होगी।` } }
    : { id: 'age', status: 'fail', label, detail: { en: `You will be ${age}, which is above the limit.`, hi: `आपकी आयु ${age} वर्ष होगी, जो सीमा से अधिक है।` } };
}

function incomeCheck(category, limit) {
  const label = { en: `Family income up to ${formatINR(limit)} a year`, hi: `पारिवारिक आय ${formatINR(limit)} प्रति वर्ष तक` };
  if (yes(category.isOrphan)) {
    return { id: 'income', status: 'pass', label, detail: { en: 'Income limit does not apply to orphans.', hi: 'अनाथ छात्रों पर आय सीमा लागू नहीं होती।' } };
  }
  if (isBlank(category.familyIncome)) {
    return { id: 'income', status: 'pending', label, detail: { en: 'Add your annual family income.', hi: 'वार्षिक पारिवारिक आय भरें।' } };
  }
  const income = Number(category.familyIncome);
  return income <= limit
    ? { id: 'income', status: 'pass', label, detail: { en: `Declared ${formatINR(income)}.`, hi: `घोषित आय ${formatINR(income)}।` } }
    : { id: 'income', status: 'fail', label, detail: { en: `Declared ${formatINR(income)} is above the limit.`, hi: `घोषित आय ${formatINR(income)} सीमा से अधिक है।` } };
}

function marksCheck(academic, minMarks, waived) {
  const label = { en: `At least ${minMarks}% in the qualifying degree`, hi: `योग्यता डिग्री में न्यूनतम ${minMarks}%` };
  if (waived) {
    return { id: 'marks', status: 'pass', label, detail: { en: 'Not applicable — admitted to a top-1000 QS university.', hi: 'लागू नहीं — शीर्ष 1000 क्यूएस विश्वविद्यालय में प्रवेश।' } };
  }
  const marks = marksFrom(academic);
  if (isBlank(marks)) {
    return { id: 'marks', status: 'pending', label, detail: { en: 'Add your qualifying marks.', hi: 'योग्यता परीक्षा के अंक भरें।' } };
  }
  return Number(marks) >= minMarks
    ? { id: 'marks', status: 'pass', label, detail: { en: `${marks}% declared.`, hi: `${marks}% घोषित।` } }
    : { id: 'marks', status: 'fail', label, detail: { en: `${marks}% is below the minimum.`, hi: `${marks}% न्यूनतम से कम है।` } };
}

export function evaluateEligibility(scheme, data = {}) {
  if (!scheme) return [];
  const personal = data.personal || {};
  const category = data.category || {};
  const academic = data.academic || {};
  const bank = data.bank || {};
  const rules = scheme.rules;
  const checks = [];

  checks.push(
    isBlank(category.stCertificateNo)
      ? { id: 'st', status: 'pending', label: { en: 'Scheduled Tribe certificate', hi: 'अनुसूचित जनजाति प्रमाण पत्र' }, detail: { en: 'Add your ST certificate details.', hi: 'एसटी प्रमाण पत्र का विवरण भरें।' } }
      : { id: 'st', status: 'pass', label: { en: 'Scheduled Tribe certificate', hi: 'अनुसूचित जनजाति प्रमाण पत्र' }, detail: { en: `Certificate ${category.stCertificateNo}.`, hi: `प्रमाण पत्र ${category.stCertificateNo}।` } }
  );

  if (scheme.id === 'pre-matric') {
    const classLabel = { en: 'Studying in Class IX or X', hi: 'कक्षा IX या X में अध्ययनरत' };
    checks.push(
      rules.allowedClasses.includes(academic.className)
        ? { id: 'class', status: 'pass', label: classLabel, detail: { en: `Class ${academic.className}.`, hi: `कक्षा ${academic.className}।` } }
        : { id: 'class', status: 'pending', label: classLabel, detail: { en: 'Select your class.', hi: 'अपनी कक्षा चुनें।' } }
    );
    checks.push(incomeCheck(category, rules.incomeLimit));
    if (yes(academic.repeatingClass)) {
      checks.push({ id: 'repeat', status: 'fail', label: { en: 'Not repeating the same class', hi: 'उसी कक्षा को दोहरा नहीं रहे' }, detail: { en: 'Scholarship is not given twice for the same class.', hi: 'एक ही कक्षा हेतु छात्रवृत्ति दो बार नहीं दी जाती।' } });
    }
    if (yes(academic.otherScholarship)) {
      checks.push({ id: 'other', status: 'fail', label: { en: 'No other scholarship', hi: 'कोई अन्य छात्रवृत्ति नहीं' }, detail: { en: 'You cannot hold another scholarship with this one.', hi: 'इसके साथ कोई अन्य छात्रवृत्ति नहीं ली जा सकती।' } });
    }
  }

  if (scheme.id === 'nfst') {
    checks.push(ageCheck(personal.dob, rules.maxAge));
    checks.push(marksCheck(academic, rules.minMarks, false));
    checks.push({ id: 'income', status: 'pass', label: { en: 'Family income', hi: 'पारिवारिक आय' }, detail: { en: 'No income limit for this fellowship.', hi: 'इस फेलोशिप हेतु कोई आय सीमा नहीं।' } });
    if (yes(academic.premierOffer)) {
      checks.push({ id: 'priority', status: 'pass', label: { en: 'Priority admission', hi: 'प्राथमिकता प्रवेश' }, detail: { en: 'Offer from IIT / AIIMS / IIM / IISER gets priority.', hi: 'आईआईटी / एम्स / आईआईएम / आईआईएसईआर के प्रस्ताव को प्राथमिकता।' } });
    }
    if (yes(academic.otherFellowship)) {
      checks.push({ id: 'other', status: 'warn', label: { en: 'Other fellowship', hi: 'अन्य फेलोशिप' }, detail: { en: 'If selected, you must refund the other fellowship and submit proof.', hi: 'चयन होने पर अन्य फेलोशिप की राशि लौटाकर प्रमाण देना होगा।' } });
    }
    if (yes(category.hasDisability) && !isBlank(category.disabilityPercent) && Number(category.disabilityPercent) < 40) {
      checks.push({ id: 'pwd', status: 'warn', label: { en: 'Divyangjan slot', hi: 'दिव्यांगजन स्लॉट' }, detail: { en: 'The Divyangjan slot needs at least 40% disability. You will be considered in the general ST list.', hi: 'दिव्यांगजन स्लॉट हेतु न्यूनतम 40% दिव्यांगता आवश्यक है। आपको सामान्य एसटी सूची में माना जाएगा।' } });
    }
  }

  if (scheme.id === 'nos') {
    const level = academic.courseLevel;
    const maxAge = rules.maxAgeByLevel[level];
    if (maxAge) checks.push(ageCheck(personal.dob, maxAge));
    else checks.push({ id: 'age', status: 'pending', label: { en: 'Age limit', hi: 'आयु सीमा' }, detail: { en: 'Select your course level first.', hi: 'पहले पाठ्यक्रम स्तर चुनें।' } });

    const rank = Number(academic.qsRank);
    const inTop = Number.isFinite(rank) && rank > 0 && rank <= rules.qsRankLimit;
    const admitted = academic.admissionStatus === 'studying' || academic.admissionStatus === 'offer';
    checks.push(marksCheck(academic, rules.minMarks, inTop && admitted));
    checks.push(incomeCheck(category, rules.incomeLimit));

    const rankLabel = { en: 'University in QS top 1000', hi: 'विश्वविद्यालय क्यूएस शीर्ष 1000 में' };
    if (isBlank(academic.qsRank)) {
      checks.push({ id: 'qs', status: 'pending', label: rankLabel, detail: { en: 'Add the QS World University Ranking.', hi: 'क्यूएस विश्व विश्वविद्यालय रैंकिंग भरें।' } });
    } else if (inTop) {
      checks.push({ id: 'qs', status: 'pass', label: rankLabel, detail: { en: `QS rank ${rank}. Merit is decided by this rank.`, hi: `क्यूएस रैंक ${rank}। मेरिट इसी रैंक से तय होती है।` } });
    } else {
      checks.push({ id: 'qs', status: 'warn', label: rankLabel, detail: { en: 'Awards go first to top-1000 universities. You would need to join one within 2 years of the award.', hi: 'छात्रवृत्ति पहले शीर्ष 1000 विश्वविद्यालयों को दी जाती है। आपको पुरस्कार के 2 वर्ष में ऐसे विश्वविद्यालय में शामिल होना होगा।' } });
    }

    if (yes(academic.siblingAvailed)) {
      checks.push({ id: 'sibling', status: 'fail', label: { en: 'One child per family', hi: 'प्रति परिवार एक संतान' }, detail: { en: 'A sibling has already received this award.', hi: 'भाई/बहन पहले ही यह छात्रवृत्ति प्राप्त कर चुके हैं।' } });
    }
    if (yes(academic.previousAward)) {
      checks.push({ id: 'once', status: 'fail', label: { en: 'One-time award', hi: 'एक बार की छात्रवृत्ति' }, detail: { en: 'The award can be received only once.', hi: 'यह छात्रवृत्ति केवल एक बार मिल सकती है।' } });
    }
  }

  const bankLabel = { en: 'Aadhaar-seeded bank account', hi: 'आधार से जुड़ा बैंक खाता' };
  checks.push(
    yes(bank.aadhaarSeeded)
      ? { id: 'bank', status: 'pass', label: bankLabel, detail: { en: 'Needed for direct benefit transfer.', hi: 'प्रत्यक्ष लाभ अंतरण हेतु आवश्यक।' } }
      : { id: 'bank', status: 'pending', label: bankLabel, detail: { en: 'Confirm in the bank details step.', hi: 'बैंक विवरण चरण में पुष्टि करें।' } }
  );

  return checks;
}

/** 'fail' if any check fails, 'pending' if anything is missing, else 'pass'. */
export function overallEligibility(checks) {
  if (checks.some((c) => c.status === 'fail')) return 'fail';
  if (checks.some((c) => c.status === 'pending')) return 'pending';
  return 'pass';
}
