/*
 * Demo data for the admin portal:  npm run seed:applications
 *
 * Creates reproducible demo students and applications for Pre-Matric, NFST and
 * NOS, covering every review situation (clean, missing documents, income above
 * the limit, name mismatch, e-KYC pending, decided cases).
 *
 * - Only records created by this script are replaced (email @demo.tribexcel.in,
 *   schemeData.source "seed-demo"). Real data is never deleted.
 * - No AI result is invented: aiAnalysis is recorded as "not run". Officers can
 *   run the real AI engine from the application page.
 * - Rule evaluation and review flags are computed by services/review.js.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Student = require('../models/Student');
const review = require('../services/review');

const DAY = 24 * 60 * 60 * 1000;
const DEMO_DOMAIN = 'demo.tribexcel.in';

const PEOPLE = [
  ['Sunita Murmu', 'Female', 'Jharkhand', 'Khunti', 'Santhal'],
  ['Vikram Meena', 'Male', 'Rajasthan', 'Dausa', 'Meena'],
  ['Priya Soren', 'Female', 'Odisha', 'Mayurbhanj', 'Santhal'],
  ['Amit Munda', 'Male', 'Jharkhand', 'Gumla', 'Munda'],
  ['Kavita Gond', 'Female', 'Madhya Pradesh', 'Mandla', 'Gond'],
  ['Deepak Bhil', 'Male', 'Rajasthan', 'Banswara', 'Bhil'],
  ['Anita Toppo', 'Female', 'Chhattisgarh', 'Jashpur', 'Oraon'],
  ['Rahul Kumar Oraon', 'Male', 'Jharkhand', 'Ranchi', 'Oraon'],
  ['Rekha Hembrom', 'Female', 'West Bengal', 'Purulia', 'Santhal'],
  ['Sanjay Kerketta', 'Male', 'Odisha', 'Sundargarh', 'Kharia'],
  ['Neha Minz', 'Female', 'Chhattisgarh', 'Surguja', 'Oraon'],
  ['Manoj Tirkey', 'Male', 'Jharkhand', 'Simdega', 'Oraon'],
  ['Pooja Marandi', 'Female', 'Jharkhand', 'Dumka', 'Santhal'],
  ['Ravi Uikey', 'Male', 'Madhya Pradesh', 'Dindori', 'Gond'],
  ['Meena Kujur', 'Female', 'Odisha', 'Sundargarh', 'Oraon'],
  ['Arjun Baskey', 'Male', 'West Bengal', 'Jhargram', 'Santhal'],
  ['Lalita Netam', 'Female', 'Chhattisgarh', 'Kanker', 'Gond'],
  ['Suresh Damor', 'Male', 'Gujarat', 'Dahod', 'Bhil'],
  ['Asha Lakra', 'Female', 'Jharkhand', 'Lohardaga', 'Oraon'],
  ['Birsa Horo', 'Male', 'Jharkhand', 'Khunti', 'Munda'],
];

const FATHERS = ['Ramesh', 'Budhu', 'Mangal', 'Sukra', 'Jitu', 'Lakhan', 'Somra', 'Bandhan'];
const MOTHERS = ['Sita', 'Phulmani', 'Lalita', 'Jayanti', 'Sarita', 'Mani'];
const surname = (name) => name.split(' ').slice(-1)[0];
const father = (i, name) => `${FATHERS[i % FATHERS.length]} ${surname(name)}`;
const mother = (i, name) => `${MOTHERS[i % MOTHERS.length]} ${surname(name)}`;

const doc = (docType, name, source, extra = {}) => ({ docType, name, source, verified: source === 'digilocker', fileName: `${docType}.pdf`, mimeType: 'application/pdf', ...extra });

function preMatric(i, person, variant) {
  const [name, gender, state, district, tribe] = person;
  const income = variant === 'income_high' ? 310000 : 96000 + i * 9000;
  return {
    scheme: 'PRE_MATRIC',
    course: `Class ${i % 2 ? 'X' : 'IX'}`,
    institution: `Government High School, ${district}`,
    dob: new Date(Date.UTC(2011 - (i % 2), (i * 3) % 12, 5 + i)),
    declaredIncome: income,
    sections: {
      personal: { fullName: name, fatherName: father(i, name), motherName: mother(i, name), gender, state, district, addressLine: `Village ${district}`, pincode: '8352' + String(10 + i) },
      category: { tribeName: tribe, stCertificateNo: `CSTCR/${state.slice(0, 2).toUpperCase()}/2025/${100200 + i}`, stIssuingAuthority: 'State Revenue Department', domicileState: state, hasDisability: 'no', isOrphan: 'no', familyIncome: String(income), incomeCertificateNo: `INCER/${state.slice(0, 2).toUpperCase()}/2025/${300400 + i}` },
      academic: { className: i % 2 ? 'X' : 'IX', schoolName: `Government High School, ${district}`, udiseCode: `2015010${1000 + i}`, residence: i % 3 ? 'day' : 'hostel', previousClassPercent: String(58 + i), repeatingClass: 'no', otherScholarship: 'no' },
      bank: { accountOf: 'parent', accountHolder: father(i, name), accountNumber: `3456789${1000 + i}`, ifsc: 'SBIN0001234', bankName: 'State Bank of India', branchName: district, aadhaarSeeded: 'yes' },
      declarations: { truthful: true, consent: true, singleScholarship: true },
    },
    documents: [
      doc('photo', 'Passport-size photograph', 'manual'),
      doc('signature', 'Signature', 'manual'),
      doc('st_certificate', 'Scheduled Tribe (ST) certificate', 'digilocker', { certificateNo: `CSTCR/${state.slice(0, 2).toUpperCase()}/2025/${100200 + i}`, issuer: 'State Revenue Department' }),
      doc('domicile_certificate', 'Domicile certificate', 'digilocker'),
      doc('income_certificate', 'Family income certificate', 'digilocker', { certificateNo: `INCER/${state.slice(0, 2).toUpperCase()}/2025/${300400 + i}` }),
      ...(variant === 'missing_doc' ? [] : [doc('school_bonafide', 'School bonafide / enrolment certificate', 'manual')]),
    ],
  };
}

function nfst(i, person, variant) {
  const [name, gender, state, district, tribe] = person;
  const marks = variant === 'low_marks' ? 52.4 : 61 + i;
  return {
    scheme: 'NFST',
    course: 'Ph.D - Sociology',
    institution: ['Central University of Jharkhand', 'University of Hyderabad', 'Jawaharlal Nehru University', 'Banaras Hindu University'][i % 4],
    dob: new Date(Date.UTC(variant === 'over_age' ? 1988 : 1996 + (i % 3), (i * 5) % 12, 10)),
    declaredMarks: marks,
    sections: {
      personal: { fullName: name, fatherName: father(i, name), motherName: mother(i, name), gender, state, district },
      category: { tribeName: tribe, stCertificateNo: `CSTCR/${state.slice(0, 2).toUpperCase()}/2019/${500100 + i}`, domicileState: state, isPVTG: i % 5 === 0 ? 'yes' : 'no', hasDisability: 'no' },
      academic: { courseLevel: 'Ph.D', stream: 'Humanities & Social Sciences', subject: 'Sociology', universityName: 'University', universityType: 'UGC 2(f)/12(B)', pgDegree: 'M.A. Sociology', pgUniversity: 'Ranchi University', pgYear: '2024', gradeType: 'percent', percentage: String(marks), otherFellowship: variant === 'other_fellowship' ? 'yes' : 'no', accommodation: 'hostel' },
      bank: { accountOf: 'student', accountHolder: variant === 'name_mismatch' ? name.split(' ').slice(0, 2).join(' ') : name, accountNumber: `50100${200000 + i}`, ifsc: 'HDFC0001234', bankName: 'HDFC Bank', branchName: district, aadhaarSeeded: 'yes' },
      declarations: { truthful: true, consent: true, singleScholarship: true },
    },
    documents: [
      doc('photo', 'Passport-size photograph', 'manual'),
      doc('signature', 'Signature', 'manual'),
      doc('st_certificate', 'Scheduled Tribe (ST) certificate', 'digilocker', { certificateNo: `CSTCR/${state.slice(0, 2).toUpperCase()}/2019/${500100 + i}` }),
      ...(i % 5 === 0 ? [doc('pvtg_certificate', 'PVTG certificate', 'digilocker')] : []),
      doc('class10_certificate', 'Class 10 certificate (proof of date of birth)', 'digilocker'),
      doc('pg_marksheet', "Post-graduation (Master's) marksheet", 'digilocker'),
      doc('admission_letter', 'Admission / joining certificate from the university', 'manual'),
    ],
  };
}

function nos(i, person, variant) {
  const [name, gender, state, district, tribe] = person;
  const qs = variant === 'qs_low' ? 1350 : [42, 118, 305, 640][i % 4];
  return {
    scheme: 'NOS',
    course: "Master's degree - MSc Data Science",
    institution: ['University of Edinburgh, United Kingdom', 'University of Toronto, Canada', 'University of Melbourne, Australia', 'TU Munich, Germany'][i % 4],
    dob: new Date(Date.UTC(1999 + (i % 3), (i * 2) % 12, 20)),
    declaredMarks: 58 + i,
    declaredIncome: 420000,
    sections: {
      personal: { fullName: name, fatherName: father(i, name), motherName: mother(i, name), gender, state, district },
      category: { tribeName: tribe, stCertificateNo: `CSTCR/${state.slice(0, 2).toUpperCase()}/2018/${700300 + i}`, domicileState: state, isPVTG: 'no', hasDisability: 'no', isOrphan: 'no', familyIncome: '420000', incomeCertificateNo: `INCER/${state.slice(0, 2).toUpperCase()}/2025/${800100 + i}` },
      academic: { courseLevel: 'masters', fieldOfStudy: 'STEM', courseName: 'MSc Data Science', universityName: 'University', country: 'United Kingdom', qsRank: String(qs), admissionStatus: 'offer', courseDurationMonths: '12', qualifyingDegree: 'B.Tech', qualifyingUniversity: 'NIT Rourkela', qualifyingYear: '2024', gradeType: 'percent', percentage: String(58 + i), siblingAvailed: 'no', previousAward: 'no' },
      bank: { accountOf: 'student', accountHolder: name, accountNumber: `91002${300000 + i}`, ifsc: 'UBIN0531234', bankName: 'Union Bank of India', branchName: district, aadhaarSeeded: 'yes' },
      declarations: { truthful: true, consent: true, singleScholarship: true },
    },
    documents: [
      doc('photo', 'Passport-size photograph', 'manual'),
      doc('signature', 'Signature', 'manual'),
      doc('st_certificate', 'Scheduled Tribe (ST) certificate', 'digilocker', { certificateNo: `CSTCR/${state.slice(0, 2).toUpperCase()}/2018/${700300 + i}` }),
      doc('income_certificate', 'Family income certificate', 'digilocker', { certificateNo: `INCER/${state.slice(0, 2).toUpperCase()}/2025/${800100 + i}` }),
      doc('class10_certificate', 'Class 10 certificate (proof of date of birth)', 'digilocker'),
      doc('ug_marksheet', "Bachelor's degree marksheet", 'digilocker'),
      ...(variant === 'missing_doc' ? [] : [doc('offer_letter', 'Offer of admission from the foreign university', 'manual')]),
    ],
  };
}

/* [builder, variant, kycDone, officer decision, days ago] */
const PLAN = [
  [preMatric, 'clean', true, null, 1],
  [preMatric, 'missing_doc', true, null, 2],
  [preMatric, 'income_high', true, null, 3],
  [preMatric, 'clean', false, null, 4],
  [preMatric, 'clean', true, 'verify', 9],
  [preMatric, 'clean', true, 'defective', 12],
  [nfst, 'clean', true, null, 1],
  [nfst, 'name_mismatch', true, null, 2],
  [nfst, 'low_marks', true, null, 5],
  [nfst, 'other_fellowship', true, null, 6],
  [nfst, 'clean', true, 'verify', 10],
  [nfst, 'clean', true, 'verify', 11],
  [nfst, 'over_age', true, 'reject', 14],
  [nfst, 'clean', true, 'select', 20],
  [nos, 'clean', true, null, 2],
  [nos, 'qs_low', true, null, 3],
  [nos, 'missing_doc', true, null, 8],
  [nos, 'clean', true, 'verify', 13],
  [nos, 'clean', true, 'verify', 15],
  [nos, 'clean', false, null, 16],
];

const SEED_OFFICER = { byName: 'Demo Officer', byRole: 'Scholarship Verification Officer' };

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const oldStudents = await Student.find({ email: new RegExp(`@${DEMO_DOMAIN.replace(/\./g, '\\.')}$`) }).select('_id');
  await Application.deleteMany({ $or: [{ 'schemeData.source': 'seed-demo' }, { student: { $in: oldStudents.map((s) => s._id) } }] });
  await Student.deleteMany({ _id: { $in: oldStudents.map((s) => s._id) } });

  let created = 0;
  for (let i = 0; i < PLAN.length; i += 1) {
    const [build, variant, kycDone, decision, daysAgo] = PLAN[i];
    const person = PEOPLE[i % PEOPLE.length];
    const data = build(i, person, variant);
    const [name, gender, state, district] = person;
    const email = `applicant${i + 1}@${DEMO_DOMAIN}`;

    const student = await Student.create({
      name,
      email,
      rollNumber: `DEMO-${String(i + 1).padStart(3, '0')}`,
      phone: `98${String(76543210 + i).slice(0, 8)}`,
      dob: data.dob,
      state,
      gender,
      password: 'Demo@12345',
      aadhaarVerified: kycDone,
      aadhaarLast4: kycDone ? String(2346 + i).slice(-4) : '',
      aadhaarVerifiedAt: kycDone ? new Date(Date.now() - (daysAgo + 1) * DAY) : undefined,
    });

    const submittedAt = new Date(Date.now() - daysAgo * DAY);
    const app = new Application({
      applicationCode: `ST-2026-${String(1200 + i + 1).padStart(6, '0')}`,
      student: student._id,
      name,
      email,
      phone: student.phone,
      dob: data.dob,
      gender,
      category: 'Scheduled Tribe',
      state,
      district,
      scheme: data.scheme,
      session: '2026-27',
      course: data.course,
      institution: data.institution,
      documents: data.documents,
      schemeData: { sections: data.sections, source: 'seed-demo' },
      declaredIncome: data.declaredIncome,
      declaredMarks: data.declaredMarks,
      aiAnalysis: { status: 'not_run', preliminaryResult: 'NOT_RUN', reason: 'Demo record: AI-assisted analysis has not been run. Use "Run AI analysis" on the application page.' },
      submittedAt,
      lastActionAt: submittedAt,
      status: 'Pending',
    });

    const assessment = review.assess(app.toObject(), student.toObject());
    review.applySummary(app, assessment);
    app.status = review.initialStatus(assessment);
    app.reviewHistory.push({ action: 'Submitted', toStatus: app.status, byName: name, byRole: 'Applicant', at: submittedAt });

    const decidedAt = new Date(submittedAt.getTime() + 2 * DAY);
    const record = (action, toStatus, extra = {}) => {
      app.reviewHistory.push({ ...SEED_OFFICER, action, fromStatus: app.status, toStatus, at: decidedAt, ...extra });
      app.status = toStatus;
      app.lastActionAt = decidedAt;
    };
    if (decision === 'verify') record('Verified by officer', 'Eligible', { remarks: 'Documents checked against originals.' });
    if (decision === 'select') {
      record('Verified by officer', 'Eligible');
      record('Selected in merit list', 'Selected');
    }
    if (decision === 'defective') {
      const reason = 'School bonafide certificate is not signed by the head of the school';
      const correction = 'Upload a signed and stamped bonafide certificate';
      app.adminRemarks = `Illegible or poor-quality document: ${reason}. Required correction: ${correction}`;
      record('Marked defective', 'Deficient', { category: 'Illegible or poor-quality document', reason, requiredCorrection: correction });
    }
    if (decision === 'reject') {
      app.adminRemarks = 'Does not meet age criteria. Applicant is above 36 years on 1 July 2026.';
      record('Rejected', 'Rejected', { reason: 'Does not meet age criteria', remarks: 'Applicant is above 36 years on 1 July 2026.' });
    }

    await app.save();
    created += 1;
  }

  console.log(`Seeded ${created} demo applications (students: applicant1..${PLAN.length}@${DEMO_DOMAIN}, password Demo@12345).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
