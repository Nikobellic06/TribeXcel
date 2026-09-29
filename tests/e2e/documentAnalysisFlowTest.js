/**
 * TribeXcel — End-to-End Test for Hybrid DigiLocker + Post-Submission Document Analysis
 * 
 * Verifies:
 * 1. Hybrid document intake: DigiLocker wallet document + manual upload (no upload-time OCR delay).
 * 2. Post-submission AI Document Analysis Engine:
 *    - Case A: Discrepancy detected (Income exceeds Pre-Matric statutory ceiling) -> Transitions to 'Deficient' with actionable instructions.
 *    - Case B: Applicant corrects and resubmits -> Transitions to 'Submitted' with high verification confidence.
 * 3. Administrative Review & Merit Selection:
 *    - Application appears in Admin Review Queue.
 *    - Officer verifies application -> Marks 'Eligible'.
 *    - Verified application enters Merit Selection pool.
 */

const path = require('path');
const fs = require('fs');
const apiServerDir = path.join(__dirname, '..', '..', 'services', 'api-server');

try {
  require(path.join(apiServerDir, 'node_modules', 'dotenv')).config({ path: path.join(apiServerDir, '.env') });
} catch {
  try {
    require('dotenv').config({ path: path.join(apiServerDir, '.env') });
  } catch {}
}

let mongoose;
try {
  mongoose = require(path.join(apiServerDir, 'node_modules', 'mongoose'));
} catch {
  mongoose = require('mongoose');
}

const Student = require(path.join(apiServerDir, 'models', 'Student'));
const Application = require(path.join(apiServerDir, 'models', 'Application'));
const Document = require(path.join(apiServerDir, 'models', 'Document'));
const DigiLockerDocument = require(path.join(apiServerDir, 'models', 'DigiLockerDocument'));
const Admin = require(path.join(apiServerDir, 'models', 'Admin'));
const { processApplicationDocumentAnalysis } = require(path.join(apiServerDir, 'services', 'documentAnalysisEngine'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tribal-scholarship';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTest() {
  console.log('\n========================================================================');
  console.log('TRIBEXCEL — DIGILOCKER + POST-SUBMISSION DOCUMENT ANALYSIS E2E TEST');
  console.log('========================================================================\n');

  await mongoose.connect(MONGO_URI);

  // 1. Create Test Student
  const student = new Student({
    name: 'Birsa Munda',
    email: `birsa_${Date.now()}@tribexcel.test`,
    rollNumber: `TX-ROLL-${Date.now().toString().slice(-6)}`,
    phone: '9876543210',
    dob: new Date('2006-03-20'),
    gender: 'Male',
    state: 'Jharkhand',
    password: 'Password123!',
    aadhaarLast4: '1234',
    aadhaarFormatValidated: true,
    aadhaarVerified: true,
  });
  await student.save();
  assert(Boolean(student._id), `Student record created: ${student.name} (${student.email})`);

  // 2. Simulate DigiLocker Document in student's wallet
  const dlCert = new DigiLockerDocument({
    ownerId: student._id,
    studentId: student._id,
    documentType: 'st_certificate',
    documentName: 'Scheduled Tribe Certificate',
    documentReference: 'JH/ST/2026/89412',
    certificateNo: 'JH/ST/2026/89412',
    issuer: 'Sub-Divisional Officer, Ranchi, Government of Jharkhand',
    issuedDate: new Date('2024-01-10'),
    status: 'READY_TO_SHARE',
    extractedData: new Map([
      ['holderName', { value: 'Birsa Munda' }],
      ['tribeName', { value: 'Munda' }],
      ['state', { value: 'Jharkhand' }],
      ['certificateNumber', { value: 'JH/ST/2026/89412' }],
    ]),
  });
  await dlCert.save();
  assert(Boolean(dlCert._id), `DigiLocker certificate created in student wallet: ${dlCert.documentName}`);

  // 3. Attach hybrid documents to Document collection (one from DigiLocker, one manual)
  const stDoc = new Document({
    documentId: `DOC-${Date.now()}-1`,
    studentId: student._id,
    name: 'Scheduled Tribe Certificate.pdf',
    fileName: 'Scheduled Tribe Certificate.pdf',
    mimeType: 'application/pdf',
    documentType: 'st_certificate',
    source: 'digilocker',
    status: 'ATTACHED',
    verificationStatus: 'VERIFIED',
    extractedData: {
      applicantName: 'Birsa Munda',
      casteOrTribe: 'Munda',
    },
  });
  await stDoc.save();

  const incomeDoc = new Document({
    documentId: `DOC-${Date.now()}-2`,
    studentId: student._id,
    name: 'Income_Certificate_2026.pdf',
    fileName: 'Income_Certificate_2026.pdf',
    mimeType: 'application/pdf',
    documentType: 'family_income_proof',
    source: 'manual',
    status: 'ATTACHED',
    verificationStatus: 'PENDING',
    extractedData: {
      applicantName: 'Birsa Munda',
      annualIncome: 350000, // Exceeds Pre-Matric limit of 2,50,000!
    },
  });
  await incomeDoc.save();
  assert(Boolean(stDoc._id && incomeDoc._id), 'Hybrid document collection records created (DigiLocker + Manual)');

  // 4. Case A: Submit Pre-Matric Application with Income Exceeding Scheme Limit
  console.log('\n--- Step A: Submitting Pre-Matric Application with Non-Compliant Income (₹3,50,000 > ₹2,50,000) ---');
  const appCode1 = `TX-2026-27-PRE_MATRIC-${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
  const app1 = new Application({
    applicationCode: appCode1,
    student: student._id,
    scheme: 'PRE_MATRIC',
    session: '2026-27',
    name: student.name,
    email: student.email,
    phone: student.phone,
    dob: student.dob,
    gender: student.gender,
    state: student.state,
    status: 'Submitted',
    declaredIncome: 350000,
    schemeData: {
      sections: {
        personal: { fullName: student.name },
        academic: { className: 'IX', schoolName: 'Ranchi Tribal High School' },
        category: { domicileState: 'Jharkhand', familyAnnualIncome: 350000 },
      },
    },
    documents: [
      {
        name: 'Passport_Photo.jpg',
        docType: 'photo',
        source: 'manual',
        verificationStatus: 'PENDING',
      },
      {
        name: 'Scheduled Tribe Certificate.pdf',
        docType: 'st_certificate',
        source: 'digilocker',
        verificationStatus: 'VERIFIED',
      },
      {
        name: 'Income_Certificate_2026.pdf',
        docType: 'family_income_proof',
        source: 'manual',
        verificationStatus: 'PENDING',
      },
      {
        name: 'Domicile_Certificate.pdf',
        docType: 'domicile_certificate',
        source: 'digilocker',
        verificationStatus: 'VERIFIED',
      },
    ],
  });
  await app1.save();

  // Run Document Analysis Engine
  const analysisResultA = await processApplicationDocumentAnalysis(app1, student);

  assert(analysisResultA.status === 'Deficient', `Analysis Result status is 'Deficient' (got: ${analysisResultA.status})`);
  assert(analysisResultA.discrepancies.length > 0, `Discrepancies identified: ${analysisResultA.discrepancies.length}`);
  assert(app1.status === 'Deficient', `Application in DB transitioned to 'Deficient'`);
  assert(app1.deficiencies.length > 0, `Actionable deficiencies recorded in application: ${app1.deficiencies[0].actionRequired}`);
  assert(app1.aiVerification.status === 'FLAGGED', `aiVerification.status is 'FLAGGED'`);

  // 5. Case B: Applicant Corrects Income & Resubmits Application
  console.log('\n--- Step B: Applicant Resolves Deficiency (Corrects Income to ₹1,80,000) & Resubmits ---');
  app1.declaredIncome = 180000;
  app1.schemeData.sections.category.familyAnnualIncome = 180000;
  incomeDoc.extractedData.annualIncome = 180000;
  await incomeDoc.save();

  // Run Document Analysis Engine again
  const analysisResultB = await processApplicationDocumentAnalysis(app1, student);

  assert(analysisResultB.status === 'Submitted', `Analysis Result status transitioned to 'Submitted' (got: ${analysisResultB.status})`);
  assert(analysisResultB.discrepancies.length === 0, `Discrepancies resolved (0 remaining)`);
  assert(app1.status === 'Submitted', `Application in DB transitioned to 'Submitted'`);
  assert(app1.aiVerification.status === 'COMPLETED', `aiVerification.status is 'COMPLETED'`);
  assert(app1.aiVerification.score >= 90, `aiVerification confidence score is high (${app1.aiVerification.score})`);

  // 6. Case C: Administrative Portal Review & Merit Selection
  console.log('\n--- Step C: Admin Officer Review & Merit Selection ---');
  // Find verified application in officer review queue
  const pendingOfficerReview = await Application.find({
    status: { $in: ['Submitted', 'Pending', 'Under Scrutiny'] },
    scheme: 'PRE_MATRIC',
  });
  assert(pendingOfficerReview.some((a) => a.applicationCode === app1.applicationCode), `Application appears in Officer Scrutiny queue`);

  // Officer approves application as 'Eligible'
  app1.status = 'Eligible';
  app1.reviewHistory.push({
    action: 'Officer Verification Completed',
    fromStatus: 'Submitted',
    toStatus: 'Eligible',
    byName: 'Sanjay Oraon',
    byRole: 'District Welfare Officer',
    remarks: 'Documents and criteria thoroughly verified. Approved for merit selection.',
    at: new Date(),
  });
  await app1.save();
  assert(app1.status === 'Eligible', `Officer marks application status as 'Eligible'`);

  // Application enters Merit Selection ranking pool
  const meritPool = await Application.find({
    scheme: 'PRE_MATRIC',
    status: 'Eligible',
  });
  assert(meritPool.some((a) => a.applicationCode === app1.applicationCode), `Eligible application is available in Merit Selection ranking pool`);

  // 7. Cleanup
  await Application.deleteMany({ student: student._id });
  await Document.deleteMany({ studentId: student._id });
  await DigiLockerDocument.deleteMany({ $or: [{ ownerId: student._id }, { studentId: student._id }] });
  await Student.deleteOne({ _id: student._id });

  console.log('\n========================================================================');
  console.log(`TEST SUITE RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================================\n');

  await mongoose.disconnect();
  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
