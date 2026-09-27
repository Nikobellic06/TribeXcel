/**
 * National Overseas Scholarship (NOS) for ST Candidates - Rule Evaluator
 * Evaluates real extracted document intelligence from System A.
 *
 * Rules:
 * 1. Category: Must belong to Scheduled Tribe (ST) or PVTG
 * 2. Program Level & Prior Degree:
 *    - Master's: Relevant Bachelor's degree, Min 55%, Max age 32
 *    - PhD: Relevant Master's degree, Min 55%, Max age 35
 *    - Post-Doctoral: Relevant Master's degree (Min 55%), Awarded PhD, Max age 38
 * 3. Annual Family Income <= ₹6,00,000 (6 Lakh/year)
 * 4. Admission Offer: Valid admission offer from recognized foreign higher education institution
 * 5. Mandatory supporting documents
 * 6. Female applicant quota flag
 */

const { adaptApplication } = require('../inputAdapter');

function evaluateNosRules(application, documentVerificationResults) {
  const evaluations = [];
  const adapted = adaptApplication(application);
  const applicant = adapted.applicant;
  const education = adapted.education;
  const financial = adapted.financial;
  const crossChecks = adapted.crossDocumentValidation || [];

  // Normalize program level
  const targetLevelRaw = education.targetDegreeLevel || "MASTERS";
  const levelNormalized = String(targetLevelRaw).toUpperCase().includes("POST") || String(targetLevelRaw).toUpperCase().includes("PDF")
    ? "POST_DOCTORAL"
    : String(targetLevelRaw).toUpperCase().includes("PHD") || String(targetLevelRaw).toUpperCase().includes("DOCTOR")
      ? "PHD"
      : "MASTERS";

  // ---------------------------------------------------------
  // Rule 1: ST or PVTG Category (NOS-CAT-01)
  // ---------------------------------------------------------
  const categoryRaw = applicant.category || applicant.casteCategory || "";
  const subCategory = applicant.subCategory || "";
  const isPvtg = applicant.isPvtg === true || /PVTG/i.test(String(categoryRaw)) || /PVTG/i.test(String(subCategory));
  const stCommunities = ["SANTHAL", "SANTAL", "MUNDA", "ORAON", "GOND", "BHIL", "BODO", "KHASI", "GARO", "HO", "KOL", "BIRHOR"];
  const isRecognizedCommunity = stCommunities.some(c => 
    String(categoryRaw).toUpperCase().includes(c) || String(subCategory).toUpperCase().includes(c)
  );
  const isSt = isPvtg || /^(ST|SCHEDULED\s*TRIBE)$/i.test(String(categoryRaw).trim()) || isRecognizedCommunity;

  let catStatus = "PASS";
  let catReason = isPvtg
    ? "Applicant verified as Particularly Vulnerable Tribal Group (PVTG), accorded highest priority under NOS."
    : `Applicant verified as Scheduled Tribe (${categoryRaw || subCategory || 'ST'}).`;

  if (!categoryRaw && !subCategory) {
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
    actual: isPvtg ? "PVTG (Scheduled Tribe)" : categoryRaw || subCategory || "Not provided",
    status: catStatus,
    reason: catReason
  });

  // ---------------------------------------------------------
  // Rule 2: Relevant Prior Degree Qualification (NOS-DEGREE-01)
  // ---------------------------------------------------------
  const priorDegree = education.qualifyingDegree || "";
  const hasPhd = education.hasPhdAwarded === true || education.phdCompleted === true || education.isPhdAwarded === true || /ph\.?d|doctor/i.test(String(priorDegree));

  let degreeStatus = "PASS";
  let degreeExpected = "";
  let degreeReason = "";

  if (levelNormalized === "MASTERS") {
    degreeExpected = "Relevant Bachelor's Degree";
    const isBachelor = /bachelor|b\.?sc|b\.?tech|b\.?e|b\.?a|ll\.?b|bba|mbbs/i.test(String(priorDegree));
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
    const isMaster = /master|m\.?sc|m\.?tech|m\.?e|m\.?a|ll\.?m|mba|m\.?phil/i.test(String(priorDegree));
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
    if (!priorDegree && !hasPhd) {
      degreeStatus = "INSUFFICIENT_DATA";
      degreeReason = "Qualifying degree and PhD completion details are missing.";
    } else if (hasPhd) {
      degreeStatus = "PASS";
      degreeReason = `Holds awarded PhD and relevant postgraduate qualification: ${priorDegree || 'PhD Awarded'}.`;
    } else {
      degreeStatus = "FAIL";
      degreeReason = "Post-Doctoral fellowship strictly requires an awarded/conferred PhD degree.";
    }
  }

  evaluations.push({
    ruleId: "NOS-DEGREE-01",
    criterion: "Relevant Prior Degree Qualification",
    expected: degreeExpected,
    actual: priorDegree || (hasPhd ? "Awarded PhD" : "Not provided"),
    status: degreeStatus,
    reason: degreeReason
  });

  // ---------------------------------------------------------
  // Rule 3: Minimum 55% Marks in Qualifying Degree (NOS-MARKS-01)
  // ---------------------------------------------------------
  const pct = education.percentage;
  const MIN_MARKS = 55.0;

  let marksStatus = "PASS";
  let marksReason = "";

  if (pct === undefined || pct === null || isNaN(pct)) {
    marksStatus = "INSUFFICIENT_DATA";
    marksReason = "Marks percentage in qualifying examination not specified.";
  } else if (pct < MIN_MARKS) {
    marksStatus = "FAIL";
    marksReason = `Aggregate score of ${pct}% is below the mandatory 55.0% cutoff for NOS.`;
  } else {
    marksStatus = "PASS";
    marksReason = `Scored ${pct}%, satisfying the minimum 55% qualifying cutoff.`;
  }

  evaluations.push({
    ruleId: "NOS-MARKS-01",
    criterion: "Minimum 55% in Qualifying Degree",
    expected: ">= 55.0%",
    actual: pct !== undefined && pct !== null && !isNaN(pct) ? pct : "Not provided",
    status: marksStatus,
    reason: marksReason
  });

  // ---------------------------------------------------------
  // Rule 4: Age Limit per Program Level (NOS-AGE-01)
  // ---------------------------------------------------------
  const ageLimits = { MASTERS: 32, PHD: 35, POST_DOCTORAL: 38 };
  const maxAge = ageLimits[levelNormalized] || 35;
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
  } else if (age > maxAge) {
    ageStatus = "FAIL";
    ageReason = `Applicant age (${age} years) exceeds the upper age limit of ${maxAge} years for ${levelNormalized}.`;
  } else {
    ageStatus = "PASS";
    ageReason = `Applicant age (${age} years) is within the allowable limit of ${maxAge} years for ${levelNormalized}.`;
  }

  evaluations.push({
    ruleId: "NOS-AGE-01",
    criterion: `Age Limit for ${levelNormalized}`,
    expected: `<= ${maxAge} years as of 1st April of selection year`,
    actual: dobMismatch ? "DOB Discrepancy" : (age !== undefined && age !== null && !isNaN(age) ? `${age} years` : "Not provided"),
    status: ageStatus,
    reason: ageReason
  });

  // ---------------------------------------------------------
  // Rule 5: Annual Family Income <= ₹6.0 Lakh (NOS-INCOME-01)
  // ---------------------------------------------------------
  const income = financial.annualIncome;
  const INCOME_CEILING = 600000;

  let incStatus = "PASS";
  let incReason = "";

  if (income === undefined || income === null || isNaN(income)) {
    incStatus = "INSUFFICIENT_DATA";
    incReason = "Annual family income figure is missing from application.";
  } else if (income > INCOME_CEILING) {
    incStatus = "FAIL";
    incReason = `Annual family income of ₹${Number(income).toLocaleString('en-IN')} exceeds the NOS ceiling of ₹6,00,000.`;
  } else {
    incStatus = "PASS";
    incReason = `Annual family income of ₹${Number(income).toLocaleString('en-IN')} is within the scheme ceiling of ₹6,00,000.`;
  }

  evaluations.push({
    ruleId: "NOS-INCOME-01",
    criterion: "Annual Family Income Limit",
    expected: "<= 600000",
    actual: income !== undefined && income !== null && !isNaN(income) ? income : "Not provided",
    status: incStatus,
    reason: incReason
  });

  // ---------------------------------------------------------
  // Rule 6: Admission Offer from Foreign University (NOS-OFFER-01)
  // ---------------------------------------------------------
  const offer = education.admissionOffer || education.foreignUniversityOffer;
  const uniName = education.foreignUniversityName || education.targetUniversity || (offer && offer.university) || "";
  const country = education.country || education.destinationCountry || "";
  const hasOfferDoc = (documentVerificationResults || []).some(
    d => d.document.includes("Overseas University Offer") && d.status === "PRESENT"
  );

  let offerStatus = "PASS";
  let offerReason = `Holds admission offer from ${uniName || 'Foreign University'}${country ? ` (${country})` : ''}.`;

  if (!uniName && !hasOfferDoc && !offer) {
    offerStatus = "INSUFFICIENT_DATA";
    offerReason = "Target foreign institution details not provided.";
  } else if (offer && offer.isRecognized === false) {
    offerStatus = "FAIL";
    offerReason = `Foreign institution "${uniName}" is not on the MoTA approved/QS top university schedule.`;
  }

  evaluations.push({
    ruleId: "NOS-OFFER-01",
    criterion: "Foreign University Admission Offer",
    expected: "Unconditional offer from accredited overseas university",
    actual: uniName ? `${uniName} (${country || 'Abroad'})` : (hasOfferDoc ? "Offer Letter Verified" : "Not provided"),
    status: offerStatus,
    reason: offerReason
  });

  // ---------------------------------------------------------
  // Rule 7: Mandatory Supporting Documents (NOS-DOCS-01)
  // ---------------------------------------------------------
  const docResults = documentVerificationResults || [];
  const missingDocs = docResults.filter((d) => d.status === "MISSING" || d.status === "INVALID");
  const reviewDocs = docResults.filter((d) => d.status === "LOW_CONFIDENCE" || d.status === "REQUIRES_HUMAN_REVIEW");

  let docsStatus = "PASS";
  let docsReason = "All mandatory NOS supporting documents are verified.";

  if (missingDocs.length > 0) {
    docsStatus = "INSUFFICIENT_DATA";
    docsReason = `Missing mandatory documents: ${missingDocs.map((d) => d.document).join(", ")}.`;
  } else if (reviewDocs.length > 0) {
    docsStatus = "REQUIRES_HUMAN_REVIEW";
    docsReason = `Documents requiring officer review: ${reviewDocs.map((d) => d.document).join(", ")}.`;
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
