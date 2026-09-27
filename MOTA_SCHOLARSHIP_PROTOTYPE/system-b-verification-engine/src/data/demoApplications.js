/**
 * Deterministic & Reproducible Demo Applications (Section 12)
 *
 * DEMO 1: Clearly eligible application
 * DEMO 2: Clearly ineligible application (mandatory criteria fail)
 * DEMO 3: Human-review application with document/data inconsistency
 */

const DEMO_APPLICATIONS = {
  // -------------------------------------------------------------
  // DEMO 1: Clearly Eligible (Pre-Matric ST)
  // -------------------------------------------------------------
  DEMO_1_ELIGIBLE: {
    applicationId: "MOTA-PM-2026-001",
    scenarioName: "DEMO 1: Fully Eligible Pre-Matric ST Scholar",
    scheme: "PRE_MATRIC",
    applicant: {
      fullName: "Mangal Munda",
      category: "Scheduled Tribe",
      gender: "Male",
      dateOfBirth: "2010-06-15",
      state: "Jharkhand",
      district: "Khunti"
    },
    education: {
      currentClass: "Class IX",
      institutionName: "Govt. High School Khunti",
      institutionType: "Government School",
      isRecognized: true
    },
    financial: {
      annualFamilyIncome: 140000, // <= 2,50,000 limit
      receivingOtherScholarship: false,
      bankDetails: {
        accountNumber: "98765432101234",
        ifscCode: "SBIN0001234",
        bankName: "State Bank of India"
      }
    },
    documents: {
      "ST Certificate": {
        status: "PRESENT",
        source: "digilocker",
        confidence: 0.98,
        certificateNo: "JH/ST/2023/8821"
      },
      "Income Certificate": {
        status: "PRESENT",
        source: "manual",
        confidence: 0.94,
        incomeDeclared: 140000
      },
      "School Enrollment / Admission Verification": {
        status: "PRESENT",
        source: "manual",
        confidence: 0.92
      },
      "Bank Account Passbook / Proof": {
        status: "PRESENT",
        source: "manual",
        confidence: 0.95
      }
    },
    documentIntelligence: {
      crossChecks: [
        {
          field: "applicantName",
          match: true,
          details: "Name matches across Aadhaar, ST Certificate, and School ID."
        },
        {
          field: "dateOfBirth",
          match: true,
          details: "DOB matches: 15-06-2010."
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // DEMO 2: Clearly Ineligible (NOS - Income Ceiling Exceeded & Low Marks)
  // -------------------------------------------------------------
  DEMO_2_INELIGIBLE: {
    applicationId: "MOTA-NOS-2026-002",
    scenarioName: "DEMO 2: Clearly Ineligible National Overseas Scholarship",
    scheme: "NOS",
    applicant: {
      fullName: "Rohan Patel",
      category: "General", // Not ST
      gender: "Male",
      dateOfBirth: "1991-03-10",
      age: 35 // Exceeds Master's age limit of 32
    },
    education: {
      targetDegreeLevel: "MASTERS",
      qualifyingDegree: "B.Tech Mechanical",
      qualifyingPercentage: 51.5, // Below 55% cutoff
      foreignInstitutionName: "University of Melbourne",
      country: "Australia",
      hasUnconditionalOffer: true
    },
    financial: {
      annualFamilyIncome: 850000 // Exceeds ₹6,00,000 ceiling
    },
    documents: {
      "ST / PVTG Certificate": {
        status: "INVALID",
        reason: "Document submitted is an OBC certificate, not Scheduled Tribe."
      },
      "Income Certificate": {
        status: "PRESENT",
        confidence: 0.91,
        incomeDeclared: 850000
      },
      "Qualifying Degree Marksheet / Certificate": {
        status: "PRESENT",
        confidence: 0.95,
        extractedPercentage: 51.5
      },
      "Overseas University Offer / Admission Letter": {
        status: "PRESENT",
        confidence: 0.96
      },
      "Valid Passport / Proof of Age": {
        status: "PRESENT",
        confidence: 0.98
      }
    },
    documentIntelligence: {
      crossChecks: []
    }
  },

  // -------------------------------------------------------------
  // DEMO 3: Human Review Required (National Fellowship - DOB Mismatch & Low Scan Quality)
  // -------------------------------------------------------------
  DEMO_3_HUMAN_REVIEW: {
    applicationId: "MOTA-NF-2026-003",
    scenarioName: "DEMO 3: Human Review - DOB Mismatch across Certificates",
    scheme: "NATIONAL_FELLOWSHIP",
    applicant: {
      fullName: "Sunita Kerketta",
      category: "Scheduled Tribe",
      gender: "Female",
      dateOfBirth: "1995-08-20",
      age: 30 // Within 36 limit
    },
    education: {
      enrolledProgramme: "Ph.D. in Tribal Sociology",
      qualifyingDegree: "M.A. Sociology",
      postgraduatePercentage: 68.2, // >= 55%
      institutionName: "Jawaharlal Nehru University (JNU)",
      institutionCategory: "Central University (UGC Recognized)",
      isEligibleInstitution: true
    },
    financial: {
      // National Fellowship has NO income limit!
      annualFamilyIncome: 350000
    },
    documents: {
      "ST Certificate": {
        status: "PRESENT",
        source: "digilocker",
        confidence: 0.97
      },
      "Postgraduate Degree Marksheet / Certificate": {
        status: "PRESENT",
        source: "manual",
        confidence: 0.94
      },
      "Admission / Registration Letter in M.Phil / PhD": {
        status: "PRESENT",
        source: "manual",
        confidence: 0.88
      },
      "Eligible Institution Verification / Recommendation": {
        status: "LOW_CONFIDENCE", // Scan quality low
        source: "manual",
        confidence: 0.52,
        reason: "Low resolution document scan; institutional seal partially obscured."
      }
    },
    documentIntelligence: {
      crossChecks: [
        {
          field: "dateOfBirth",
          match: false,
          status: "DOCUMENT_MISMATCH",
          details: "DOB differs: Aadhaar shows 20/08/1995 but PG marksheet records 12/08/1994."
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // DEMO 4: Incomplete Documentation (Missing Mandatory Files)
  // -------------------------------------------------------------
  DEMO_4_INCOMPLETE: {
    applicationId: "MOTA-PM-2026-004",
    scenarioName: "DEMO 4: Incomplete - Missing Income & School Verification",
    scheme: "PRE_MATRIC",
    applicant: {
      fullName: "Birsa Oraon",
      category: "Scheduled Tribe",
      gender: "Male",
      dateOfBirth: "2010-03-25"
    },
    education: {
      currentClass: "Class X",
      institutionName: "Ranchi Model High School",
      isRecognized: true
    },
    financial: {
      // Income missing
      bankDetails: {
        accountNumber: "112233445566",
        ifscCode: "PUNB0123400"
      }
    },
    documents: {
      "ST Certificate": {
        status: "PRESENT",
        source: "digilocker"
      }
      // Missing Income Cert, School Verification, Bank Proof
    },
    documentIntelligence: {
      crossChecks: []
    }
  }
};

module.exports = { DEMO_APPLICATIONS };
