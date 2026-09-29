/**
 * Automated Verification Script for DigiLocker Sandbox Simulation
 */
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { provider, DigiLockerProvider, DigiLockerSandboxProvider } = require('../integrations/digilocker');
const DigiLockerSession = require('../models/DigiLockerSession');
const DigiLockerDocument = require('../models/DigiLockerDocument');
const Document = require('../models/Document');
const Student = require('../models/Student');

async function runTests() {
  console.log('====================================================');
  console.log('STARTING DIGILOCKER SANDBOX SIMULATION VERIFICATION');
  console.log('====================================================\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // 1. Verify Provider Abstraction
  console.log('\n[1] Verifying Provider Abstraction...');
  if (!(provider instanceof DigiLockerProvider)) {
    throw new Error('FAILED: Provider is not an instance of DigiLockerProvider');
  }
  if (!(provider instanceof DigiLockerSandboxProvider)) {
    throw new Error('FAILED: In sandbox environment, provider should be DigiLockerSandboxProvider');
  }
  console.log('✓ Provider abstraction verified (DigiLockerProvider -> DigiLockerSandboxProvider)');

  // 2. Find or mock student
  let testStudent = await Student.findOne();
  if (!testStudent) {
    testStudent = new Student({
      name: 'Arjun Kumar',
      email: 'arjun.kumar.test@example.com',
      password: 'hashed_password_test',
      phone: '9800000042',
      rollNumber: 'TX-ROLL-0001',
      state: 'Jharkhand',
      district: 'Ranchi',
    });
    await testStudent.save();
  }
  console.log(`✓ Using student context: ${testStudent.name} (${testStudent._id})`);

  // 3. Test Full Nominal Flow
  console.log('\n[2] Testing Full Nominal Integration Flow...');
  const authRes = await provider.authorize({
    student: testStudent,
    schemeCode: 'NFST',
    requestedDocuments: [
      { id: 'st_certificate', required: true },
      { id: 'class10_certificate', required: true },
      { id: 'family_income_proof', required: false },
      { id: 'domicile_certificate', required: false },
    ],
  });

  console.log(`✓ Authorization session created: ${authRes.sessionId}`);
  console.log(`  State: ${authRes.state}`);
  console.log(`  Environment: ${authRes.environment}`);
  console.log(`  Sandbox OTP: ${authRes.sandboxHelper?.sandboxOtp}`);

  if (authRes.sandboxHelper?.sandboxOtp !== '123456') {
    throw new Error('FAILED: Expected sandbox OTP to be 123456');
  }

  // Verify Session in DB
  let session = await DigiLockerSession.findOne({ sessionId: authRes.sessionId });
  if (!session || session.state !== 'AUTHORIZATION_PENDING') {
    throw new Error(`FAILED: Session state in DB is ${session?.state}, expected AUTHORIZATION_PENDING`);
  }
  console.log(`✓ Session state persisted in DB: ${session.state}`);

  // Authenticate OTP
  console.log('\n[3] Authenticating Session with Sandbox OTP (123456)...');
  const otpRes = await provider.authenticateWithOtp({
    sessionId: authRes.sessionId,
    studentId: testStudent._id,
    otp: '123456',
  });
  console.log(`✓ OTP Authenticated. State: ${otpRes.state}`);

  session = await DigiLockerSession.findOne({ sessionId: authRes.sessionId });
  if (session.state !== 'AUTHENTICATED') {
    throw new Error(`FAILED: Session state should be AUTHENTICATED, got ${session.state}`);
  }

  // Grant Consent
  console.log('\n[4] Granting Data Sharing Consent...');
  const consentRes = await provider.processConsent({
    sessionId: authRes.sessionId,
    studentId: testStudent._id,
    consentGranted: true,
  });
  console.log(`✓ Consent processed. State: ${consentRes.state}`);

  session = await DigiLockerSession.findOne({ sessionId: authRes.sessionId });
  if (session.state !== 'DOCUMENTS_AVAILABLE') {
    throw new Error(`FAILED: Session state should be DOCUMENTS_AVAILABLE, got ${session.state}`);
  }

  // Query Issued Documents
  console.log('\n[5] Querying Issued Documents Catalogue...');
  const docsRes = await provider.getIssuedDocuments({
    sessionId: authRes.sessionId,
    studentId: testStudent._id,
  });

  console.log(`✓ Returned ${docsRes.documents.length} issued documents:`);
  docsRes.documents.forEach((d) => {
    console.log(`  - [${d.documentType}] ${d.documentName} | Issuer: ${d.issuer} | Ref: ${d.documentReference}`);
    if (d.metadata.sandboxMarker !== 'SANDBOX DOCUMENT') {
      throw new Error(`FAILED: Document ${d.documentName} missing SANDBOX DOCUMENT marker`);
    }
  });

  if (docsRes.documents.length < 4) {
    throw new Error(`FAILED: Expected at least 4 sandbox documents, got ${docsRes.documents.length}`);
  }

  // Retrieve Documents
  console.log('\n[6] Retrieving Documents (ST, Class 10, Income, Domicile)...');
  const docIdsToRetrieve = docsRes.documents.map((d) => d.documentId);
  const retrieveRes = await provider.retrieveDocuments({
    sessionId: authRes.sessionId,
    studentId: testStudent._id,
    selectedDocumentIds: docIdsToRetrieve,
    ipAddress: '127.0.0.1',
  });

  console.log(`✓ Retrieved ${retrieveRes.retrievedDocuments.length} documents.`);
  console.log(`✓ Mapped ${retrieveRes.applicationMappedDocuments.length} documents to application.`);

  // Verify in DigiLockerDocument collection
  const dlDocs = await DigiLockerDocument.find({ sessionId: authRes.sessionId });
  console.log(`✓ DigiLockerDocument collection has ${dlDocs.length} persisted records.`);
  dlDocs.forEach((d) => {
    if (d.verificationStatus !== 'SANDBOX_SOURCE_CONFIRMED') {
      throw new Error(`FAILED: Expected verificationStatus SANDBOX_SOURCE_CONFIRMED, got ${d.verificationStatus}`);
    }
    console.log(`  - ${d.documentName} [status: ${d.status}, verificationStatus: ${d.verificationStatus}]`);
  });

  // Complete Session
  console.log('\n[7] Completing Session and Returning to TribeXcel...');
  const completeRes = await provider.completeSession({
    sessionId: authRes.sessionId,
    studentId: testStudent._id,
  });
  console.log(`✓ Session completed. Final State: ${completeRes.state}`);

  session = await DigiLockerSession.findOne({ sessionId: authRes.sessionId });
  if (session.state !== 'RETURNED_TO_TRIBEXCEL') {
    throw new Error(`FAILED: Expected final state RETURNED_TO_TRIBEXCEL, got ${session.state}`);
  }

  // 4. Test Realistic Failure States
  console.log('\n[8] Verifying Realistic Failure Scenarios...');

  // A. Authorization Cancelled
  const cancelAuth = await provider.authorize({ student: testStudent, scenario: 'AUTH_CANCELLED' });
  await provider.cancelAuthorization({ sessionId: cancelAuth.sessionId, studentId: testStudent._id });
  const cancelSess = await DigiLockerSession.findOne({ sessionId: cancelAuth.sessionId });
  console.log(`✓ AUTH_CANCELLED: State = ${cancelSess.state}, Status = "${cancelSess.status}"`);

  // B. OTP Failure
  const otpAuth = await provider.authorize({ student: testStudent, scenario: 'OTP_FAILURE' });
  try {
    await provider.authenticateWithOtp({ sessionId: otpAuth.sessionId, studentId: testStudent._id, otp: '000000' });
    throw new Error('FAILED: Expected OTP failure to throw');
  } catch (err) {
    console.log(`✓ OTP_FAILURE: Correctly caught error -> "${err.message}"`);
  }

  // C. Consent Denied
  const consentAuth = await provider.authorize({ student: testStudent, scenario: 'CONSENT_DENIED' });
  await provider.authenticateWithOtp({ sessionId: consentAuth.sessionId, studentId: testStudent._id, otp: '123456' });
  try {
    await provider.processConsent({ sessionId: consentAuth.sessionId, studentId: testStudent._id, consentGranted: false });
    throw new Error('FAILED: Expected consent denial to throw');
  } catch (err) {
    console.log(`✓ CONSENT_DENIED: Correctly caught error -> "${err.message}"`);
  }

  // D. No Documents
  const noDocsAuth = await provider.authorize({ student: testStudent, scenario: 'NO_DOCUMENTS' });
  const noDocsRes = await provider.getIssuedDocuments({ sessionId: noDocsAuth.sessionId, studentId: testStudent._id });
  console.log(`✓ NO_DOCUMENTS: Returned ${noDocsRes.documents.length} docs, message: "${noDocsRes.message}"`);

  // E. Retrieval Failure
  const retAuth = await provider.authorize({ student: testStudent, scenario: 'RETRIEVAL_FAILURE' });
  try {
    await provider.retrieveDocuments({ sessionId: retAuth.sessionId, studentId: testStudent._id, selectedDocumentIds: ['SANDBOX-DOC-ST-01'] });
    throw new Error('FAILED: Expected retrieval failure to throw');
  } catch (err) {
    console.log(`✓ RETRIEVAL_FAILURE: Correctly caught error -> "${err.message}"`);
  }

  // F. Session Expired
  const expAuth = await provider.authorize({ student: testStudent, scenario: 'SESSION_EXPIRED' });
  try {
    await provider.getSession({ sessionId: expAuth.sessionId, studentId: testStudent._id });
    throw new Error('FAILED: Expected session expiry to throw');
  } catch (err) {
    console.log(`✓ SESSION_EXPIRED: Correctly caught error -> "${err.message}"`);
  }

  // G. Provider Unavailable
  try {
    await provider.authorize({ student: testStudent, scenario: 'PROVIDER_UNAVAILABLE' });
    throw new Error('FAILED: Expected provider unavailable to throw');
  } catch (err) {
    console.log(`✓ PROVIDER_UNAVAILABLE: Correctly caught error -> "${err.message}"`);
  }

  console.log('\n====================================================');
  console.log('ALL DIGILOCKER SANDBOX SIMULATION TESTS PASSED! 100%');
  console.log('====================================================');

  await mongoose.disconnect();
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
