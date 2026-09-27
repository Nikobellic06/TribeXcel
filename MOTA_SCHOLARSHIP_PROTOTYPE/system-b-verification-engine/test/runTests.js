const assert = require('assert');
const http = require('http');
const app = require('../src/server');
const { DEMO_APPLICATIONS } = require('../src/data/demoApplications');

const PORT = 5055; // Dedicated test port
let server;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (_) {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runAllTests() {
  console.log('=================================================================');
  console.log(' SYSTEM B: RIGOROUS VERIFICATION ENGINE TEST SUITE');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return (async () => {
      try {
        await fn();
        console.log(`  ✓ [PASS] ${name}`);
        passed++;
      } catch (err) {
        console.error(`  ✗ [FAIL] ${name}`);
        console.error(`    Error: ${err.message}`);
        failed++;
      }
    })();
  }

  // Start test server instance
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  try {
    // -----------------------------------------------------------
    // Test 1: Healthcheck API
    // -----------------------------------------------------------
    await test('GET /api/health returns online status and supported schemes', async () => {
      const res = await makeRequest('GET', '/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'ok');
      assert.ok(res.body.supportedSchemes.includes('PRE_MATRIC'));
      assert.ok(res.body.supportedSchemes.includes('NOS'));
      assert.ok(res.body.supportedSchemes.includes('NATIONAL_FELLOWSHIP'));
      assert.ok(res.body.decisionBoundary.includes('Final decision subject to authorized officer'));
    });

    // -----------------------------------------------------------
    // Test 2: Schemes Metadata
    // -----------------------------------------------------------
    await test('GET /api/schemes returns all 3 MoTA schemes with rules', async () => {
      const res = await makeRequest('GET', '/api/schemes');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.count, 3);
      assert.ok(res.body.schemes.PRE_MATRIC);
      assert.ok(res.body.schemes.NOS);
      assert.ok(res.body.schemes.NATIONAL_FELLOWSHIP);
      // Ensure National Fellowship explicitly specifies no income ceiling
      assert.strictEqual(res.body.schemes.NATIONAL_FELLOWSHIP.incomeCeiling, null);
    });

    // -----------------------------------------------------------
    // Test 3: Pre-Matric - Fully Eligible Scenario (DEMO 1)
    // -----------------------------------------------------------
    await test('POST /api/verify - Pre-Matric ST Eligible Candidate (DEMO 1)', async () => {
      const res = await makeRequest('POST', '/api/verify', DEMO_APPLICATIONS.DEMO_1_ELIGIBLE);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.finalStatus, 'ELIGIBLE');
      assert.strictEqual(res.body.humanReviewRequired, false);
      assert.strictEqual(res.body.deficiencies.length, 0);

      // Check specific rules evaluated
      const incomeRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'PM-INCOME-01');
      assert.ok(incomeRule);
      assert.strictEqual(incomeRule.status, 'PASS');
      assert.strictEqual(incomeRule.actual, 140000);

      const classRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'PM-CLASS-01');
      assert.strictEqual(classRule.status, 'PASS');

      const catRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'PM-CAT-01');
      assert.strictEqual(catRule.status, 'PASS');

      // Check document statuses
      assert.strictEqual(res.body.documentVerification.length, 4);
      assert.ok(res.body.documentVerification.every((d) => d.status === 'PRESENT'));
    });

    // -----------------------------------------------------------
    // Test 4: Pre-Matric - Income Exceeds ₹2.5 Lakh Ceiling
    // -----------------------------------------------------------
    await test('POST /api/verify - Pre-Matric Ineligible: Income > 2.5L', async () => {
      const payload = JSON.parse(JSON.stringify(DEMO_APPLICATIONS.DEMO_1_ELIGIBLE));
      payload.financial.annualFamilyIncome = 320000; // > 2,50,000

      const res = await makeRequest('POST', '/api/verify', payload);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.finalStatus, 'NOT_ELIGIBLE');

      const incomeRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'PM-INCOME-01');
      assert.strictEqual(incomeRule.status, 'FAIL');
      assert.ok(incomeRule.reason.includes('exceeds the scheme ceiling'));

      const failDef = res.body.deficiencies.find((d) => d.type === 'RULE_FAILURE');
      assert.ok(failDef);
    });

    // -----------------------------------------------------------
    // Test 5: Pre-Matric - Ineligible Class & Concurrent Scholarship
    // -----------------------------------------------------------
    await test('POST /api/verify - Pre-Matric Ineligible: Class VII & Dual Scholarship', async () => {
      const payload = JSON.parse(JSON.stringify(DEMO_APPLICATIONS.DEMO_1_ELIGIBLE));
      payload.education.currentClass = 'Class VII'; // Only IX and X
      payload.financial.receivingOtherScholarship = true;

      const res = await makeRequest('POST', '/api/verify', payload);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.finalStatus, 'NOT_ELIGIBLE');

      const classRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'PM-CLASS-01');
      assert.strictEqual(classRule.status, 'FAIL');

      const dualRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'PM-NO-DUAL-01');
      assert.strictEqual(dualRule.status, 'FAIL');
    });

    // -----------------------------------------------------------
    // Test 6: National Overseas Scholarship (NOS) - Eligible Master's
    // -----------------------------------------------------------
    await test('POST /api/verify - NOS Eligible Master\'s Scholar (Age 29, 64%, Income 4.2L)', async () => {
      const payload = {
        applicationId: 'NOS-TEST-001',
        scheme: 'NOS',
        applicant: {
          fullName: 'Anjali Soren',
          category: 'Scheduled Tribe',
          gender: 'Female',
          age: 29
        },
        education: {
          targetDegreeLevel: 'MASTERS',
          qualifyingDegree: 'Bachelor of Science (Physics)',
          qualifyingPercentage: 64.0,
          foreignInstitutionName: 'Imperial College London',
          country: 'United Kingdom',
          hasUnconditionalOffer: true
        },
        financial: {
          annualFamilyIncome: 420000 // <= 6 Lakh
        },
        documents: {
          'ST / PVTG Certificate': { status: 'PRESENT' },
          'Income Certificate': { status: 'PRESENT' },
          'Qualifying Degree Marksheet / Certificate': { status: 'PRESENT' },
          'Overseas University Offer / Admission Letter': { status: 'PRESENT' },
          'Valid Passport / Proof of Age': { status: 'PRESENT' }
        }
      };

      const res = await makeRequest('POST', '/api/verify', payload);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.finalStatus, 'ELIGIBLE');

      // Check female applicant allocation flag exists
      const femaleFlag = res.body.ruleEvaluation.find((r) => r.ruleId === 'NOS-FEMALE-FLAG');
      assert.ok(femaleFlag);
      assert.strictEqual(femaleFlag.status, 'PASS');
    });

    // -----------------------------------------------------------
    // Test 7: NOS - Post-Doctoral Requirements
    // -----------------------------------------------------------
    await test('POST /api/verify - NOS Post-Doctoral: Requires Awarded PhD and Age <= 38', async () => {
      const payload = {
        scheme: 'NOS',
        applicant: { category: 'ST', age: 37 },
        education: {
          targetDegreeLevel: 'POST_DOCTORAL',
          qualifyingDegree: 'M.Sc. Biotechnology',
          qualifyingPercentage: 66.0,
          hasPhdAwarded: true, // Awarded PhD
          foreignInstitutionName: 'Max Planck Institute',
          hasUnconditionalOffer: true
        },
        financial: { annualFamilyIncome: 500000 },
        documents: {
          'ST / PVTG Certificate': { status: 'PRESENT' },
          'Income Certificate': { status: 'PRESENT' },
          'Qualifying Degree Marksheet / Certificate': { status: 'PRESENT' },
          'Overseas University Offer / Admission Letter': { status: 'PRESENT' },
          'Valid Passport / Proof of Age': { status: 'PRESENT' }
        }
      };

      const res = await makeRequest('POST', '/api/verify', payload);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.finalStatus, 'ELIGIBLE');

      const degreeRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'NOS-DEGREE-01');
      assert.strictEqual(degreeRule.status, 'PASS');

      // Now test failing without awarded PhD
      payload.education.hasPhdAwarded = false;
      const resFail = await makeRequest('POST', '/api/verify', payload);
      assert.strictEqual(resFail.body.finalStatus, 'NOT_ELIGIBLE');
      const degreeRuleFail = resFail.body.ruleEvaluation.find((r) => r.ruleId === 'NOS-DEGREE-01');
      assert.strictEqual(degreeRuleFail.status, 'FAIL');
    });

    // -----------------------------------------------------------
    // Test 8: NOS - Ineligible Scenario (DEMO 2)
    // -----------------------------------------------------------
    await test('POST /api/verify - NOS Ineligible: Income > 6L, Non-ST, Marks < 55% (DEMO 2)', async () => {
      const res = await makeRequest('POST', '/api/verify', DEMO_APPLICATIONS.DEMO_2_INELIGIBLE);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.finalStatus, 'NOT_ELIGIBLE');

      const incomeRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'NOS-INCOME-01');
      assert.strictEqual(incomeRule.status, 'FAIL');

      const catRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'NOS-CAT-01');
      assert.strictEqual(catRule.status, 'FAIL');

      const marksRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'NOS-MARKS-01');
      assert.strictEqual(marksRule.status, 'FAIL');
    });

    // -----------------------------------------------------------
    // Test 9: National Fellowship - Verified NO Income Limit
    // -----------------------------------------------------------
    await test('POST /api/verify - National Fellowship: NO Income Criterion Enforced', async () => {
      const payload = {
        scheme: 'NATIONAL_FELLOWSHIP',
        applicant: {
          fullName: 'Jaipal Singh Munda',
          category: 'Scheduled Tribe',
          age: 32
        },
        education: {
          enrolledProgramme: 'Ph.D. in Economics',
          qualifyingDegree: 'M.A. Economics',
          postgraduatePercentage: 62.5,
          institutionName: 'Delhi University',
          isEligibleInstitution: true
        },
        financial: {
          // Very high family income (e.g. ₹15,00,000)
          annualFamilyIncome: 1500000
        },
        documents: {
          'ST Certificate': { status: 'PRESENT' },
          'Postgraduate Degree Marksheet / Certificate': { status: 'PRESENT' },
          'Admission / Registration Letter in M.Phil / PhD': { status: 'PRESENT' },
          'Eligible Institution Verification / Recommendation': { status: 'PRESENT' }
        }
      };

      const res = await makeRequest('POST', '/api/verify', payload);
      assert.strictEqual(res.status, 200);
      // MUST BE ELIGIBLE because National Fellowship has NO income limit!
      assert.strictEqual(res.body.finalStatus, 'ELIGIBLE');

      const incRule = res.body.ruleEvaluation.find((r) => r.ruleId === 'NF-INCOME-00');
      assert.ok(incRule);
      assert.strictEqual(incRule.status, 'NOT_APPLICABLE');
      assert.ok(incRule.reason.includes('no income ceiling'));
    });

    // -----------------------------------------------------------
    // Test 10: Human Review - DOB Mismatch (DEMO 3)
    // -----------------------------------------------------------
    await test('POST /api/verify - Human Review: Document Mismatch MUST NOT Auto-Fail (DEMO 3)', async () => {
      const res = await makeRequest('POST', '/api/verify', DEMO_APPLICATIONS.DEMO_3_HUMAN_REVIEW);
      assert.strictEqual(res.status, 200);
      // Per Section 9: "Do not automatically convert document inconsistencies into NOT_ELIGIBLE"
      assert.strictEqual(res.body.finalStatus, 'HUMAN_REVIEW');
      assert.strictEqual(res.body.humanReviewRequired, true);

      const mismatchDef = res.body.deficiencies.find((d) => d.type === 'DOCUMENT_MISMATCH');
      assert.ok(mismatchDef);
      assert.strictEqual(mismatchDef.field, 'dateOfBirth');

      const lowConfDef = res.body.deficiencies.find((d) => d.type === 'LOW_CONFIDENCE_DOCUMENT');
      assert.ok(lowConfDef);
    });

    // -----------------------------------------------------------
    // Test 11: Incomplete Documentation (DEMO 4)
    // -----------------------------------------------------------
    await test('POST /api/verify - Incomplete: Missing Required Documents', async () => {
      const res = await makeRequest('POST', '/api/verify', DEMO_APPLICATIONS.DEMO_4_INCOMPLETE);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.finalStatus, 'INCOMPLETE');

      const missingDef = res.body.deficiencies.filter((d) => d.type === 'MISSING_DOCUMENT');
      assert.ok(missingDef.length > 0);
    });

    // -----------------------------------------------------------
    // Test 12: Standalone Document Check API
    // -----------------------------------------------------------
    await test('POST /api/check-documents returns document status list', async () => {
      const res = await makeRequest('POST', '/api/check-documents', DEMO_APPLICATIONS.DEMO_1_ELIGIBLE);
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.documentVerification));
      assert.strictEqual(res.body.documentVerification.length, 4);
    });

    // -----------------------------------------------------------
    // Test 13: Standalone Rule Evaluation API
    // -----------------------------------------------------------
    await test('POST /api/evaluate-rules returns rule results list', async () => {
      const res = await makeRequest('POST', '/api/evaluate-rules', DEMO_APPLICATIONS.DEMO_1_ELIGIBLE);
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.ruleEvaluation));
      assert.ok(res.body.ruleEvaluation.length >= 7);
    });

    // -----------------------------------------------------------
    // Test 14: Demo Application API
    // -----------------------------------------------------------
    await test('GET & POST /api/demo-application return demo scenarios and run verification', async () => {
      const getRes = await makeRequest('GET', '/api/demo-application?scenario=DEMO_1_ELIGIBLE');
      assert.strictEqual(getRes.status, 200);
      assert.strictEqual(getRes.body.applicationId, 'MOTA-PM-2026-001');

      const postRes = await makeRequest('POST', '/api/demo-application', { scenario: 'DEMO_1_ELIGIBLE' });
      assert.strictEqual(postRes.status, 200);
      assert.strictEqual(postRes.body.verificationResult.finalStatus, 'ELIGIBLE');
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n=================================================================');
  console.log(` TEST RUN COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log('=================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
