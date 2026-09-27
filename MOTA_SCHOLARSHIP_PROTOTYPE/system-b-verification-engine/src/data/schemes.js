const SCHEMES = {
  PRE_MATRIC: {
    id: "PRE_MATRIC",
    code: "PM-ST",
    name: "Pre-Matric Scholarship for ST Students",
    category: "Pre-Matric",
    ministry: "Ministry of Tribal Affairs (MoTA)",
    requiredDocuments: [
      "ST Certificate",
      "Income Certificate",
      "School Enrollment / Admission Verification",
      "Bank Account Passbook / Proof"
    ],
    incomeCeiling: 250000,
    eligibleClasses: [9, 10, "IX", "X", "Class IX", "Class X", "Class 9", "Class 10"],
    rules: [
      { id: "PM-CAT-01", criterion: "Scheduled Tribe Category" },
      { id: "PM-CLASS-01", criterion: "Enrolled in Class IX or X" },
      { id: "PM-INST-01", criterion: "Recognized / Government Institution" },
      { id: "PM-INCOME-01", criterion: "Annual family income <= 2.5 Lakh" },
      { id: "PM-BANK-01", criterion: "Valid Bank Details Available" },
      { id: "PM-NO-DUAL-01", criterion: "No Concurrent Central/State Scholarship" },
      { id: "PM-DOCS-01", criterion: "Mandatory Supporting Documents" }
    ]
  },
  NOS: {
    id: "NOS",
    code: "NOS-ST",
    name: "National Overseas Scholarship (NOS) for ST Candidates",
    category: "Overseas Studies",
    ministry: "Ministry of Tribal Affairs (MoTA)",
    requiredDocuments: [
      "ST / PVTG Certificate",
      "Income Certificate",
      "Qualifying Degree Marksheet / Certificate",
      "Overseas University Offer / Admission Letter",
      "Valid Passport / Proof of Age"
    ],
    incomeCeiling: 600000,
    supportedLevels: ["MASTERS", "PHD", "POST_DOCTORAL"],
    ageLimits: {
      MASTERS: 32,
      PHD: 35,
      POST_DOCTORAL: 38
    },
    minQualifyingMarksPct: 55.0,
    rules: [
      { id: "NOS-CAT-01", criterion: "ST or PVTG Category" },
      { id: "NOS-DEGREE-01", criterion: "Relevant Prior Degree Qualification" },
      { id: "NOS-MARKS-01", criterion: "Minimum 55% in Qualifying Degree" },
      { id: "NOS-AGE-01", criterion: "Age Limit per Program Level" },
      { id: "NOS-INCOME-01", criterion: "Annual Family Income <= 6.0 Lakh" },
      { id: "NOS-OFFER-01", criterion: "Unconditional/Valid Offer from Recognized Foreign University" },
      { id: "NOS-DOCS-01", criterion: "Mandatory Supporting Documents" }
    ]
  },
  NATIONAL_FELLOWSHIP: {
    id: "NATIONAL_FELLOWSHIP",
    code: "NFST",
    name: "National Fellowship for Higher Education of ST Students",
    category: "Higher Education & Research",
    ministry: "Ministry of Tribal Affairs (MoTA)",
    requiredDocuments: [
      "ST Certificate",
      "Postgraduate Degree Marksheet / Certificate",
      "Admission / Registration Letter in M.Phil / PhD",
      "Eligible Institution Verification / Recommendation"
    ],
    incomeCeiling: null, // IMPORTANT: No income limit criterion for National Fellowship
    supportedProgrammes: ["M.PHIL", "PHD", "INTEGRATED_PHD"],
    minQualifyingMarksPct: 55.0,
    maxAgeLimit: 36,
    rules: [
      { id: "NF-CAT-01", criterion: "Scheduled Tribe Category" },
      { id: "NF-PROG-01", criterion: "Admission in Regular M.Phil or PhD Programme" },
      { id: "NF-QUAL-01", criterion: "Postgraduate Degree Qualification" },
      { id: "NF-MARKS-01", criterion: "Minimum 55% at Postgraduate Level" },
      { id: "NF-AGE-01", criterion: "Maximum Age 36 Years" },
      { id: "NF-INST-01", criterion: "Eligible Higher Educational Institution" },
      { id: "NF-DOCS-01", criterion: "Mandatory Supporting Documents" }
    ]
  }
};

module.exports = { SCHEMES };
