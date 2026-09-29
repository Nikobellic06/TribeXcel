import { getDocumentChecklist } from '../config/documents';
import * as v from './validation';

/*
 * validateStep(stepKey, scheme, data) -> { fieldName: 'err.key', ... }
 * An empty object means the step is complete.
 */

function collect(rules, values) {
  const errors = {};
  Object.entries(rules).forEach(([field, check]) => {
    const err = check(values[field], values);
    if (err) errors[field] = err;
  });
  return errors;
}

const req = v.required;
const yesNo = v.required;

function personalRules() {
  return {
    fullName: req,
    fatherName: req,
    motherName: req,
    dob: req,
    gender: req,
    email: v.email,
    mobile: v.mobile,
    altMobile: v.optionalMobile,
    addressLine: req,
    district: req,
    state: req,
    pincode: v.pincode,
  };
}

function categoryRules(scheme, values) {
  const rules = {
    tribeName: req,
    stCertificateNo: req,
    stIssuingAuthority: req,
    stIssueDate: req,
    domicileState: req,
    hasDisability: yesNo,
  };
  if (scheme.id !== 'pre-matric') rules.isPVTG = yesNo;
  if (values.hasDisability === 'yes') rules.disabilityPercent = v.percent;
  if (scheme.hasIncomeRule) {
    rules.isOrphan = yesNo;
    if (values.isOrphan !== 'yes') {
      rules.fatherOccupation = req;
      rules.motherOccupation = req;
      rules.familyIncome = v.amount;
      rules.incomeCertificateNo = req;
      rules.incomeIssuingAuthority = req;
      rules.incomeCertificateDate = req;
    }
  }
  return rules;
}

function marksRules(values) {
  const rules = { gradeType: req };
  if (values.gradeType === 'cgpa') {
    rules.cgpa = req;
    rules.convertedPercentage = v.percent;
  } else {
    rules.percentage = v.percent;
  }
  return rules;
}

function academicRules(scheme, values) {
  if (scheme.academicForm === 'school') {
    return {
      className: req,
      schoolName: req,
      udiseCode: v.udise,
      schoolType: req,
      board: req,
      schoolState: req,
      schoolDistrict: req,
      residence: req,
      previousClassPercent: v.percent,
      previousClassYear: req,
      repeatingClass: yesNo,
      otherScholarship: yesNo,
    };
  }
  if (scheme.academicForm === 'research') {
    return {
      courseLevel: req,
      stream: req,
      subject: req,
      universityName: req,
      universityType: req,
      admissionDate: req,
      pgDegree: req,
      pgUniversity: req,
      pgYear: req,
      ...marksRules(values),
      otherFellowship: yesNo,
      accommodation: req,
    };
  }
  if (scheme.academicForm === 'post-matric') {
    return {
      courseLevel: req,
      currentCourse: req,
      currentYear: req,
      courseDuration: req,
      institutionName: req,
      universityOrBoard: req,
      institutionState: req,
      enrollmentNumber: req,
      admissionYear: req,
      residence: req,
      blockName: req,
    };
  }
  if (scheme.academicForm === 'top-class') {
    const isRenewal = values.applicationType === 'RENEWAL';
    if (isRenewal) {
      return {
        applicationType: req,
        premierInstituteName: req,
        programmeName: req,
        rollNumber: req,
        currentYearSemester: req,
        previousYearMarksPercentage: v.percent,
        hasBacklogs: yesNo,
        promotedToNextYear: yesNo,
        tuitionFeePerAnnum: req,
      };
    }
    return {
      applicationType: req,
      premierInstituteName: req,
      programmeName: req,
      rollNumber: req,
      entranceExamName: req,
      entranceRank: req,
      admissionDate: req,
      tuitionFeePerAnnum: req,
    };
  }
  // overseas (NOS)
  const overseasRules = {
    courseLevel: req,
    fieldOfStudy: req,
    courseName: req,
    universityName: req,
    country: req,
    admissionStatus: req,
    qsRank: (val) => (v.isBlank(val) ? null : Number(val) > 0 ? null : 'err.required'),
    courseDurationMonths: req,
    qualifyingDegree: req,
    qualifyingUniversity: req,
    qualifyingYear: req,
    ...marksRules(values),
    isEmployed: yesNo,
    hasAcademicGap: yesNo,
    siblingAvailed: yesNo,
    previousAward: yesNo,
  };
  if (values.isEmployed === 'yes') {
    overseasRules.employerName = req;
    overseasRules.designation = req;
  }
  return overseasRules;
}

function bankRules() {
  return {
    accountHolder: req,
    accountNumber: v.accountNumber,
    confirmAccountNumber: (val, all) =>
      v.isBlank(val) ? 'err.required' : val === all.accountNumber ? null : 'err.accountMatch',
    ifsc: v.ifsc,
    bankName: req,
    branchName: req,
    aadhaarSeeded: (val) => (val === 'yes' ? null : 'err.required'),
  };
}

export function validateStep(stepKey, scheme, data = {}) {
  switch (stepKey) {
    case 'personal':
      return collect(personalRules(), data.personal || {});
    case 'category': {
      const values = data.category || {};
      return collect(categoryRules(scheme, values), values);
    }
    case 'academic': {
      const values = data.academic || {};
      return collect(academicRules(scheme, values), values);
    }
    case 'bank':
      return collect(bankRules(), data.bank || {});
    case 'documents': {
      const docs = data.documents || {};
      const errors = {};
      getDocumentChecklist(scheme.id, data).forEach((doc) => {
        if (doc.required && !docs[doc.id]) errors[doc.id] = 'err.required';
      });
      return errors;
    }
    case 'review': {
      const d = data.declarations || {};
      const errors = {};
      ['truthful', 'consent', 'singleScholarship'].forEach((k) => {
        if (!d[k]) errors[k] = 'err.required';
      });
      return errors;
    }
    default:
      return {};
  }
}

export const isStepComplete = (stepKey, scheme, data) =>
  Object.keys(validateStep(stepKey, scheme, data)).length === 0;
