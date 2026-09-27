/**
 * Pre-Matric Scholarship for ST Students - Deterministic Rule Evaluator
 * Evaluates real extracted document intelligence from System A.
 *
 * Rules:
 * 1. Category: Must belong to Scheduled Tribe (ST)
 * 2. Class: Must be enrolled in Class IX or X
 * 3. Institution: Must be Government or Recognized / Aided School
 * 4. Income: Annual family income <= ₹2,50,000 (2.5 Lakh)
 * 5. Bank Info: Valid bank account, IFSC, and bank name available
 * 6. No Dual Scholarship: Must not be receiving concurrent Central/State scholarship
 * 7. Supporting Documents: Required documents available/verified
 */

const { adaptApplication } = require('../inputAdapter');

function evaluatePreMatricRules(application, documentVerificationResults) {
  const evaluations = [];
  const adapted = adaptApplication(application);
  const applicant = adapted.applicant;
  const education = adapted.education;
  const financial = adapted.financial;
  const bank = adapted.bank;

  // ---------------------------------------------------------
  // Rule 1: Scheduled Tribe Category (PM-CAT-01)
  // ---------------------------------------------------------
  const categoryRaw = applicant.category || applicant.casteCategory || "";
  const subCategory = applicant.subCategory || "";
  const stCommunities = ["SANTHAL", "SANTAL", "MUNDA", "ORAON", "GOND", "BHIL", "BODO", "KHASI", "GARO", "HO", "KOL", "BIRHOR"];
  const isRecognizedCommunity = stCommunities.some(c => 
    String(categoryRaw).toUpperCase().includes(c) || String(subCategory).toUpperCase().includes(c)
  );
  const isSt = /^(ST|SCHEDULED\s*TRIBE|PVTG)$/i.test(String(categoryRaw).trim()) || isRecognizedCommunity;

  let catStatus = "PASS";
  let catReason = `Applicant belongs to ${categoryRaw || subCategory || 'ST'} category.`;

  if (!categoryRaw && !subCategory) {
    catStatus = "INSUFFICIENT_DATA";
    catReason = "Social category not specified in application.";
  } else if (!isSt) {
    catStatus = "FAIL";
    catReason = `Applicant category "${categoryRaw}" is not eligible. Scheme is strictly for Scheduled Tribes (ST).`;
  }

  evaluations.push({
    ruleId: "PM-CAT-01",
    criterion: "Scheduled Tribe Category",
    expected: "ST or PVTG",
    actual: categoryRaw || subCategory || "Not provided",
    status: catStatus,
    reason: catReason
  });

  // ---------------------------------------------------------
  // Rule 2: Enrolled in Class IX or Class X (PM-CLASS-01)
  // ---------------------------------------------------------
  const currentClassRaw = education.currentClass || education.class || education.standard || "";
  const currentClassStr = String(currentClassRaw).trim().toUpperCase();
  const validClasses = ["9", "10", "IX", "X", "CLASS 9", "CLASS 10", "CLASS IX", "CLASS X", "9TH", "10TH"];
  const isEligibleClass = validClasses.includes(currentClassStr);

  let classStatus = "PASS";
  let classReason = `Applicant is studying in ${currentClassRaw}, which is eligible for Pre-Matric scholarship.`;

  if (!currentClassRaw) {
    classStatus = "INSUFFICIENT_DATA";
    classReason = "Current class/standard is not specified in application.";
  } else if (!isEligibleClass) {
    classStatus = "FAIL";
    classReason = `Class "${currentClassRaw}" is not eligible. Pre-Matric is strictly for Class IX and X.`;
  }

  evaluations.push({
    ruleId: "PM-CLASS-01",
    criterion: "Enrolled in Class IX or X",
    expected: "Class IX or X",
    actual: currentClassRaw || "Not provided",
    status: classStatus,
    reason: classReason
  });

  // ---------------------------------------------------------
  // Rule 3: Government or Recognized School (PM-INST-01)
  // ---------------------------------------------------------
  const instName = education.institutionName || education.institution || education.schoolName || "";
  const instTypeRaw = education.institutionType || education.schoolType || "";
  const isRecognized = education.isRecognized !== false && education.isGovernmentOrRecognized !== false;
  const recognizedTypes = ["GOVERNMENT", "GOVT", "AIDED", "RECOGNIZED", "CENTRAL GOVT", "STATE GOVT", "KASTURBA GANDHI BALIKA VIDYALAYA", "EMRS", "ASHRAM SCHOOL"];
  const isEligibleInst = recognizedTypes.some((t) => instTypeRaw.toUpperCase().includes(t)) || isRecognized;

  let instStatus = "PASS";
  let instReason = `School/Institution (${instName || 'Enrolled School'}) is Government or officially recognized.`;

  if (!instName && !instTypeRaw && education.isRecognized === undefined) {
    instStatus = "INSUFFICIENT_DATA";
    instReason = "Institution recognition/affiliation details not provided.";
  } else if (!isEligibleInst) {
    instStatus = "FAIL";
    instReason = `Institution type "${instTypeRaw || 'Unrecognized'}" is not recognized by Department of Education.`;
  }

  evaluations.push({
    ruleId: "PM-INST-01",
    criterion: "Recognized / Government Institution",
    expected: "Government / Aided / Recognized School",
    actual: instName || instTypeRaw || (education.isRecognized ? "Recognized School" : "Not specified"),
    status: instStatus,
    reason: instReason
  });

  // ---------------------------------------------------------
  // Rule 4: Annual Family Income <= ₹2.5 Lakh (PM-INCOME-01)
  // ---------------------------------------------------------
  const income = financial.annualIncome;
  const CEILING = 250000;

  let incStatus = "PASS";
  let incReason = "";

  if (income === undefined || income === null || isNaN(income)) {
    incStatus = "INSUFFICIENT_DATA";
    incReason = "Annual family income figure is missing from application.";
  } else if (income > CEILING) {
    incStatus = "FAIL";
    incReason = `Reported annual family income of ₹${Number(income).toLocaleString('en-IN')} exceeds the scheme ceiling of ₹2,50,000.`;
  } else {
    incStatus = "PASS";
    incReason = `Reported annual family income of ₹${Number(income).toLocaleString('en-IN')} is within the scheme limit of ₹2,50,000.`;
  }

  evaluations.push({
    ruleId: "PM-INCOME-01",
    criterion: "Annual family income <= 2.5 Lakh",
    expected: "<= 250000",
    actual: income !== undefined && income !== null && !isNaN(income) ? income : "Not provided",
    status: incStatus,
    reason: incReason
  });

  // ---------------------------------------------------------
  // Rule 5: Valid Bank Details for DBT (PM-BANK-01)
  // ---------------------------------------------------------
  const acct = bank.accountNumber;
  const ifsc = bank.ifsc;
  const ifscValid = ifsc && /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(String(ifsc).trim());

  let bankStatus = "PASS";
  let bankReason = "Valid bank account number and IFSC code provided for Direct Benefit Transfer (DBT).";

  if (!acct && !ifsc) {
    bankStatus = "INSUFFICIENT_DATA";
    bankReason = "Direct Benefit Transfer (DBT) bank details are missing from application.";
  } else if (!acct || !ifsc) {
    bankStatus = "INSUFFICIENT_DATA";
    bankReason = `Incomplete bank details: ${!acct ? 'Account Number missing' : 'IFSC Code missing'}.`;
  } else if (!ifscValid) {
    bankStatus = "FAIL";
    bankReason = `Invalid IFSC code "${ifsc}". Must follow 11-character RBI standard format.`;
  }

  evaluations.push({
    ruleId: "PM-BANK-01",
    criterion: "Valid Bank Details for DBT",
    expected: "Active Bank Account Number & 11-digit IFSC",
    actual: acct && ifsc ? `Acc: ${String(acct).slice(-4).padStart(String(acct).length, 'X')}, IFSC: ${ifsc}` : "Missing bank details",
    status: bankStatus,
    reason: bankReason
  });

  // ---------------------------------------------------------
  // Rule 6: No Concurrent Scholarship (PM-NO-DUAL-01)
  // ---------------------------------------------------------
  const hasOther = financial.receivingOtherScholarship === true || applicant.hasOtherScholarship === true || applicant.receivingConcurrentScholarship === true;
  let dualStatus = "PASS";
  let dualReason = "Applicant self-declares not receiving any other Central or State pre-matric scholarship.";

  if (hasOther) {
    dualStatus = "FAIL";
    dualReason = `Applicant currently holds another scholarship (${applicant.otherScholarshipName || 'Concurrent Award'}), violating the single-scholarship rule.`;
  }

  evaluations.push({
    ruleId: "PM-NO-DUAL-01",
    criterion: "No Concurrent Scholarship",
    expected: "Must not hold another government scholarship",
    actual: hasOther ? `Receiving other scholarship: ${applicant.otherScholarshipName || 'Yes'}` : "Not receiving other scholarship",
    status: dualStatus,
    reason: dualReason
  });

  // ---------------------------------------------------------
  // Rule 7: Mandatory Supporting Documents (PM-DOCS-01)
  // ---------------------------------------------------------
  const docResults = documentVerificationResults || [];
  const missingDocs = docResults.filter((d) => d.status === "MISSING");
  const reviewDocs = docResults.filter((d) => d.status === "LOW_CONFIDENCE" || d.status === "REQUIRES_HUMAN_REVIEW" || d.status === "INVALID");

  let docsStatus = "PASS";
  let docsReason = "All mandatory supporting documents are available and verified.";

  if (missingDocs.length > 0) {
    docsStatus = "INSUFFICIENT_DATA";
    docsReason = `Missing mandatory document(s): ${missingDocs.map((d) => d.document).join(', ')}.`;
  } else if (reviewDocs.length > 0) {
    docsStatus = "REQUIRES_HUMAN_REVIEW";
    docsReason = `Document scrutiny required for: ${reviewDocs.map((d) => `${d.document} (${d.status})`).join(', ')}.`;
  }

  evaluations.push({
    ruleId: "PM-DOCS-01",
    criterion: "Mandatory Supporting Documents",
    expected: "ST Certificate, Income Certificate, School Verification, Bank Proof",
    actual: missingDocs.length > 0 ? `Missing: ${missingDocs.map((d) => d.document).join(', ')}` : (reviewDocs.length > 0 ? "Scrutiny required" : "All verified"),
    status: docsStatus,
    reason: docsReason
  });

  return evaluations;
}

module.exports = { evaluatePreMatricRules };
