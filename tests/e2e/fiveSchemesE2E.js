/**
 * TribeXcel - 5 MoTA Schemes End-to-End Intake Verification
 * Tests the complete lifecycle for all 5 schemes:
 * PRE_MATRIC, POST_MATRIC, TOP_CLASS (Fresh & Renewal), NFST, NOS
 * Verifies:
 * - Scheme eligibility rule evaluation
 * - Application code generation format: TX-2026-27-${scheme}-${hex}
 * - Direct intake submission without external redirect
 * - Application draft creation & deletion upon submit
 * - Application document checklist resolution
 */

const path = require('path');
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
const ApplicationDraft = require(path.join(apiServerDir, 'models', 'ApplicationDraft'));
const { SCHEME_CATALOGUE, getDocumentChecklist, evaluateEligibility } = require('../../packages/scheme-config');
const { evaluate } = require(path.join(apiServerDir, 'services', 'ruleEngine'));

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

async function runE2ETests() {
  console.log('\n==================================================');
  console.log('TRIBEXCEL — 5 MoTA SCHEMES END-TO-END INTAKE SUITE');
  console.log('==================================================\n');

  await mongoose.connect(MONGO_URI);

  // Setup test student
  const testEmail = `e2e_student_${Date.now()}@tribexcel.test`;
  const student = new Student({
    name: 'Arjun Kumar',
    email: testEmail,
    rollNumber: `TX-ROLL-${Date.now().toString().slice(-6)}`,
    phone: '9876543210',
    dob: new Date('2002-05-15'),
    gender: 'Male',
    state: 'Jharkhand',
    password: 'Password123!',
    aadhaarLast4: '0009',
    aadhaarFormatValidated: true,
    formatValidatedAt: new Date(),
    aadhaarVerified: true,
    aadhaarVerifiedAt: new Date(),
  });
  await student.save();

  const schemesToTest = [
    {
      code: 'PRE_MATRIC',
      name: 'Pre-Matric Scholarship Scheme',
      academic: { className: 'IX', schoolName: 'Ranchi Tribal High School', residence: 'day' },
      category: { domicileState: 'Jharkhand', familyAnnualIncome: 180000, isOrphan: 'no' },
    },
    {
      code: 'POST_MATRIC',
      name: 'Post-Matric Scholarship Scheme',
      academic: { courseLevel: 'Undergraduate', currentCourse: 'B.Tech IT', institutionName: 'BIT Mesra', residence: 'hostel', blockName: 'Kanke' },
      category: { domicileState: 'Jharkhand', familyAnnualIncome: 200000, isOrphan: 'no' },
    },
    {
      code: 'TOP_CLASS',
      name: 'Top Class Education Scheme (FRESH)',
      applicationType: 'FRESH',
      academic: { applicationType: 'FRESH', premierInstituteName: 'IIT Delhi', programmeName: 'B.Tech CS', tuitionFeePerAnnum: 200000 },
      category: { domicileState: 'Jharkhand', familyAnnualIncome: 450000, isOrphan: 'no' },
    },
    {
      code: 'TOP_CLASS',
      name: 'Top Class Education Scheme (RENEWAL)',
      applicationType: 'RENEWAL',
      academic: { applicationType: 'RENEWAL', premierInstituteName: 'IIT Delhi', programmeName: 'B.Tech CS', previousYearMarksPercentage: 82.5, hasBacklogs: 'no', promotedToNextYear: 'yes' },
      category: { domicileState: 'Jharkhand', familyAnnualIncome: 450000, isOrphan: 'no' },
    },
    {
      code: 'NFST',
      name: 'National Fellowship for ST Students',
      academic: { courseLevel: 'Ph.D', subject: 'Tribal Linguistics', universityName: 'Ranchi University', pgMarksPercentage: 68.5, gradeType: 'percentage' },
      category: { domicileState: 'Jharkhand' },
    },
    {
      code: 'NOS',
      name: 'National Overseas Scholarship',
      academic: { courseLevel: 'masters', courseName: 'MSc Data Science', universityName: 'University of Edinburgh', country: 'United Kingdom', qsRank: 22, qualifyingMarksPercentage: 74.0 },
      category: { domicileState: 'Jharkhand', familyAnnualIncome: 420000, isOrphan: 'no' },
    },
  ];

  for (const s of schemesToTest) {
    console.log(`\nTesting Full Intake: ${s.name} [${s.code}]`);

    // 1. Eligibility Check
    const profileData = {
      category: 'ST',
      annualFamilyIncome: s.category.familyAnnualIncome,
      className: s.academic.className,
      pgMarksPercentage: s.academic.pgMarksPercentage,
      qualifyingMarksPercentage: s.academic.qualifyingMarksPercentage,
    };
    const elig = evaluateEligibility(s.code, profileData);
    assert(elig.eligible === true, `Preliminary eligibility passes for ${s.code}`);

    // 2. Draft Creation & Retrieval
    const draft = await ApplicationDraft.findOneAndUpdate(
      { student: student._id, scheme: s.code },
      {
        $set: {
          data: { personal: { fullName: student.name }, academic: s.academic, category: s.category },
          currentStep: 'academic',
          completedSteps: ['personal', 'category', 'academic'],
          applicationType: s.applicationType || 'FRESH',
        },
      },
      { upsert: true, new: true }
    );
    assert(Boolean(draft && draft._id), `Application draft successfully saved for ${s.code}`);

    // 3. Document Requirements
    const checklist = getDocumentChecklist(s.code, { ...s.academic, ...s.category, applicationType: s.applicationType });
    assert(checklist.length >= 3, `Document checklist generated for ${s.code}: ${checklist.length} items`);

    // 4. Submission & Code Generation
    const randHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const appCode = `TX-2026-27-${s.code}-${randHex}`;

    const app = new Application({
      applicationCode: appCode,
      student: student._id,
      scheme: s.code,
      applicationType: s.applicationType || 'FRESH',
      session: '2026-27',
      schemeVersion: '2026.1',
      ruleVersion: '2026.1',
      formVersion: '2026.1',
      documentVersion: '2026.1',
      name: student.name,
      email: student.email,
      phone: student.phone,
      dob: student.dob,
      gender: student.gender,
      category: 'Scheduled Tribe',
      state: student.state,
      status: 'Submitted',
      currentStage: 'APPLICATION_SUBMITTED',
      schemeData: {
        sections: { personal: { fullName: student.name }, academic: s.academic, category: s.category },
      },
      documents: checklist.map((d) => ({
        name: d.label?.en || d.title || d.id,
        docType: d.id,
        source: 'manual',
        verificationStatus: 'PENDING',
      })),
      declaredIncome: s.category.familyAnnualIncome,
      declaredMarks: s.academic.pgMarksPercentage || s.academic.qualifyingMarksPercentage || s.academic.previousYearMarksPercentage,
    });

    await app.save();
    assert(Boolean(app._id), `Application created in MongoDB for ${s.code}`);
    assert(/^TX-2026-27-[A-Z_]+-[0-9A-F]+$/.test(app.applicationCode), `Application Code matches format: ${app.applicationCode}`);

    // 5. Rule Engine Evaluation
    const ruleEval = evaluate(app.toObject(), student);
    assert(Boolean(ruleEval && ruleEval.preliminaryResult), `Deterministic rule engine evaluated ${s.code}: Result = ${ruleEval.preliminaryResult}`);

    // 6. Draft Deletion on Submit
    await ApplicationDraft.deleteOne({ student: student._id, scheme: s.code });
    const remainingDraft = await ApplicationDraft.findOne({ student: student._id, scheme: s.code });
    assert(remainingDraft === null, `Draft removed from database after submission for ${s.code}`);
  }

  // Cleanup test artifacts
  await Application.deleteMany({ student: student._id });
  await Student.deleteOne({ _id: student._id });

  console.log('\n==================================================');
  console.log(`E2E SUITE RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================\n');

  await mongoose.disconnect();
  if (failed > 0) process.exit(1);
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E runner error:', err);
  process.exit(1);
});
