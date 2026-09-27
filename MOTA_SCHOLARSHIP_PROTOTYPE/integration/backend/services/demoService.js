import { INTEGRATION_DEMOS } from '../data/demoScenarios.js';
import { buildSystemBPayload, buildFinalResponse } from './transformer.js';
import { verifyWithSystemB } from './systemBClient.js';

/**
 * Demo Service
 * Runs end-to-end demo applications through live engines or reliable fallback
 */
export async function executeDemoScenario(scenarioKey = 'eligible') {
  const normKey = scenarioKey.toLowerCase().replace(/[^a-z0-9_]/g, '');
  let demo = INTEGRATION_DEMOS[normKey];

  if (!demo) {
    if (normKey.includes('ineligible') || normKey === '2') {
      demo = INTEGRATION_DEMOS.ineligible;
    } else if (normKey.includes('human') || normKey.includes('review') || normKey === '3') {
      demo = INTEGRATION_DEMOS.human_review;
    } else {
      demo = INTEGRATION_DEMOS.eligible;
    }
  }

  const systemAData = demo.systemA;
  const scheme = demo.scheme;

  let systemBResult = null;
  let executionSource = 'live-engines';

  try {
    // Attempt live evaluation using System B
    const systemBPayload = buildSystemBPayload(systemAData, scheme, {
      applicationId: demo.applicationId
    });

    systemBResult = await verifyWithSystemB(systemBPayload);
  } catch (err) {
    console.warn(`[Demo Service] System B live verification unavailable (${err.message}). Using deterministic fallback for demo.`);
    executionSource = 'deterministic-demo-engine';
    systemBResult = getDeterministicSystemBResult(demo.key);
  }

  const combined = buildFinalResponse(systemAData, systemBResult, scheme);
  combined._source = executionSource;
  combined._demoTitle = demo.title;
  combined._demoDescription = demo.description;

  return combined;
}

/**
 * Deterministic System B verification results for offline / fault-tolerant presentation
 */
function getDeterministicSystemBResult(scenarioKey) {
  if (scenarioKey === 'ineligible') {
    return {
      applicationId: 'MOTA-NOS-2026-INELIGIBLE-02',
      scheme: 'NOS',
      schemeName: 'National Overseas Scholarship (NOS) for ST Candidates',
      documentVerification: [
        {
          document: 'ST / PVTG Certificate',
          status: 'INVALID',
          reason: 'Submitted document is an OBC certificate, not Scheduled Tribe.'
        },
        {
          document: 'Income Certificate',
          status: 'PRESENT',
          reason: 'Annual income ₹8,50,000 exceeds ₹6,00,000 ceiling.'
        },
        {
          document: 'Qualifying Degree Marksheet / Certificate',
          status: 'PRESENT',
          reason: 'Extracted percentage 51.5% is below 55% cutoff.'
        },
        {
          document: 'Overseas University Offer / Admission Letter',
          status: 'PRESENT'
        },
        {
          document: 'Valid Passport / Proof of Age',
          status: 'PRESENT'
        }
      ],
      ruleEvaluation: [
        {
          id: 'NOS-CAT-01',
          rule: 'ST or PVTG Category',
          status: 'FAIL',
          expected: 'Scheduled Tribe (ST) or PVTG certificate',
          actual: 'OBC Category Certificate',
          reason: 'Applicant does not belong to Scheduled Tribe (ST) category.'
        },
        {
          id: 'NOS-INCOME-01',
          rule: 'Annual Family Income <= 6.0 Lakh',
          status: 'FAIL',
          expected: '<= ₹6,00,000',
          actual: '₹8,50,000',
          reason: 'Annual family income of ₹8,50,000 exceeds statutory limit of ₹6,00,000.'
        },
        {
          id: 'NOS-MARKS-01',
          rule: 'Minimum 55% in Qualifying Degree',
          status: 'FAIL',
          expected: '>= 55.0%',
          actual: '51.5%',
          reason: 'Qualifying marks of 51.5% are below the minimum threshold.'
        },
        {
          id: 'NOS-AGE-01',
          rule: 'Age Limit per Program Level',
          status: 'FAIL',
          expected: '<= 32 years for Masters',
          actual: '35 years',
          reason: 'Applicant exceeds the maximum age limit of 32 years for Master’s programs.'
        }
      ],
      deficiencies: [
        {
          type: 'MANDATORY_CRITERIA_FAILED',
          field: 'category',
          reason: 'Applicant is not a member of a Scheduled Tribe.'
        },
        {
          type: 'INCOME_CEILING_EXCEEDED',
          field: 'annualFamilyIncome',
          reason: 'Family income ₹8,50,000 exceeds ₹6,00,000 limit.'
        },
        {
          type: 'ACADEMIC_CUTOFF_NOT_MET',
          field: 'qualifyingPercentage',
          reason: 'Percentage 51.5% is below required 55.0%.'
        }
      ],
      finalStatus: 'NOT_ELIGIBLE',
      explanation: 'Application does not meet mandatory statutory criteria under the National Overseas Scholarship (ST) guidelines. Multiple mandatory requirements failed: Non-ST category, family income exceeds ceiling, and qualifying marks are below cutoff.',
      humanReviewRequired: false
    };
  }

  if (scenarioKey === 'human_review') {
    return {
      applicationId: 'MOTA-NF-2026-REVIEW-03',
      scheme: 'NATIONAL_FELLOWSHIP',
      schemeName: 'National Fellowship for Higher Education of ST Students',
      documentVerification: [
        {
          document: 'ST Certificate',
          status: 'PRESENT',
          confidence: 0.97
        },
        {
          document: 'Postgraduate Degree Marksheet / Certificate',
          status: 'PRESENT',
          confidence: 0.94
        },
        {
          document: 'Admission / Registration Letter in M.Phil / PhD',
          status: 'PRESENT',
          confidence: 0.96
        },
        {
          document: 'Eligible Institution Verification / Recommendation',
          status: 'LOW_CONFIDENCE',
          confidence: 0.52,
          reason: 'Low scan resolution (0.52 score); institutional seal partially obscured.'
        }
      ],
      ruleEvaluation: [
        {
          id: 'NF-CAT-01',
          rule: 'Scheduled Tribe Category',
          status: 'PASS',
          expected: 'Valid ST Certificate',
          actual: 'ST (Oraon tribe)',
          reason: 'Verified Scheduled Tribe category.'
        },
        {
          id: 'NF-PROG-01',
          rule: 'Admission in Regular M.Phil or PhD Programme',
          status: 'PASS',
          expected: 'Regular M.Phil / PhD Enrollment',
          actual: 'Ph.D. in Tribal Sociology (JNU)',
          reason: 'Enrolled in eligible Ph.D. programme at JNU.'
        },
        {
          id: 'NF-MARKS-01',
          rule: 'Minimum 55% at Postgraduate Level',
          status: 'PASS',
          expected: '>= 55.0%',
          actual: '68.2%',
          reason: 'Postgraduate percentage 68.2% meets requirement.'
        },
        {
          id: 'NF-DOCS-01',
          rule: 'Mandatory Supporting Documents',
          status: 'REQUIRES_HUMAN_REVIEW',
          expected: 'High legibility scans with matching credentials',
          actual: 'DOB conflict: 1995-08-20 vs 1994-08-12; low scan quality on recommendation',
          reason: 'Discrepancy detected in Date of Birth and low scan resolution on institutional recommendation.'
        }
      ],
      deficiencies: [
        {
          type: 'DOCUMENT_MISMATCH',
          field: 'dateOfBirth',
          reason: 'DOB mismatch across Aadhaar (20/08/1995) and PG Marksheet (12/08/1994).'
        },
        {
          type: 'LOW_CONFIDENCE_SCAN',
          field: 'Eligible Institution Verification',
          reason: 'Low resolution document scan; institutional seal partially obscured.'
        }
      ],
      finalStatus: 'HUMAN_REVIEW',
      explanation: 'Application meets academic and category eligibility criteria, but cross-document validation detected a Date of Birth mismatch (Aadhaar 20/08/1995 vs PG Marksheet 12/08/1994), alongside a low-resolution institutional verification scan. Human verification is required to confirm whether the variation is clerical.',
      humanReviewRequired: true
    };
  }

  // Default: Eligible
  return {
    applicationId: 'MOTA-PM-2026-ELIGIBLE-01',
    scheme: 'PRE_MATRIC',
    schemeName: 'Pre-Matric Scholarship for ST Students',
    documentVerification: [
      { document: 'ST Certificate', status: 'PRESENT', confidence: 0.98 },
      { document: 'Income Certificate', status: 'PRESENT', confidence: 0.95 },
      { document: 'School Enrollment / Admission Verification', status: 'PRESENT', confidence: 0.94 },
      { document: 'Bank Account Passbook / Proof', status: 'PRESENT', confidence: 0.96 }
    ],
    ruleEvaluation: [
      {
        id: 'PM-CAT-01',
        rule: 'Scheduled Tribe Category',
        status: 'PASS',
        expected: 'Scheduled Tribe (ST)',
        actual: 'Scheduled Tribe (Munda)',
        reason: 'Valid ST certificate verified from Sub-Divisional Officer.'
      },
      {
        id: 'PM-CLASS-01',
        rule: 'Enrolled in Class IX or X',
        status: 'PASS',
        expected: 'Class IX or X',
        actual: 'Class IX',
        reason: 'Applicant is enrolled in Class IX.'
      },
      {
        id: 'PM-INST-01',
        rule: 'Recognized / Government Institution',
        status: 'PASS',
        expected: 'Recognized School',
        actual: 'Govt. High School Khunti',
        reason: 'School is a recognized government institution.'
      },
      {
        id: 'PM-INCOME-01',
        rule: 'Annual family income <= 2.5 Lakh',
        status: 'PASS',
        expected: '<= ₹2,50,000',
        actual: '₹1,40,000',
        reason: 'Income is within the applicable limit of ₹2,50,000.'
      },
      {
        id: 'PM-BANK-01',
        rule: 'Valid Bank Details Available',
        status: 'PASS',
        expected: 'Active bank account with IFSC',
        actual: 'State Bank of India (SBIN0001234)',
        reason: 'Bank passbook verified for DBT direct benefit disbursement.'
      },
      {
        id: 'PM-DOCS-01',
        rule: 'Mandatory Supporting Documents',
        status: 'PASS',
        expected: 'All 4 required documents present',
        actual: 'All 4 documents verified',
        reason: 'All mandatory documents submitted with high optical quality.'
      }
    ],
    deficiencies: [],
    finalStatus: 'ELIGIBLE',
    explanation: 'Applicant satisfies all statutory eligibility requirements under the Pre-Matric ST Scholarship Scheme. Verified Scheduled Tribe status, enrolled in Class IX at a recognized government school, annual family income of ₹1,40,000 is well within the ₹2,50,000 ceiling, and all supporting documents are authentic and matching.',
    humanReviewRequired: false
  };
}
