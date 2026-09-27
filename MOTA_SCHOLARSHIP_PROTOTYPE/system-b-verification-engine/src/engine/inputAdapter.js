/**
 * System B Input Adapter
 * Normalizes input payloads from either:
 * 1. Direct System A document intelligence output:
 *    { applicantProfile, documents: [], crossDocumentValidation: [], anomalies, reviewFlags }
 * 2. Legacy / Integration payload format:
 *    { applicant, education, financial, documents: {}, documentIntelligence: {} }
 */

function unwrap(val) {
  if (val === null) return null;
  if (val === undefined) return undefined;
  if (typeof val === 'object' && 'value' in val) {
    return val.value;
  }
  return val;
}

function parseNumber(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const clean = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

function calculateAge(dobStr) {
  if (!dobStr) return null;
  const s = String(dobStr).trim();
  let birthDate;
  if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(s)) {
    const parts = s.split(/[\/\-\.]/);
    birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
  } else {
    birthDate = new Date(s);
  }
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function findFieldInDocuments(docsList, fieldNames = []) {
  if (!Array.isArray(docsList)) return null;
  for (const doc of docsList) {
    const fields = doc.fields || doc.extractedFields || {};
    for (const name of fieldNames) {
      if (fields[name] !== undefined && fields[name] !== null) {
        const val = unwrap(fields[name]);
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          return val;
        }
      }
    }
  }
  return null;
}

function adaptApplication(application) {
  if (!application || typeof application !== 'object') {
    return {
      applicationId: `APP-${Date.now().toString().slice(-6)}`,
      scheme: 'PRE_MATRIC',
      applicant: {},
      education: {},
      financial: {},
      bank: {},
      documentsList: [],
      documentsMap: {},
      crossDocumentValidation: [],
      anomalies: {},
      reviewFlags: []
    };
  }

  const profile = application.applicantProfile || {};
  const applicantRaw = application.applicant || profile.applicant || {};
  const educationRaw = application.education || profile.education || {};
  const financialRaw = application.financial || profile.financial || {};
  const bankRaw = application.bankDetails || applicantRaw.bankDetails || financialRaw.bankDetails || profile.bank || {};

  // Extract documents list
  let documentsList = [];
  let documentsMap = {};

  if (Array.isArray(application.documents)) {
    documentsList = application.documents;
  } else if (application.documents && typeof application.documents === 'object') {
    documentsMap = application.documents;
    documentsList = Object.entries(application.documents).map(([k, v]) => ({
      documentType: k,
      name: k,
      ...v
    }));
  }

  // Also check documentIntelligence
  const docIntel = application.documentIntelligence || {};
  if (Array.isArray(docIntel.documents)) {
    documentsList = [...documentsList, ...docIntel.documents];
  } else if (Array.isArray(docIntel.documentResults)) {
    documentsList = [...documentsList, ...docIntel.documentResults];
  }

  // Cross Document Validation
  const crossDocumentValidation = application.crossDocumentValidation ||
    docIntel.crossDocumentValidation ||
    application.crossChecks ||
    docIntel.crossChecks ||
    [];

  // Anomalies & Review flags
  const anomalies = application.anomalies || docIntel.anomalies || {};
  const reviewFlags = application.reviewFlags || docIntel.reviewFlags || [];

  // Resolved Applicant fields
  const fullName = unwrap(applicantRaw.fullName) || unwrap(applicantRaw.name) || findFieldInDocuments(documentsList, ['fullName', 'studentName', 'name', 'accountHolderName']);
  const dateOfBirth = unwrap(applicantRaw.dateOfBirth) || unwrap(applicantRaw.dob) || findFieldInDocuments(documentsList, ['dateOfBirth', 'dob']);
  const explicitAge = typeof applicantRaw.age === 'number' ? applicantRaw.age : parseNumber(applicantRaw.age);
  const calculatedAge = calculateAge(dateOfBirth);
  const age = explicitAge !== null ? explicitAge : calculatedAge;

  const category = unwrap(applicantRaw.category) || unwrap(applicantRaw.casteCategory) || findFieldInDocuments(documentsList, ['category', 'caste']);
  const subCategory = unwrap(applicantRaw.subCategory) || unwrap(applicantRaw.subTribe) || unwrap(applicantRaw.tribe) || findFieldInDocuments(documentsList, ['tribeName', 'tribe', 'community']);
  const isPvtg = applicantRaw.isPvtg === true || /PVTG/i.test(String(category)) || /PVTG/i.test(String(subCategory));

  // Resolved Education fields
  const currentClass = unwrap(educationRaw.currentClass) || unwrap(educationRaw.class) || unwrap(educationRaw.standard) || findFieldInDocuments(documentsList, ['class', 'currentClass', 'standard']);
  const institutionName = unwrap(educationRaw.institutionName) || unwrap(educationRaw.institution) || unwrap(educationRaw.schoolName) || findFieldInDocuments(documentsList, ['institution', 'school', 'college', 'board']);
  const institutionType = unwrap(educationRaw.institutionType) || unwrap(educationRaw.schoolType);
  const qualifyingDegree = unwrap(educationRaw.qualifyingDegree) || unwrap(educationRaw.highestQualification) || unwrap(educationRaw.postgraduateDegree) || unwrap(educationRaw.qualification) || findFieldInDocuments(documentsList, ['degree', 'qualifyingDegree', 'examination']);
  const targetDegreeLevel = unwrap(educationRaw.targetDegreeLevel) || unwrap(educationRaw.programmeLevel) || unwrap(educationRaw.courseLevel) || unwrap(educationRaw.enrolledProgramme) || unwrap(educationRaw.course);
  
  const rawPct = (educationRaw.percentage !== undefined && educationRaw.percentage !== null)
    ? unwrap(educationRaw.percentage)
    : (educationRaw.qualifyingPercentage !== undefined && educationRaw.qualifyingPercentage !== null)
      ? unwrap(educationRaw.qualifyingPercentage)
      : (educationRaw.postgraduatePercentage !== undefined && educationRaw.postgraduatePercentage !== null)
        ? unwrap(educationRaw.postgraduatePercentage)
        : findFieldInDocuments(documentsList, ['percentage', 'aggregatePercentage']);
  const percentage = parseNumber(rawPct);

  // Resolved Financial fields
  const rawIncome = (financialRaw.annualIncome !== undefined && financialRaw.annualIncome !== null)
    ? unwrap(financialRaw.annualIncome)
    : (financialRaw.annualFamilyIncome !== undefined && financialRaw.annualFamilyIncome !== null)
      ? unwrap(financialRaw.annualFamilyIncome)
      : (applicantRaw.annualFamilyIncome !== undefined && applicantRaw.annualFamilyIncome !== null)
        ? unwrap(applicantRaw.annualFamilyIncome)
        : findFieldInDocuments(documentsList, ['annualIncome', 'income', 'annualFamilyIncome']);
  const annualIncome = parseNumber(rawIncome);
  const receivingOtherScholarship = financialRaw.receivingOtherScholarship === true || applicantRaw.hasOtherScholarship === true || applicantRaw.receivingConcurrentScholarship === true;

  // Resolved Bank fields
  const accountNumber = unwrap(bankRaw.accountNumber) || unwrap(bankRaw.accountNo) || findFieldInDocuments(documentsList, ['maskedAccountNumber', 'accountNumber', 'accountNo']);
  const ifsc = unwrap(bankRaw.ifsc) || unwrap(bankRaw.ifscCode) || unwrap(bankRaw.IFSC) || findFieldInDocuments(documentsList, ['IFSC', 'ifsc', 'ifscCode']);
  const bankName = unwrap(bankRaw.bankName) || findFieldInDocuments(documentsList, ['bankName', 'bank']);

  return {
    applicationId: application.applicationId || `APP-${Date.now().toString().slice(-6)}`,
    scheme: application.scheme || application.schemeId || 'PRE_MATRIC',
    applicant: {
      ...applicantRaw,
      fullName,
      dateOfBirth,
      age,
      category,
      subCategory,
      isPvtg
    },
    education: {
      ...educationRaw,
      currentClass,
      institutionName,
      institutionType,
      qualifyingDegree,
      targetDegreeLevel,
      percentage
    },
    financial: {
      ...financialRaw,
      annualIncome,
      annualFamilyIncome: annualIncome,
      receivingOtherScholarship
    },
    bank: {
      ...bankRaw,
      accountNumber,
      ifsc,
      bankName
    },
    documentsList,
    documentsMap,
    crossDocumentValidation,
    anomalies,
    reviewFlags,
    raw: application
  };
}

module.exports = {
  unwrap,
  parseNumber,
  calculateAge,
  adaptApplication
};
