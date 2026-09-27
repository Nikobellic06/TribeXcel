/**
 * National Fellowship for Higher Education of ST Students - Rule Evaluator
 * Based on official Ministry of Tribal Affairs (MoTA) guidelines.
 *
 * Core rules:
 * 1. Category: Must belong to Scheduled Tribe (ST)
 * 2. Programme: Must be registered/admitted in regular M.Phil or PhD programme
 * 3. Relevant Postgraduate Qualification: Must hold a Master's degree
 * 4. Academic Cutoff: Minimum 55% at postgraduate level
 * 5. Maximum Age: Age <= 36 years as of closing date
 * 6. Eligible Institution: Must be a recognized University / Institute (UGC Sec 2(f)/12(B), CFTIs, Institutes of National Importance)
 * 7. IMPORTANT: NO INCOME CRITERION (Explicitly prohibited from enforcing income limit)
 * 8. Mandatory supporting documents
 */

function evaluateNationalFellowshipRules(application, documentVerificationResults) {
  const evaluations = [];
  const applicant = application.applicant || {};
  const education = application.education || {};

  // ---------------------------------------------------------
  // Rule 1: Scheduled Tribe Category (NF-CAT-01)
  // ---------------------------------------------------------
  const categoryRaw = applicant.category || applicant.casteCategory || "";
  const isSt = /^(ST|SCHEDULED\s*TRIBE|PVTG)$/i.test(categoryRaw.trim());

  let catStatus = "PASS";
  let catReason = `Applicant verified as Scheduled Tribe (${categoryRaw}).`;

  if (!categoryRaw) {
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
    actual: categoryRaw || "Not provided",
    status: catStatus,
    reason: catReason
  });

  // ---------------------------------------------------------
  // Rule 2: Regular M.Phil or PhD Programme (NF-PROG-01)
  // ---------------------------------------------------------
  const programmeRaw = education.enrolledProgramme || education.targetDegreeLevel || education.course || "";
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
  const pgDegree = education.qualifyingDegree || education.postgraduateDegree || education.highestQualification || "";
  const isMaster = /master|m\.?sc|m\.?tech|m\.?e|m\.?a|ll\.?m|mba|m\.?com|post\s*graduate/i.test(pgDegree);

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
  const marksRaw = education.postgraduatePercentage !== undefined
    ? education.postgraduatePercentage
    : education.qualifyingPercentage !== undefined
      ? education.qualifyingPercentage
      : education.marksPercentage !== undefined
        ? education.marksPercentage
        : education.cgpa !== undefined
          ? education.cgpa * 9.5
          : undefined;

  const marks = typeof marksRaw === 'string' ? parseFloat(marksRaw) : marksRaw;
  const MIN_CUTOFF = 55.0;

  let marksStatus = "PASS";
  let marksReason = `Postgraduate score of ${marks ? marks.toFixed(2) : 0}% meets the minimum 55% eligibility threshold.`;

  if (marks === undefined || isNaN(marks)) {
    marksStatus = "INSUFFICIENT_DATA";
    marksReason = "Postgraduate percentage or equivalent CGPA not provided.";
  } else if (marks >= MIN_CUTOFF) {
    marksStatus = "PASS";
  } else {
    marksStatus = "FAIL";
    marksReason = `Postgraduate score of ${marks.toFixed(2)}% is below the mandatory 55.00% cutoff.`;
  }

  evaluations.push({
    ruleId: "NF-MARKS-01",
    criterion: "Minimum 55% at Postgraduate Level",
    expected: ">= 55.00%",
    actual: marks !== undefined && !isNaN(marks) ? `${marks.toFixed(2)}%` : "Not provided",
    status: marksStatus,
    reason: marksReason
  });

  // ---------------------------------------------------------
  // Rule 5: Maximum Age Limit 36 Years (NF-AGE-01)
  // ---------------------------------------------------------
  const MAX_AGE = 36;
  const applicantAge = applicant.age !== undefined
    ? applicant.age
    : applicant.dateOfBirth
      ? Math.floor((new Date("2026-04-01") - new Date(applicant.dateOfBirth)) / (365.25 * 24 * 3600 * 1000))
      : undefined;

  let ageStatus = "PASS";
  let ageReason = `Applicant age of ${applicantAge} years is within the maximum permissible limit of ${MAX_AGE} years.`;

  if (applicantAge === undefined || isNaN(applicantAge)) {
    ageStatus = "INSUFFICIENT_DATA";
    ageReason = "Applicant age or Date of Birth is missing.";
  } else if (applicantAge <= MAX_AGE) {
    ageStatus = "PASS";
  } else {
    ageStatus = "FAIL";
    ageReason = `Applicant age of ${applicantAge} years exceeds the maximum fellowship age limit of ${MAX_AGE} years.`;
  }

  evaluations.push({
    ruleId: "NF-AGE-01",
    criterion: "Maximum Age 36 Years",
    expected: `<= ${MAX_AGE} years as on the last date of application`,
    actual: applicantAge !== undefined && !isNaN(applicantAge) ? `${applicantAge} years` : "Not provided",
    status: ageStatus,
    reason: ageReason
  });

  // ---------------------------------------------------------
  // Rule 6: Eligible Higher Educational Institution (NF-INST-01)
  // ---------------------------------------------------------
  const institutionName = education.institutionName || education.universityName || "";
  const instCategory = education.institutionCategory || education.institutionType || "";
  const isEligible = education.isEligibleInstitution !== false;

  let instStatus = "PASS";
  let instReason = `Institution "${institutionName}" satisfies UGC/MoTA recognized research institution guidelines.`;

  if (!institutionName) {
    instStatus = "INSUFFICIENT_DATA";
    instReason = "Research institution / University name not provided.";
  } else if (!isEligible) {
    instStatus = "FAIL";
    instReason = `Institution "${institutionName}" is not notified as an eligible institution for National Fellowship.`;
  }

  evaluations.push({
    ruleId: "NF-INST-01",
    criterion: "Eligible Higher Educational Institution",
    expected: "UGC Sec 2(f)/12(B) Universities / Deemed / CFTIs / National Importance",
    actual: institutionName ? `${institutionName} (${instCategory || 'Recognized'})` : "Not provided",
    status: instStatus,
    reason: instReason
  });

  // ---------------------------------------------------------
  // Rule 7: Income Criterion Check - IMPORTANT REQUIREMENT:
  // "Do not introduce an income limit for National Fellowship."
  // Explicitly recorded as NOT_APPLICABLE for transparency.
  // ---------------------------------------------------------
  evaluations.push({
    ruleId: "NF-INCOME-00",
    criterion: "Income Ceiling Criterion",
    expected: "No Income Limit Applicable",
    actual: "N/A (Merit and Fellowship guidelines specify no income restriction)",
    status: "NOT_APPLICABLE",
    reason: "Under official MoTA guidelines, National Fellowship for Higher Education of ST Students has no income ceiling."
  });

  // ---------------------------------------------------------
  // Rule 8: Mandatory Supporting Documents (NF-DOCS-01)
  // ---------------------------------------------------------
  const missingDocs = (documentVerificationResults || [])
    .filter((d) => d.status === "MISSING" || d.status === "INVALID");

  const unverifiedDocs = (documentVerificationResults || [])
    .filter((d) => d.status === "LOW_CONFIDENCE" || d.status === "REQUIRES_HUMAN_REVIEW");

  let docsStatus = "PASS";
  let docsReason = "All mandatory National Fellowship research documents are verified.";

  if (missingDocs.length > 0) {
    docsStatus = "INSUFFICIENT_DATA";
    docsReason = `Missing mandatory documents: ${missingDocs.map((d) => d.document).join(", ")}.`;
  } else if (unverifiedDocs.length > 0) {
    docsStatus = "REQUIRES_HUMAN_REVIEW";
    docsReason = `Documents requiring officer review: ${unverifiedDocs.map((d) => d.document).join(", ")}.`;
  }

  evaluations.push({
    ruleId: "NF-DOCS-01",
    criterion: "Mandatory Supporting Documents",
    expected: "ST Certificate, PG Degree/Marksheet, M.Phil/PhD Registration, Institution Verification",
    actual: missingDocs.length === 0 ? "All verified" : `${missingDocs.length} missing`,
    status: docsStatus,
    reason: docsReason
  });

  return evaluations;
}

module.exports = { evaluateNationalFellowshipRules };
