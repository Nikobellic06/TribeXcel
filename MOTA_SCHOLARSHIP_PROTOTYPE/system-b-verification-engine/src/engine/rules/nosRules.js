/**
 * National Overseas Scholarship (NOS) for ST Candidates - Rule Evaluator
 * Based on official Ministry of Tribal Affairs (MoTA) guidelines.
 *
 * Rules:
 * 1. Category: Must belong to Scheduled Tribe (ST) or PVTG
 * 2. Program Level & Prior Degree:
 *    - Master's: Relevant Bachelor's degree, Min 55%, Max age 32
 *    - PhD: Relevant Master's degree, Min 55%, Max age 35
 *    - Post-Doctoral: Relevant Master's degree (Min 55%), Awarded PhD, Max age 38
 * 3. Annual Family Income <= ₹6,00,000 (6 Lakh/year)
 * 4. Admission Offer: Valid admission offer from recognized foreign higher education institution
 * 5. Female applicant representation flag for reporting/scheme context (30% earmarked)
 * 6. Mandatory supporting documents
 */

function evaluateNosRules(application, documentVerificationResults) {
  const evaluations = [];
  const applicant = application.applicant || {};
  const education = application.education || {};
  const financial = application.financial || {};

  // Normalize program level
  const targetLevelRaw = education.targetDegreeLevel || education.programmeLevel || education.courseLevel || "MASTERS";
  const levelNormalized = targetLevelRaw.toUpperCase().includes("POST") || targetLevelRaw.toUpperCase().includes("PDF")
    ? "POST_DOCTORAL"
    : targetLevelRaw.toUpperCase().includes("PHD") || targetLevelRaw.toUpperCase().includes("DOCTOR")
      ? "PHD"
      : "MASTERS";

  // ---------------------------------------------------------
  // Rule 1: ST or PVTG Category (NOS-CAT-01)
  // ---------------------------------------------------------
  const categoryRaw = applicant.category || applicant.casteCategory || "";
  const subCategory = applicant.subCategory || applicant.tribe || "";
  const isPvtg = applicant.isPvtg === true || /PVTG/i.test(categoryRaw) || /PVTG/i.test(subCategory);
  const isSt = isPvtg || /^(ST|SCHEDULED\s*TRIBE)$/i.test(categoryRaw.trim());

  let catStatus = "PASS";
  let catReason = isPvtg
    ? "Applicant verified as Particularly Vulnerable Tribal Group (PVTG), accorded highest priority under NOS."
    : `Applicant verified as Scheduled Tribe (${categoryRaw}).`;

  if (!categoryRaw) {
    catStatus = "INSUFFICIENT_DATA";
    catReason = "Social category not specified in application.";
  } else if (!isSt) {
    catStatus = "FAIL";
    catReason = `Category "${categoryRaw}" is not eligible. NOS is strictly for ST and PVTG candidates.`;
  }

  evaluations.push({
    ruleId: "NOS-CAT-01",
    criterion: "ST or PVTG Category",
    expected: "ST or PVTG (Particularly Vulnerable Tribal Group)",
    actual: isPvtg ? "PVTG (Scheduled Tribe)" : categoryRaw || "Not provided",
    status: catStatus,
    reason: catReason
  });

  // ---------------------------------------------------------
  // Rule 2: Relevant Prior Degree Qualification (NOS-DEGREE-01)
  // ---------------------------------------------------------
  const priorDegree = education.qualifyingDegree || education.highestQualification || "";
  const hasPhd = education.hasPhdAwarded === true || education.phdCompleted === true;

  let degreeStatus = "PASS";
  let degreeExpected = "";
  let degreeReason = "";

  if (levelNormalized === "MASTERS") {
    degreeExpected = "Relevant Bachelor's Degree";
    const isBachelor = /bachelor|b\.?sc|b\.?tech|b\.?e|b\.?a|ll\.?b|bba|mbbs/i.test(priorDegree);
    if (!priorDegree) {
      degreeStatus = "INSUFFICIENT_DATA";
      degreeReason = "Qualifying undergraduate degree details are missing.";
    } else if (isBachelor || education.isDegreeRelevant !== false) {
      degreeStatus = "PASS";
      degreeReason = `Holds relevant qualifying Bachelor's qualification: ${priorDegree}.`;
    } else {
      degreeStatus = "REQUIRES_HUMAN_REVIEW";
      degreeReason = `Degree "${priorDegree}" requires subject relevance verification for Master's admission.`;
    }
  } else if (levelNormalized === "PHD") {
    degreeExpected = "Relevant Master's Degree";
    const isMaster = /master|m\.?sc|m\.?tech|m\.?e|m\.?a|ll\.?m|mba|m\.?phil/i.test(priorDegree);
    if (!priorDegree) {
      degreeStatus = "INSUFFICIENT_DATA";
      degreeReason = "Qualifying postgraduate degree details are missing.";
    } else if (isMaster || education.isDegreeRelevant !== false) {
      degreeStatus = "PASS";
      degreeReason = `Holds relevant qualifying Master's qualification: ${priorDegree}.`;
    } else {
      degreeStatus = "REQUIRES_HUMAN_REVIEW";
      degreeReason = `Degree "${priorDegree}" requires academic equivalence check for PhD eligibility.`;
    }
  } else if (levelNormalized === "POST_DOCTORAL") {
    degreeExpected = "Relevant Master's Degree + Awarded PhD";
    if (!priorDegree) {
      degreeStatus = "INSUFFICIENT_DATA";
      degreeReason = "Qualifying Master's degree details are missing.";
    } else if (!hasPhd) {
      degreeStatus = "FAIL";
      degreeReason = "Post-Doctoral research requires an officially awarded PhD degree.";
    } else {
      degreeStatus = "PASS";
      degreeReason = `Holds Master's (${priorDegree}) and awarded PhD for Post-Doctoral research.`;
    }
  }

  evaluations.push({
    ruleId: "NOS-DEGREE-01",
    criterion: `Qualifying Degree for ${levelNormalized}`,
    expected: degreeExpected,
    actual: priorDegree ? `${priorDegree}${hasPhd ? ' (PhD Awarded)' : ''}` : "Not provided",
    status: degreeStatus,
    reason: degreeReason
  });

  // ---------------------------------------------------------
  // Rule 3: Minimum 55% in Qualifying Degree (NOS-MARKS-01)
  // ---------------------------------------------------------
  const marksRaw = education.qualifyingPercentage !== undefined
    ? education.qualifyingPercentage
    : education.marksPercentage !== undefined
      ? education.marksPercentage
      : education.cgpa !== undefined
        ? education.cgpa * 9.5
        : undefined;

  const marks = typeof marksRaw === 'string' ? parseFloat(marksRaw) : marksRaw;
  const MIN_MARKS = 55.0;

  let marksStatus = "PASS";
  let marksReason = `Secured ${marks ? marks.toFixed(2) : 0}% in qualifying degree, meeting the >= 55% requirement.`;

  if (marks === undefined || isNaN(marks)) {
    marksStatus = "INSUFFICIENT_DATA";
    marksReason = "Qualifying degree percentage/CGPA not specified.";
  } else if (marks >= MIN_MARKS) {
    marksStatus = "PASS";
  } else {
    marksStatus = "FAIL";
    marksReason = `Qualifying percentage of ${marks.toFixed(2)}% is below the mandatory minimum of 55.00%.`;
  }

  evaluations.push({
    ruleId: "NOS-MARKS-01",
    criterion: "Minimum 55% in Qualifying Degree",
    expected: ">= 55.00%",
    actual: marks !== undefined && !isNaN(marks) ? `${marks.toFixed(2)}%` : "Not provided",
    status: marksStatus,
    reason: marksReason
  });

  // ---------------------------------------------------------
  // Rule 4: Maximum Age Limit per Level (NOS-AGE-01)
  // ---------------------------------------------------------
  const ageLimits = { MASTERS: 32, PHD: 35, POST_DOCTORAL: 38 };
  const maxAllowedAge = ageLimits[levelNormalized] || 35;
  const applicantAge = applicant.age !== undefined
    ? applicant.age
    : applicant.dateOfBirth
      ? Math.floor((new Date("2026-04-01") - new Date(applicant.dateOfBirth)) / (365.25 * 24 * 3600 * 1000))
      : undefined;

  let ageStatus = "PASS";
  let ageReason = `Applicant age of ${applicantAge} years is within the maximum limit of ${maxAllowedAge} years for ${levelNormalized}.`;

  if (applicantAge === undefined || isNaN(applicantAge)) {
    ageStatus = "INSUFFICIENT_DATA";
    ageReason = "Applicant age or Date of Birth is missing.";
  } else if (applicantAge <= maxAllowedAge) {
    ageStatus = "PASS";
  } else {
    ageStatus = "FAIL";
    ageReason = `Applicant age of ${applicantAge} years exceeds the maximum limit of ${maxAllowedAge} years for ${levelNormalized}.`;
  }

  evaluations.push({
    ruleId: "NOS-AGE-01",
    criterion: `Age Limit for ${levelNormalized}`,
    expected: `<= ${maxAllowedAge} years as of 1st April of selection year`,
    actual: applicantAge !== undefined && !isNaN(applicantAge) ? `${applicantAge} years` : "Not provided",
    status: ageStatus,
    reason: ageReason
  });

  // ---------------------------------------------------------
  // Rule 5: Annual Family Income <= ₹6.0 Lakh (NOS-INCOME-01)
  // ---------------------------------------------------------
  const incomeRaw = financial.annualFamilyIncome !== undefined
    ? financial.annualFamilyIncome
    : financial.annualIncome !== undefined
      ? financial.annualIncome
      : applicant.annualFamilyIncome;

  const income = typeof incomeRaw === 'string' ? parseFloat(incomeRaw.replace(/[^0-9.]/g, '')) : incomeRaw;
  const NOS_CEILING = 600000;

  let incStatus = "PASS";
  let incReason = `Annual family income of ₹${Number(income).toLocaleString('en-IN')} is within the scheme ceiling of ₹6,00,000.`;

  if (income === undefined || income === null || isNaN(income)) {
    incStatus = "INSUFFICIENT_DATA";
    incReason = "Annual family income figure not provided.";
  } else if (income <= NOS_CEILING) {
    incStatus = "PASS";
  } else {
    incStatus = "FAIL";
    incReason = `Annual family income of ₹${Number(income).toLocaleString('en-IN')} exceeds the NOS ceiling of ₹6,00,000.`;
  }

  evaluations.push({
    ruleId: "NOS-INCOME-01",
    criterion: "Annual Family Income Limit",
    expected: "<= 600000",
    actual: income !== undefined && !isNaN(income) ? income : "Not provided",
    status: incStatus,
    reason: incReason
  });

  // ---------------------------------------------------------
  // Rule 6: Offer from Foreign Institution (NOS-OFFER-01)
  // ---------------------------------------------------------
  const institutionName = education.foreignInstitutionName || education.institutionName || "";
  const country = education.country || education.destinationCountry || "";
  const hasOffer = education.hasUnconditionalOffer === true || education.hasAdmissionOffer === true || Boolean(institutionName);

  let offerStatus = "PASS";
  let offerReason = `Holds admission offer from ${institutionName}${country ? ` (${country})` : ''}.`;

  if (!institutionName) {
    offerStatus = "INSUFFICIENT_DATA";
    offerReason = "Target foreign institution details not provided.";
  } else if (education.hasUnconditionalOffer === false && education.isConditionalOffer === true) {
    offerStatus = "REQUIRES_HUMAN_REVIEW";
    offerReason = "Admission offer is conditional; screening committee review required for financial clearance.";
  }

  evaluations.push({
    ruleId: "NOS-OFFER-01",
    criterion: "Foreign University Admission Offer",
    expected: "Unconditional offer from accredited overseas university",
    actual: institutionName ? `${institutionName} (${country || 'Abroad'})` : "Not provided",
    status: offerStatus,
    reason: offerReason
  });

  // ---------------------------------------------------------
  // Rule 7: Mandatory Supporting Documents (NOS-DOCS-01)
  // ---------------------------------------------------------
  const missingDocs = (documentVerificationResults || [])
    .filter((d) => d.status === "MISSING" || d.status === "INVALID");

  const unverifiedDocs = (documentVerificationResults || [])
    .filter((d) => d.status === "LOW_CONFIDENCE" || d.status === "REQUIRES_HUMAN_REVIEW");

  let docsStatus = "PASS";
  let docsReason = "All mandatory NOS supporting documents are verified.";

  if (missingDocs.length > 0) {
    docsStatus = "INSUFFICIENT_DATA";
    docsReason = `Missing mandatory documents: ${missingDocs.map((d) => d.document).join(", ")}.`;
  } else if (unverifiedDocs.length > 0) {
    docsStatus = "REQUIRES_HUMAN_REVIEW";
    docsReason = `Documents requiring officer review: ${unverifiedDocs.map((d) => d.document).join(", ")}.`;
  }

  evaluations.push({
    ruleId: "NOS-DOCS-01",
    criterion: "Mandatory Supporting Documents",
    expected: "ST/PVTG Cert, Income Cert, Degree Marksheets, Overseas Offer, Age Proof",
    actual: missingDocs.length === 0 ? "All verified" : `${missingDocs.length} missing`,
    status: docsStatus,
    reason: docsReason
  });

  // Contextual metadata for MoTA reporting: Female reservation / 30% quota context
  const isFemale = /^(FEMALE|F)$/i.test(String(applicant.gender || "").trim());
  if (isFemale) {
    evaluations.push({
      ruleId: "NOS-FEMALE-FLAG",
      criterion: "Female Applicant Priority Allocation",
      expected: "30% slots earmarked for ST female candidates",
      actual: "Eligible Female Applicant",
      status: "PASS",
      reason: "Candidate eligible for consideration under the 30% female earmarking quota."
    });
  }

  return evaluations;
}

module.exports = { evaluateNosRules };
