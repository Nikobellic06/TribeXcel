/**
 * National Fellowship for Higher Education of ST Students - Rule Evaluator
 * Evaluates real extracted document intelligence from System A.
 *
 * Core rules:
 * 1. Category: Must belong to Scheduled Tribe (ST)
 * 2. Programme: Must be registered/admitted in regular M.Phil or PhD programme
 * 3. Relevant Postgraduate Qualification: Must hold a Master's degree
 * 4. Academic Cutoff: Minimum 55% at postgraduate level
 * 5. Maximum Age: Age <= 36 years as of closing date
 * 6. Eligible Institution: Must be a recognized University / Institute
 * 7. IMPORTANT: NO INCOME CRITERION (Explicitly prohibited from enforcing income limit)
 * 8. Mandatory supporting documents
 */

const { adaptApplication } = require('../inputAdapter');

function evaluateNationalFellowshipRules(application, documentVerificationResults) {
  const evaluations = [];
  const adapted = adaptApplication(application);
  const applicant = adapted.applicant;
  const education = adapted.education;
  const financial = adapted.financial;
  const crossChecks = adapted.crossDocumentValidation || [];

  // ---------------------------------------------------------
  // Rule 1: Scheduled Tribe Category (NF-CAT-01)
  // ---------------------------------------------------------
  const categoryRaw = applicant.category || applicant.casteCategory || "";
  const subCategory = applicant.subCategory || "";
  const stCommunities = ["SANTHAL", "SANTAL", "MUNDA", "ORAON", "GOND", "BHIL", "BODO", "KHASI", "GARO", "HO", "KOL", "BIRHOR"];
  const isRecognizedCommunity = stCommunities.some(c => 
    String(categoryRaw).toUpperCase().includes(c) || String(subCategory).toUpperCase().includes(c)
  );
  const isSt = /^(ST|SCHEDULED\s*TRIBE|PVTG)$/i.test(String(categoryRaw).trim()) || isRecognizedCommunity;

  let catStatus = "PASS";
  let catReason = `Applicant verified as Scheduled Tribe (${categoryRaw || subCategory || 'ST'}).`;

  if (!categoryRaw && !subCategory) {
    catStatus = "INSUFFICIENT_DATA";
    catReason = "Social category not specified in application.";
  } else if (!isSt) {
    catStatus = "FAIL";
    catReason = `Category "${categoryRaw}" is not eligible. Scheme is strictly for ST candidates.`;
  }

  evaluations.push({
    ruleId: "NF-CAT-01",
    criterion: "Scheduled Tribe Category",
    expected: "ST (Scheduled Tribe)",
    actual: categoryRaw || subCategory || "Not provided",
    status: catStatus,
    reason: catReason
  });

  // ---------------------------------------------------------
  // Rule 2: Regular M.Phil or PhD Programme (NF-PROG-01)
  // ---------------------------------------------------------
  const programmeRaw = education.targetDegreeLevel || education.enrolledProgramme || education.course || "";
  const progNorm = String(programmeRaw).toUpperCase();
  const isResearchProg = /PH\.?D|M\.?PHIL|DOCTOR\s*OF\s*PHILOSOPHY|INTEGRATED\s*PH\.?D/i.test(progNorm);

  let progStatus = "PASS";
  let progReason = `Enrolled in regular research programme: ${programmeRaw}.`;

  if (!programmeRaw) {
    progStatus = "INSUFFICIENT_DATA";
    progReason = "Enrolled research programme (M.Phil / PhD) not specified.";
  } else if (!isResearchProg) {
    progStatus = "FAIL";
    progReason = `Programme "${programmeRaw}" is not eligible. Fellowship is strictly for regular M.Phil or PhD scholars.`;
  }

  evaluations.push({
    ruleId: "NF-PROG-01",
    criterion: "Admission in Regular M.Phil or PhD",
    expected: "Regular M.Phil / PhD Programme",
    actual: programmeRaw || "Not provided",
    status: progStatus,
    reason: progReason
  });

  // ---------------------------------------------------------
  // Rule 3: Postgraduate Degree Qualification (NF-QUAL-01)
  // ---------------------------------------------------------
  const pgDegree = education.qualifyingDegree || "";
  const isMaster = /master|m\.?sc|m\.?tech|m\.?e|m\.?a|ll\.?m|mba|m\.?com|post\s*graduate/i.test(String(pgDegree));

  let qualStatus = "PASS";
  let qualReason = `Holds qualifying postgraduate qualification: ${pgDegree}.`;

  if (!pgDegree) {
    qualStatus = "INSUFFICIENT_DATA";
    qualReason = "Qualifying Master's / Postgraduate degree details are missing.";
  } else if (!isMaster && education.isPostgraduate !== true) {
    qualStatus = "FAIL";
    qualReason = `Qualification "${pgDegree}" does not meet mandatory Postgraduate requirement.`;
  }

  evaluations.push({
    ruleId: "NF-QUAL-01",
    criterion: "Postgraduate Degree Qualification",
    expected: "Recognized Master's / Postgraduate Degree",
    actual: pgDegree || "Not provided",
    status: qualStatus,
    reason: qualReason
  });

  // ---------------------------------------------------------
  // Rule 4: Minimum 55% at Postgraduate Level (NF-MARKS-01)
  // ---------------------------------------------------------
  const pct = education.percentage;
  const MIN_MARKS = 55.0;

  let marksStatus = "PASS";
  let marksReason = "";

  if (pct === undefined || pct === null || isNaN(pct)) {
    marksStatus = "INSUFFICIENT_DATA";
    marksReason = "Postgraduate aggregate percentage is missing from application.";
  } else if (pct < MIN_MARKS) {
    marksStatus = "FAIL";
    marksReason = `Postgraduate score of ${pct}% is below the mandatory 55.0% cutoff for National Fellowship.`;
  } else {
    marksStatus = "PASS";
    marksReason = `Scored ${pct}%, meeting the minimum 55% postgraduate qualifying mark.`;
  }

  evaluations.push({
    ruleId: "NF-MARKS-01",
    criterion: "Minimum 55% at Postgraduate Level",
    expected: ">= 55.0%",
    actual: pct !== undefined && pct !== null && !isNaN(pct) ? pct : "Not provided",
    status: marksStatus,
    reason: marksReason
  });

  // ---------------------------------------------------------
  // Rule 5: Maximum Age 36 Years (NF-AGE-01)
  // ---------------------------------------------------------
  const MAX_AGE = 36;
  const age = applicant.age;

  const dobMismatch = crossChecks.find(c => 
    (c.field === 'dateOfBirth' || c.field === 'dob') && (c.status === 'MISMATCH' || c.match === false)
  );

  let ageStatus = "PASS";
  let ageReason = "";

  if (dobMismatch) {
    ageStatus = "REQUIRES_HUMAN_REVIEW";
    ageReason = `Date of birth mismatch detected across submitted documents (${dobMismatch.details || 'Discrepancy'}). Officer verification required.`;
  } else if (age === undefined || age === null || isNaN(age)) {
    ageStatus = "INSUFFICIENT_DATA";
    ageReason = "Date of birth or age is missing from application.";
  } else if (age > MAX_AGE) {
    ageStatus = "FAIL";
    ageReason = `Applicant age (${age} years) exceeds the maximum ceiling of 36 years for National Fellowship.`;
  } else {
    ageStatus = "PASS";
    ageReason = `Applicant age (${age} years) satisfies the age criterion (<= 36 years).`;
  }

  evaluations.push({
    ruleId: "NF-AGE-01",
    criterion: "Maximum Age 36 Years",
    expected: "<= 36 years as of closing date",
    actual: dobMismatch ? "DOB Discrepancy" : (age !== undefined && age !== null && !isNaN(age) ? `${age} years` : "Not provided"),
    status: ageStatus,
    reason: ageReason
  });

  // ---------------------------------------------------------
  // Rule 6: Eligible Higher Educational Institution (NF-INST-01)
  // ---------------------------------------------------------
  const instName = education.institutionName || "";
  const instCategory = education.institutionCategory || education.institutionType || "";
  const isEligibleInst = education.isEligibleInstitution !== false && (
    /UGC|CENTRAL|STATE|IIT|NIT|IISER|IIM|AIIMS|CFTI|NATIONAL\s*IMPORTANCE|DEEMED/i.test(instCategory) ||
    /university|institute/i.test(instName) ||
    education.isRecognized !== false
  );

  let instStatus = "PASS";
  let instReason = `Research institution (${instName || 'Enrolled University'}) is recognized and eligible under UGC/MoTA norms.`;

  if (!instName && !instCategory) {
    instStatus = "INSUFFICIENT_DATA";
    instReason = "Research university / institution affiliation details not specified.";
  } else if (!isEligibleInst) {
    instStatus = "FAIL";
    instReason = `Institution "${instName}" is not categorized under UGC 2(f)/12(B) or Institutes of National Importance.`;
  }

  evaluations.push({
    ruleId: "NF-INST-01",
    criterion: "Eligible Higher Educational Institution",
    expected: "UGC 2(f)/12(B) Recognized / CFTI / National Importance Institute",
    actual: instName || (isEligibleInst ? "Recognized University" : "Not specified"),
    status: instStatus,
    reason: instReason
  });

  // ---------------------------------------------------------
  // Rule 7: NO INCOME CEILING (NF-INCOME-00)
  // ---------------------------------------------------------
  const incomeRaw = financial.annualIncome;
  evaluations.push({
    ruleId: "NF-INCOME-00",
    criterion: "Annual Family Income Limit",
    expected: "No Income Limit (All ST Candidates Eligible regardless of income)",
    actual: incomeRaw !== undefined && incomeRaw !== null ? `₹${Number(incomeRaw).toLocaleString('en-IN')}` : "Not applicable",
    status: "NOT_APPLICABLE",
    reason: "National Fellowship guidelines enforce no income ceiling. Fellowship awarded purely on academic and institutional merit."
  });

  // ---------------------------------------------------------
  // Rule 8: Mandatory Supporting Documents (NF-DOCS-01)
  // ---------------------------------------------------------
  const docResults = documentVerificationResults || [];
  const missingDocs = docResults.filter((d) => d.status === "MISSING" || d.status === "INVALID");
  const reviewDocs = docResults.filter((d) => d.status === "LOW_CONFIDENCE" || d.status === "REQUIRES_HUMAN_REVIEW");

  let docsStatus = "PASS";
  let docsReason = "All mandatory National Fellowship supporting documents are verified.";

  if (missingDocs.length > 0) {
    docsStatus = "INSUFFICIENT_DATA";
    docsReason = `Missing mandatory documents: ${missingDocs.map((d) => d.document).join(', ')}.`;
  } else if (reviewDocs.length > 0) {
    docsStatus = "REQUIRES_HUMAN_REVIEW";
    docsReason = `Documents requiring officer review: ${reviewDocs.map((d) => d.document).join(', ')}.`;
  }

  evaluations.push({
    ruleId: "NF-DOCS-01",
    criterion: "Mandatory Supporting Documents",
    expected: "ST Certificate, PG Marksheet, PhD Admission Letter, Institution Recommendation",
    actual: missingDocs.length === 0 ? "All verified" : `${missingDocs.length} missing`,
    status: docsStatus,
    reason: docsReason
  });

  return evaluations;
}

module.exports = { evaluateNationalFellowshipRules };
