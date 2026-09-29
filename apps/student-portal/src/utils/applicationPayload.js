import { SELECTION_YEAR } from '../config/schemes';
import { getDocumentChecklist, DOCUMENTS } from '../config/documents';
import { NOS_LEVELS } from '../config/options';
import { toInputDate } from './format';

/* Short course / institution strings stored at the top level for the admin panel. */
function courseAndInstitution(scheme, a) {
  if (scheme.academicForm === 'school') {
    return { course: `Class ${a.className}`, institution: a.schoolName };
  }
  if (scheme.academicForm === 'research') {
    return { course: `${a.courseLevel} - ${a.subject}`, institution: a.universityName };
  }
  if (scheme.academicForm === 'post-matric') {
    return { course: `${a.courseLevel || 'Post-Matric'} - ${a.currentCourse || ''}`, institution: a.institutionName };
  }
  if (scheme.academicForm === 'top-class') {
    return { course: a.programmeName, institution: a.premierInstituteName };
  }
  const level = NOS_LEVELS.find((l) => l.value === a.courseLevel)?.label.en || a.courseLevel;
  return {
    course: `${level} - ${a.courseName}`,
    institution: [a.universityName, a.country].filter(Boolean).join(', '),
  };
}

/** Converts the wizard state into the payload for POST /api/student/applications. */
export function buildApplicationPayload(scheme, data) {
  const personal = data.personal || {};
  const category = data.category || {};
  const academic = data.academic || {};
  const { confirmAccountNumber, ...bank } = data.bank || {};
  const docs = data.documents || {};

  const marks = academic.gradeType === 'cgpa'
    ? academic.convertedPercentage
    : academic.percentage ?? academic.previousClassPercent;

  const documents = getDocumentChecklist(scheme.id, data)
    .filter((d) => docs[d.id])
    .map((d) => {
      const rec = docs[d.id];
      return {
        docType: d.id,
        name: d.label.en,
        source: rec.source,
        fileUrl: rec.fileUrl || '',
        fileName: rec.fileName || '',
        mimeType: rec.mimeType || '',
        size: rec.size || 0,
        digilockerUri: rec.digilockerUri || '',
        issuer: rec.issuer || '',
        certificateNo: rec.certificateNo || '',
      };
    });

  const formattedDob = toInputDate(personal.dob) || personal.dob;
  const sanitizedPersonal = { ...personal, dob: formattedDob };

  return {
    scheme: scheme.code,
    applicationType: academic.applicationType || 'FRESH',
    session: SELECTION_YEAR,
    name: personal.fullName,
    email: personal.email,
    phone: personal.mobile,
    dob: formattedDob,
    gender: personal.gender,
    state: personal.state,
    district: personal.district,
    ...courseAndInstitution(scheme, academic),
    declared_income: category.isOrphan === 'yes' || category.familyIncome === undefined || category.familyIncome === ''
      ? undefined
      : Number(category.familyIncome),
    declared_marks: marks === undefined || marks === '' ? undefined : Number(marks),
    sections: {
      personal: sanitizedPersonal,
      category,
      academic,
      bank,
      declarations: data.declarations || {},
    },
    documents,
  };
}

/** Rebuilds wizard state from a submitted application (used to correct and resubmit). */
export function wizardStateFromApplication(app) {
  const sections = app?.schemeData?.sections || {};
  const documents = {};
  (app?.documents || []).forEach((doc) => {
    const key = doc.docType || Object.keys(DOCUMENTS).find((k) => DOCUMENTS[k].label.en === doc.name);
    if (key) documents[key] = { ...doc, docType: key };
  });
  const personal = {
    fullName: app?.name || '',
    email: app?.email || '',
    mobile: app?.phone || '',
    dob: toInputDate(app?.dob),
    gender: app?.gender || '',
    state: app?.state || '',
    district: app?.district || '',
    ...(sections.personal || {}),
  };
  const bank = { ...(sections.bank || {}) };
  if (bank.accountNumber) bank.confirmAccountNumber = bank.accountNumber;
  return {
    personal,
    category: sections.category || {},
    academic: sections.academic || {},
    bank,
    documents,
    declarations: {},
  };
}
