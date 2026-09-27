import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5002';

async function runIntegrationTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING MoTA AI ENGINES INTEGRATION TESTS');
  console.log('   (System A [Doc AI] + System B [Verification])');
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
    assert(healthData.integration === 'UP', 'Integration service is UP');
    assert(healthData.systemA === 'UP', 'System A (Document Intelligence) is UP');
    assert(healthData.systemB === 'UP', 'System B (Scholarship Verification) is UP');

    // 2. Test GET /api/demo-application (scenarios list)
    console.log('\n--- 2. Testing GET /api/demo-application ---');
    const demoListRes = await fetch(`${BASE_URL}/api/demo-application`);
    const demoListData = await demoListRes.json();
    assert(demoListRes.status === 200, 'Demo list returns HTTP 200');
    assert(Array.isArray(demoListData.availableScenarios), 'Returns array of available demo scenarios');
    assert(demoListData.availableScenarios.length >= 3, 'Contains eligible, ineligible, and human_review scenarios');

    // 3. Test POST /api/demo-application (Scenario: eligible)
    console.log('\n--- 3. Testing POST /api/demo-application (eligible) ---');
    const eligibleRes = await fetch(`${BASE_URL}/api/demo-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'eligible' })
    });
    const eligibleData = await eligibleRes.json();
    assert(eligibleRes.status === 200, 'Eligible demo returns HTTP 200');
    assert(eligibleData.applicationId !== undefined, 'Returns applicationId');
    assert(eligibleData.scheme === 'PRE_MATRIC', 'Returns PRE_MATRIC scheme');
    assert(eligibleData.applicant?.fullName === 'Mangal Munda', 'Applicant name is Mangal Munda');
    assert(eligibleData.verification?.finalStatus === 'ELIGIBLE', 'Final verification status is ELIGIBLE');
    assert(eligibleData.verification?.humanReviewRequired === false, 'humanReviewRequired is false for eligible');
    assert(Array.isArray(eligibleData.verification?.ruleEvaluation), 'Rule evaluation list present');
    assert(eligibleData.verification.ruleEvaluation.every(r => r.status === 'PASS'), 'All rules PASS for eligible candidate');

    // 4. Test POST /api/demo-application (Scenario: ineligible)
    console.log('\n--- 4. Testing POST /api/demo-application (ineligible) ---');
    const ineligRes = await fetch(`${BASE_URL}/api/demo-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'ineligible' })
    });
    const ineligData = await ineligRes.json();
    assert(ineligRes.status === 200, 'Ineligible demo returns HTTP 200');
    assert(ineligData.verification?.finalStatus === 'NOT_ELIGIBLE', 'Final verification status is NOT_ELIGIBLE');
    assert(ineligData.verification?.humanReviewRequired === false, 'humanReviewRequired is false for clearly ineligible candidate');
    const failedRules = ineligData.verification?.ruleEvaluation?.filter(r => r.status === 'FAIL') || [];
    assert(failedRules.length >= 2, 'Failed multiple statutory rules (Category, Income, Marks, Age)');
    assert(ineligData.verification.deficiencies.length > 0, 'Lists specific deficiencies');

    // 5. Test POST /api/demo-application (Scenario: human_review)
    console.log('\n--- 5. Testing POST /api/demo-application (human_review) ---');
    const reviewRes = await fetch(`${BASE_URL}/api/demo-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'human_review' })
    });
    const reviewData = await reviewRes.json();
    assert(reviewRes.status === 200, 'Human review demo returns HTTP 200');
    assert(reviewData.verification?.finalStatus === 'HUMAN_REVIEW', 'Final verification status is HUMAN_REVIEW');
    assert(reviewData.verification?.humanReviewRequired === true, 'humanReviewRequired is strictly TRUE');
    const dobMismatch = reviewData.documentIntelligence?.crossDocumentValidation?.find(v => v.field === 'dateOfBirth');
    assert(dobMismatch && dobMismatch.status === 'MISMATCH', 'Date of Birth detected as MISMATCH');
    assert(reviewData.verification.explanation.toLowerCase().includes('officer') || reviewData.verification.explanation.toLowerCase().includes('human'), 'Explanation references officer / human review');

    // 6. Test End-to-End Live Processing: POST /api/process-application
    console.log('\n--- 6. Testing End-to-End Live POST /api/process-application ---');
    // Prepare sample files
    const sampleDir = path.resolve(__dirname, '../../../system-a-document-intelligence/sample-documents');
    const aadhaarPath = path.join(sampleDir, '01_aadhaar_card.pdf');
    const stCertPath = path.join(sampleDir, '02_st_certificate_jharkhand.pdf');
    const incomeCertPath = path.join(sampleDir, '03_income_certificate.pdf');

    const multiForm = new FormData();
    multiForm.append('applicationId', 'MOTA-LIVE-E2E-TEST-001');
    multiForm.append('scheme', 'PRE_MATRIC');
    multiForm.append('documents', new Blob([fs.readFileSync(aadhaarPath)], { type: 'application/pdf' }), 'aadhaar_sunita.pdf');
    multiForm.append('documents', new Blob([fs.readFileSync(stCertPath)], { type: 'application/pdf' }), 'st_certificate.pdf');
    multiForm.append('documents', new Blob([fs.readFileSync(incomeCertPath)], { type: 'application/pdf' }), 'income_certificate.pdf');

    const e2eRes = await fetch(`${BASE_URL}/api/process-application`, {
      method: 'POST',
      body: multiForm
    });
    const e2eData = await e2eRes.json();
    assert(e2eRes.status === 200, 'Live process-application returns HTTP 200');
    assert(e2eData.applicationId !== undefined, 'Returns applicationId');
    assert(e2eData.scheme === 'PRE_MATRIC', 'Target scheme preserved');
    assert(e2eData.applicant !== undefined, 'Contains applicant profile');
    assert(e2eData.documentIntelligence !== undefined, 'Contains System A document intelligence');
    assert(Array.isArray(e2eData.documentIntelligence.documentResults), 'Document results array present');
    assert(Array.isArray(e2eData.documentIntelligence.crossDocumentValidation), 'Cross-document validation present');
    assert(e2eData.verification !== undefined, 'Contains System B verification block');
    assert(['ELIGIBLE', 'NOT_ELIGIBLE', 'INCOMPLETE', 'HUMAN_REVIEW'].includes(e2eData.verification.finalStatus), 'Valid finalStatus returned');
    assert(typeof e2eData.verification.humanReviewRequired === 'boolean', 'humanReviewRequired is boolean');

    // 7. Verify Contract Compliance (Section 5)
    console.log('\n--- 7. Verifying Section 5 Response Contract Compliance ---');
    const requiredKeys = ['applicationId', 'scheme', 'applicant', 'education', 'financial', 'documents', 'documentIntelligence', 'verification'];
    const allKeysPresent = requiredKeys.every(k => e2eData.hasOwnProperty(k));
    assert(allKeysPresent, 'All 8 top-level contract keys present in response');

    const docIntelKeys = ['extractedData', 'documentResults', 'crossDocumentValidation', 'anomalies', 'reviewFlags'];
    const allDocIntelKeys = docIntelKeys.every(k => e2eData.documentIntelligence.hasOwnProperty(k));
    assert(allDocIntelKeys, 'All 5 documentIntelligence keys present in response');

    const verifyKeys = ['documentVerification', 'ruleEvaluation', 'deficiencies', 'finalStatus', 'explanation', 'humanReviewRequired'];
    const allVerifyKeys = verifyKeys.every(k => e2eData.verification.hasOwnProperty(k));
    assert(allVerifyKeys, 'All 6 verification keys present in response');

    // Summary
    console.log('\n====================================================');
    console.log(`INTEGRATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Integration test failed with error:', err);
    process.exit(1);
  }
}

runIntegrationTests();
