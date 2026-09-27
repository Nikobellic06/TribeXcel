/**
 * Pre-Matric Scholarship for ST Students - Deterministic Rule Evaluator
 * Based on official Ministry of Tribal Affairs (MoTA) guidelines.
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

function evaluatePreMatricRules(application, documentVerificationResults) {
  const evaluations = [];
  const applicant = application.applicant || {};
  const education = application.education || {};
  const financial = application.financial || {};
  const bank = application.bankDetails || applicant.bankDetails || financial.bankDetails || {};

  // ---------------------------------------------------------
  // Rule 1: Scheduled Tribe Category (PM-CAT-01)
  // ---------------------------------------------------------
  const categoryRaw = applicant.category || applicant.casteCategory || "";
  const isSt = /^(ST|SCHEDULED\s*TRIBE|PVTG)$/i.test(categoryRaw.trim());
  let catStatus = "PASS";
  let catReason = `Applicant belongs to ${categoryRaw.toUpperCase()} category.`;

  if (!categoryRaw) {
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
    actual: categoryRaw || "Not provided",
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
    classReason = "Current class/standard is not specified.";
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
  const instTypeRaw = education.institutionType || education.schoolType || "";
  const isRecognized = education.isRecognized !== false && education.isGovernmentOrRecognized !== false;
  const recognizedTypes = ["GOVERNMENT", "GOVT", "AIDED", "RECOGNIZED", "CENTRAL GOVT", "STATE GOVT", "KASTURBA GANDHI BALIKA VIDYALAYA", "EMRS", "ASHRAM SCHOOL"];
  const isEligibleInst = recognizedTypes.some((t) => instTypeRaw.toUpperCase().includes(t)) || isRecognized;

  let instStatus = "PASS";
  let instReason = `School/Institution (${education.institutionName || 'Enrolled School'}) is Government or officially recognized.`;

  if (!instTypeRaw && education.isRecognized === undefined) {
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
    actual: instTypeRaw || (education.isRecognized ? "Recognized" : "Not specified"),
    status: instStatus,
    reason: instReason
  });

  // ---------------------------------------------------------
  // Rule 4: Annual Family Income <= ₹2.5 Lakh (PM-INCOME-01)
  // ---------------------------------------------------------
  const incomeRaw = financial.annualFamilyIncome !== undefined
    ? financial.annualFamilyIncome
    : financial.annualIncome !== undefined
      ? financial.annualIncome
      : applicant.annualFamilyIncome;

  const income = typeof incomeRaw === 'string' ? parseFloat(incomeRaw.replace(/[^0-9.]/g, '')) : incomeRaw;
  const CEILING = 250000;

  let incStatus = "PASS";
  let incReason = `Reported annual family income of ₹${Number(income).toLocaleString('en-IN')} is within the scheme limit of ₹2,50,000.`;

  if (income === undefined || income === null || isNaN(income)) {
    incStatus = "INSUFFICIENT_DATA";
    incReason = "Annual family income figure is missing from application.";
  } else if (income <= CEILING) {
    incStatus = "PASS";
  } else {
    incStatus = "FAIL";
    incReason = `Annual family income of ₹${Number(income).toLocaleString('en-IN')} exceeds the scheme ceiling of ₹2,50,000.`;
  }

  evaluations.push({
    ruleId: "PM-INCOME-01",
    criterion: "Annual family income",
    expected: "<= 250000",
    actual: income !== undefined && !isNaN(income) ? income : "Not provided",
    status: incStatus,
    reason: incReason
  });

  // ---------------------------------------------------------
  // Rule 5: Required Bank Information (PM-BANK-01)
  // ---------------------------------------------------------
  const accNo = bank.accountNumber || bank.bankAccountNumber;
  const ifsc = bank.ifscCode || bank.ifsc;
  const bankName = bank.bankName;

  const hasBankDetails = Boolean(accNo && ifsc);
  let bankStatus = "PASS";
  let bankReason = "Valid bank account number and IFSC code provided for Direct Benefit Transfer (DBT).";

  if (!accNo && !ifsc) {
    bankStatus = "INSUFFICIENT_DATA";
    bankReason = "Direct Benefit Transfer bank details (Account No and IFSC) are missing.";
  } else if (!accNo || !ifsc) {
    bankStatus = "INSUFFICIENT_DATA";
    bankReason = `Incomplete bank information: missing ${!accNo ? 'Account Number' : 'IFSC Code'}.`;
  } else if (ifsc.length !== 11) {
    bankStatus = "REQUIRES_HUMAN_REVIEW";
    bankReason = `IFSC Code "${ifsc}" format appears non-standard. Manual verification required.`;
  }

  evaluations.push({
    ruleId: "PM-BANK-01",
    criterion: "Valid Bank Details for DBT",
    expected: "Active Bank Account Number & 11-digit IFSC",
    actual: hasBankDetails ? `Acc: ${String(accNo).slice(-4).padStart(String(accNo).length, 'X')}, IFSC: ${ifsc}` : "Incomplete",
    status: bankStatus,
    reason: bankReason
  });

  // ---------------------------------------------------------
  // Rule 6: No Concurrent Scholarship (PM-NO-DUAL-01)
  // ---------------------------------------------------------
  const receivingOther = financial.receivingOtherScholarship !== undefined
    ? financial.receivingOtherScholarship
    : applicant.receivingOtherScholarship !== undefined
      ? applicant.receivingOtherScholarship
      : education.receivingOtherScholarship;

  let dualStatus = "PASS";
  let dualReason = "Applicant self-declares not receiving any other Central or State pre-matric scholarship.";

  if (receivingOther === undefined || receivingOther === null) {
    dualStatus = "INSUFFICIENT_DATA";
    dualReason = "Concurrent scholarship receipt declaration is missing.";
  } else if (receivingOther === true || receivingOther === "true" || receivingOther === "YES") {
    dualStatus = "FAIL";
    dualReason = "Applicant is currently availing another scholarship; concurrent benefits are not permissible.";
  }

  evaluations.push({
    ruleId: "PM-NO-DUAL-01",
    criterion: "No Concurrent Scholarship",
    expected: "Must not hold another government scholarship",
    actual: receivingOther === true ? "Receiving another scholarship" : "Not receiving other scholarship",
    status: dualStatus,
    reason: dualReason
  });

  // ---------------------------------------------------------
  // Rule 7: Required Supporting Documents Available (PM-DOCS-01)
  // ---------------------------------------------------------
  const missingDocs = (documentVerificationResults || [])
    .filter((d) => d.status === "MISSING" || d.status === "INVALID");

  const unverifiedDocs = (documentVerificationResults || [])
    .filter((d) => d.status === "LOW_CONFIDENCE" || d.status === "REQUIRES_HUMAN_REVIEW");

  let docsStatus = "PASS";
  let docsReason = "All mandatory supporting documents are available and verified.";

  if (missingDocs.length > 0) {
    docsStatus = "INSUFFICIENT_DATA";
    docsReason = `Missing mandatory documents: ${missingDocs.map((d) => d.document).join(", ")}.`;
  } else if (unverifiedDocs.length > 0) {
    docsStatus = "REQUIRES_HUMAN_REVIEW";
    docsReason = `Documents requiring human officer review: ${unverifiedDocs.map((d) => d.document).join(", ")}.`;
  }

  evaluations.push({
    ruleId: "PM-DOCS-01",
    criterion: "Mandatory Supporting Documents",
    expected: "ST Certificate, Income Certificate, School Verification, Bank Proof",
    actual: missingDocs.length === 0 ? "All verified" : `${missingDocs.length} missing`,
    status: docsStatus,
    reason: docsReason
  });

  return evaluations;
}

module.exports = { evaluatePreMatricRules };
