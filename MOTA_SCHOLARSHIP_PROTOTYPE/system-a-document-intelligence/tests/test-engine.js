import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5001';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING MoTA DOCUMENT INTELLIGENCE ENGINE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test GET /api/health
    console.log('--- 1. Testing GET /api/health ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(healthData.status === 'UP', 'Health status is UP');
    assert(healthData.service.includes('Document Intelligence'), 'Correct service title in health response');
    assert(Array.isArray(healthData.features), 'Features list is returned');

    // 2. Test GET /api/demo-application (List scenarios)
    console.log('\n--- 2. Testing GET /api/demo-application ---');
    const demoListRes = await fetch(`${BASE_URL}/api/demo-application`);
    const demoListData = await demoListRes.json();
    assert(demoListRes.status === 200, 'Demo applications list returns HTTP 200');
    assert(Array.isArray(demoListData.availableScenarios), 'Returns available scenarios array');
    assert(demoListData.availableScenarios.length >= 3, 'Contains at least 3 scenarios (clean, missing, inconsistent)');

    // 3. Test POST /api/demo-application (Scenario: clean)
    console.log('\n--- 3. Testing POST /api/demo-application (clean) ---');
    const cleanRes = await fetch(`${BASE_URL}/api/demo-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'clean' })
    });
    const cleanData = await cleanRes.json();
    assert(cleanRes.status === 200, 'Clean scenario returns HTTP 200');
    assert(cleanData.applicationId !== undefined, 'Contains applicationId');
    assert(cleanData.applicantProfile !== undefined, 'Contains applicantProfile');
    assert(cleanData.applicantProfile.applicant.fullName === 'Sunita Soren', 'Applicant full name extracted as Sunita Soren');
    assert(cleanData.applicantProfile.applicant.category === 'ST', 'Applicant category extracted as ST');
    assert(cleanData.anomalies.level === 'LOW', 'Clean scenario anomaly level is LOW');
    assert(Array.isArray(cleanData.crossDocumentValidation), 'Cross-document validation returned');
    const nameMatch = cleanData.crossDocumentValidation.find(v => v.field === 'fullName');
    assert(nameMatch && nameMatch.status === 'MATCH', 'Name cross-validation is MATCH');

    // 4. Test POST /api/demo-application (Scenario: missing)
    console.log('\n--- 4. Testing POST /api/demo-application (missing) ---');
    const missingRes = await fetch(`${BASE_URL}/api/demo-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'missing' })
    });
    const missingData = await missingRes.json();
    assert(missingRes.status === 200, 'Missing scenario returns HTTP 200');
    assert(missingData.applicantProfile.financial.annualIncome === null, 'Missing annual income properly represented as null (no hallucination)');
    assert(missingData.applicantProfile.bank.ifsc === null, 'Missing IFSC properly represented as null');
    assert(missingData.anomalies.level === 'MEDIUM' || missingData.anomalies.level === 'HIGH', 'Missing scenario flagged with appropriate anomaly level');
    assert(missingData.reviewFlags.length > 0, 'Review flags generated for missing critical info');

    // 5. Test POST /api/demo-application (Scenario: inconsistent)
    console.log('\n--- 5. Testing POST /api/demo-application (inconsistent) ---');
    const incRes = await fetch(`${BASE_URL}/api/demo-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'inconsistent' })
    });
    const incData = await incRes.json();
    assert(incRes.status === 200, 'Inconsistent scenario returns HTTP 200');
    assert(incData.anomalies.level === 'HIGH', 'Inconsistent scenario flagged with HIGH anomaly level');
    const dobVal = incData.crossDocumentValidation.find(v => v.field === 'dateOfBirth');
    assert(dobVal && dobVal.status === 'MISMATCH', 'DOB correctly flagged as MISMATCH across Aadhaar and Marksheet');
    const nameVal = incData.crossDocumentValidation.find(v => v.field === 'fullName');
    assert(nameVal && (nameVal.status === 'MISMATCH' || nameVal.status === 'MINOR_VARIATION'), 'Name difference correctly identified as MISMATCH / MINOR_VARIATION');
    assert(incData.anomalies.signals.some(s => s.toLowerCase().includes('potential inconsistency detected')), 'Uses correct advisory wording (never labels applicant fraudulent)');

    // 6. Test Single Document Upload: POST /api/analyze-document
    console.log('\n--- 6. Testing Single Document Upload POST /api/analyze-document ---');
    // Create temporary mock document files for test
    const testAadhaarPath = path.resolve(__dirname, 'test_aadhaar_card.png');
    fs.writeFileSync(testAadhaarPath, 'fake-png-binary-data-for-mota-aadhaar');

    const singleFormData = new FormData();
    const aadhaarBlob = new Blob([fs.readFileSync(testAadhaarPath)], { type: 'image/png' });
    singleFormData.append('document', aadhaarBlob, 'aadhaar_card.png');

    const singleDocRes = await fetch(`${BASE_URL}/api/analyze-document`, {
      method: 'POST',
      body: singleFormData
    });
    const singleDocData = await singleDocRes.json();
    assert(singleDocRes.status === 200, 'Single document upload returns HTTP 200');
    assert(singleDocData.documentType === 'AADHAAR', 'Document type detected as AADHAAR');
    assert(singleDocData.confidence >= 0 && singleDocData.confidence <= 1, 'Confidence is between 0 and 1');
    assert(['GOOD', 'WARNING', 'POOR'].includes(singleDocData.quality), 'Quality is one of GOOD, WARNING, POOR');
    assert(typeof singleDocData.qualityScore === 'number', 'Quality score is a number');
    assert(singleDocData.fields !== undefined, 'Extracted fields object present');

    // 7. Test Multiple Documents Upload: POST /api/analyze-documents
    console.log('\n--- 7. Testing Multiple Document Upload POST /api/analyze-documents ---');
    const testStCertPath = path.resolve(__dirname, 'test_st_certificate.pdf');
    fs.writeFileSync(testStCertPath, 'fake-pdf-binary-data-for-mota-st-cert');

    const multiFormData = new FormData();
    const stBlob = new Blob([fs.readFileSync(testStCertPath)], { type: 'application/pdf' });
    multiFormData.append('documents', aadhaarBlob, 'aadhaar_sunita.png');
    multiFormData.append('documents', stBlob, 'st_certificate_dumka.pdf');

    const multiDocRes = await fetch(`${BASE_URL}/api/analyze-documents`, {
      method: 'POST',
      body: multiFormData
    });
    const multiDocData = await multiDocRes.json();
    assert(multiDocRes.status === 200, 'Multiple documents upload returns HTTP 200');
    assert(multiDocData.applicationId !== undefined, 'Returns applicationId');
    assert(Array.isArray(multiDocData.documents) && multiDocData.documents.length === 2, 'Processes both uploaded documents');
    assert(multiDocData.applicantProfile !== undefined, 'Generates normalized applicant profile');
    assert(Array.isArray(multiDocData.crossDocumentValidation), 'Performs cross-document validation');
    assert(multiDocData.anomalies !== undefined && multiDocData.anomalies.level !== undefined, 'Returns anomaly level');
    assert(Array.isArray(multiDocData.reviewFlags), 'Returns reviewFlags array');

    // Clean up test temp files
    if (fs.existsSync(testAadhaarPath)) fs.unlinkSync(testAadhaarPath);
    if (fs.existsSync(testStCertPath)) fs.unlinkSync(testStCertPath);

    // Summary
    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
