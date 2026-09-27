/**
 * Realistic Demo Application Datasets for SIH Presentation & Evaluation
 * Works 100% reliably even if Gemini or external services are offline.
 */

export const INTEGRATION_DEMOS = {
  // -------------------------------------------------------------
  // DEMO 1: Fully Eligible Pre-Matric ST Application
  // -------------------------------------------------------------
  eligible: {
    key: "eligible",
    applicationId: "MOTA-PM-2026-ELIGIBLE-01",
    scheme: "PRE_MATRIC",
    title: "Eligible Pre-Matric ST Application",
    description: "Fully eligible Scheduled Tribe student enrolled in Class IX with valid income certificate below ceiling and verified bank DBT details.",
    
    // System A representation
    systemA: {
      applicationId: "MOTA-PM-2026-ELIGIBLE-01",
      applicantProfile: {
        applicant: {
          fullName: "Mangal Munda",
          dateOfBirth: "2010-06-15",
          gender: "Male",
          category: "Scheduled Tribe",
          tribeName: "Munda",
          domicileState: "Jharkhand"
        },
        education: {
          class: "Class IX",
          institution: "Govt. High School Khunti",
          course: "Secondary Education",
          qualification: "Class VIII Passed",
          percentage: "78.4%"
        },
        financial: {
          annualIncome: "140000"
        },
        bank: {
          bankName: "State Bank of India",
          accountHolderName: "Mangal Munda",
          accountNumberMasked: "XXXXXX1234",
          ifsc: "SBIN0001234"
        }
      },
      documents: [
        {
          documentType: "ST_CERTIFICATE",
          filename: "munda_st_certificate_khunti.pdf",
          confidence: 0.98,
          quality: "GOOD",
          qualityScore: 0.96,
          fields: {
            fullName: "Mangal Munda",
            category: "Scheduled Tribe",
            tribeName: "Munda",
            certificateNumber: "JH/ST/2023/8821",
            issuingAuthority: "Sub-Divisional Officer, Khunti"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "INCOME_CERTIFICATE",
          filename: "income_cert_circle_office.pdf",
          confidence: 0.95,
          quality: "GOOD",
          qualityScore: 0.94,
          fields: {
            fullName: "Mangal Munda",
            annualIncome: "140000",
            certificateNumber: "INC/JH/2023/1029",
            issuingAuthority: "Circle Officer, Khunti"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "BONAFIDE_CERTIFICATE",
          filename: "school_enrollment_verification.pdf",
          confidence: 0.94,
          quality: "GOOD",
          qualityScore: 0.93,
          fields: {
            fullName: "Mangal Munda",
            institution: "Govt. High School Khunti",
            class: "Class IX",
            academicYear: "2025-2026"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "BANK_PASSBOOK",
          filename: "sbi_khunti_passbook.jpg",
          confidence: 0.96,
          quality: "GOOD",
          qualityScore: 0.95,
          fields: {
            accountHolderName: "Mangal Munda",
            bankName: "State Bank of India",
            accountNumberMasked: "XXXXXX1234",
            ifsc: "SBIN0001234"
          },
          missingFields: [],
          issues: []
        }
      ],
      crossDocumentValidation: [
        {
          field: "fullName",
          label: "Full Name",
          status: "MATCH",
          documents: [
            { document: "munda_st_certificate_khunti.pdf", value: "Mangal Munda" },
            { document: "income_cert_circle_office.pdf", value: "Mangal Munda" },
            { document: "school_enrollment_verification.pdf", value: "Mangal Munda" },
            { document: "sbi_khunti_passbook.jpg", value: "Mangal Munda" }
          ],
          remarks: "Full name matches consistently across all records."
        },
        {
          field: "category",
          label: "Category",
          status: "MATCH",
          documents: [
            { document: "munda_st_certificate_khunti.pdf", value: "Scheduled Tribe" }
          ],
          remarks: "Verified authentic Scheduled Tribe (Munda) record."
        },
        {
          field: "domicileState",
          label: "Domicile / State",
          status: "MATCH",
          documents: [
            { document: "munda_st_certificate_khunti.pdf", value: "Jharkhand" },
            { document: "income_cert_circle_office.pdf", value: "Jharkhand" }
          ],
          remarks: "Domicile verified in Jharkhand."
        },
        {
          field: "annualIncome",
          label: "Annual Income",
          status: "MATCH",
          documents: [
            { document: "income_cert_circle_office.pdf", value: "140000" }
          ],
          remarks: "Annual income ₹1,40,000 matches revenue record."
        }
      ],
      anomalies: {
        level: "LOW",
        signals: ["No conflicting signals detected. All extracted documents are consistent."]
      },
      reviewFlags: []
    }
  },

  // -------------------------------------------------------------
  // DEMO 2: Ineligible Application (Multiple Criteria Failed)
  // -------------------------------------------------------------
  ineligible: {
    key: "ineligible",
    applicationId: "MOTA-NOS-2026-INELIGIBLE-02",
    scheme: "NOS",
    title: "Ineligible Application (NOS Criteria Failed)",
    description: "National Overseas Scholarship application failing mandatory statutory rules: Non-ST category, family income exceeds ₹6,00,000 ceiling, and qualifying degree marks below 55% threshold.",
    
    systemA: {
      applicationId: "MOTA-NOS-2026-INELIGIBLE-02",
      applicantProfile: {
        applicant: {
          fullName: "Rohan Patel",
          dateOfBirth: "1991-03-10",
          gender: "Male",
          category: "General / OBC",
          tribeName: null,
          domicileState: "Gujarat"
        },
        education: {
          class: null,
          institution: "University of Melbourne",
          course: "Master of Engineering",
          qualification: "B.Tech Mechanical",
          percentage: "51.5%"
        },
        financial: {
          annualIncome: "850000"
        },
        bank: {
          bankName: "Bank of Baroda",
          accountHolderName: "Rohan Patel",
          accountNumberMasked: "XXXXXX9012",
          ifsc: "BARB0VADOD"
        }
      },
      documents: [
        {
          documentType: "OTHER",
          filename: "caste_certificate_obc.pdf",
          confidence: 0.94,
          quality: "GOOD",
          qualityScore: 0.93,
          fields: {
            fullName: "Rohan Patel",
            category: "OBC",
            certificateNumber: "GJ/OBC/2018/4412"
          },
          missingFields: [],
          issues: ["Certificate submitted is an OBC certificate, not Scheduled Tribe (ST)."]
        },
        {
          documentType: "INCOME_CERTIFICATE",
          filename: "family_income_tax_cert.pdf",
          confidence: 0.96,
          quality: "GOOD",
          qualityScore: 0.95,
          fields: {
            fullName: "Rohan Patel",
            annualIncome: "850000",
            certificateNumber: "ITR/2024/99120"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "MARKSHEET",
          filename: "btech_degree_consolidated_marksheet.pdf",
          confidence: 0.95,
          quality: "GOOD",
          qualityScore: 0.94,
          fields: {
            fullName: "Rohan Patel",
            qualification: "B.Tech Mechanical",
            percentage: "51.5%",
            year: "2015"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "ADMISSION_LETTER",
          filename: "unimelb_offer_letter.pdf",
          confidence: 0.97,
          quality: "GOOD",
          qualityScore: 0.96,
          fields: {
            fullName: "Rohan Patel",
            institution: "University of Melbourne",
            country: "Australia",
            programme: "Master of Engineering"
          },
          missingFields: [],
          issues: []
        }
      ],
      crossDocumentValidation: [
        {
          field: "fullName",
          label: "Full Name",
          status: "MATCH",
          documents: [
            { document: "caste_certificate_obc.pdf", value: "Rohan Patel" },
            { document: "family_income_tax_cert.pdf", value: "Rohan Patel" },
            { document: "btech_degree_consolidated_marksheet.pdf", value: "Rohan Patel" }
          ],
          remarks: "Name matches across records."
        },
        {
          field: "category",
          label: "Category",
          status: "MISMATCH",
          documents: [
            { document: "caste_certificate_obc.pdf", value: "OBC" }
          ],
          remarks: "Applicant submitted an OBC certificate; National Overseas Scholarship (ST) requires Scheduled Tribe status."
        },
        {
          field: "annualIncome",
          label: "Annual Income",
          status: "MATCH",
          documents: [
            { document: "family_income_tax_cert.pdf", value: "850000" }
          ],
          remarks: "Annual income ₹8,50,000 exceeds ₹6,00,000 ceiling."
        }
      ],
      anomalies: {
        level: "HIGH",
        signals: [
          "Mandatory criteria failure: Applicant belongs to OBC category, not Scheduled Tribe (ST).",
          "Annual family income (₹8,50,000) exceeds scheme income ceiling of ₹6,00,000.",
          "Qualifying degree percentage (51.5%) is below the minimum mandatory requirement of 55.0%."
        ]
      },
      reviewFlags: [
        {
          severity: "HIGH",
          field: "category",
          message: "Non-ST caste certificate uploaded.",
          guidance: "Application does not meet statutory ST reservation mandate."
        }
      ]
    }
  },

  // -------------------------------------------------------------
  // DEMO 3: Human Review Required (Inconsistency & Quality Issue)
  // -------------------------------------------------------------
  human_review: {
    key: "human_review",
    applicationId: "MOTA-NF-2026-REVIEW-03",
    scheme: "NATIONAL_FELLOWSHIP",
    title: "Human Review Required (DOB Discrepancy & Low Scan Quality)",
    description: "National Fellowship PhD applicant with valid ST credentials, but exhibiting a Date of Birth mismatch between Aadhaar and PG Marksheet, and a partially obscured seal on institutional verification.",
    
    systemA: {
      applicationId: "MOTA-NF-2026-REVIEW-03",
      applicantProfile: {
        applicant: {
          fullName: "Sunita Kerketta",
          dateOfBirth: "1995-08-20",
          gender: "Female",
          category: "Scheduled Tribe",
          tribeName: "Oraon",
          domicileState: "Jharkhand"
        },
        education: {
          class: null,
          institution: "Jawaharlal Nehru University (JNU)",
          course: "Ph.D. in Tribal Sociology",
          qualification: "M.A. Sociology",
          percentage: "68.2%"
        },
        financial: {
          annualIncome: "350000" // Fellowship has no income limit
        },
        bank: {
          bankName: "Canara Bank",
          accountHolderName: "Sunita Kerketta",
          accountNumberMasked: "XXXXXX7890",
          ifsc: "CNRB0001002"
        }
      },
      documents: [
        {
          documentType: "AADHAAR",
          filename: "aadhaar_sunita_kerketta.pdf",
          confidence: 0.98,
          quality: "GOOD",
          qualityScore: 0.96,
          fields: {
            fullName: "Sunita Kerketta",
            dateOfBirth: "1995-08-20",
            gender: "Female",
            state: "Jharkhand"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "ST_CERTIFICATE",
          filename: "st_certificate_oraon.pdf",
          confidence: 0.97,
          quality: "GOOD",
          qualityScore: 0.95,
          fields: {
            fullName: "Sunita Kerketta",
            category: "Scheduled Tribe",
            tribeName: "Oraon",
            certificateNumber: "JH/ST/2017/5512"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "MARKSHEET",
          filename: "ma_sociology_marksheet.pdf",
          confidence: 0.94,
          quality: "GOOD",
          qualityScore: 0.93,
          fields: {
            fullName: "Sunita Kerketta",
            dateOfBirth: "1994-08-12", // Conflicting DOB!
            qualification: "M.A. Sociology",
            percentage: "68.2%"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "ADMISSION_LETTER",
          filename: "jnu_phd_admission_letter.pdf",
          confidence: 0.96,
          quality: "GOOD",
          qualityScore: 0.95,
          fields: {
            fullName: "Sunita Kerketta",
            institution: "Jawaharlal Nehru University (JNU)",
            programme: "Ph.D. in Tribal Sociology",
            admissionYear: "2024"
          },
          missingFields: [],
          issues: []
        },
        {
          documentType: "BONAFIDE_CERTIFICATE",
          filename: "jnu_recommendation_dean_scan.jpg",
          confidence: 0.68,
          quality: "WARNING",
          qualityScore: 0.52,
          fields: {
            fullName: "Sunita Kerketta",
            institution: "Jawaharlal Nehru University"
          },
          missingFields: [],
          issues: [
            "Low scan resolution below 200 DPI",
            "Institutional seal and dean signature partially obscured by shadow"
          ]
        }
      ],
      crossDocumentValidation: [
        {
          field: "fullName",
          label: "Full Name",
          status: "MATCH",
          documents: [
            { document: "aadhaar_sunita_kerketta.pdf", value: "Sunita Kerketta" },
            { document: "st_certificate_oraon.pdf", value: "Sunita Kerketta" },
            { document: "ma_sociology_marksheet.pdf", value: "Sunita Kerketta" },
            { document: "jnu_phd_admission_letter.pdf", value: "Sunita Kerketta" }
          ],
          remarks: "Full name matches consistently across all records."
        },
        {
          field: "dateOfBirth",
          label: "Date of Birth",
          status: "MISMATCH",
          documents: [
            { document: "aadhaar_sunita_kerketta.pdf", value: "1995-08-20" },
            { document: "ma_sociology_marksheet.pdf", value: "1994-08-12" }
          ],
          remarks: "Mismatch found between Aadhaar (20/08/1995) and MA Marksheet (12/08/1994)."
        },
        {
          field: "category",
          label: "Category",
          status: "MATCH",
          documents: [
            { document: "st_certificate_oraon.pdf", value: "Scheduled Tribe" }
          ],
          remarks: "Valid ST status verified."
        },
        {
          field: "institution",
          label: "Institution Name",
          status: "MATCH",
          documents: [
            { document: "jnu_phd_admission_letter.pdf", value: "Jawaharlal Nehru University (JNU)" },
            { document: "jnu_recommendation_dean_scan.jpg", value: "Jawaharlal Nehru University" }
          ],
          remarks: "Institution matches recognized central university."
        }
      ],
      anomalies: {
        level: "HIGH",
        signals: [
          "Conflicting Date of Birth: 'aadhaar_sunita_kerketta.pdf' [1995-08-20] vs 'ma_sociology_marksheet.pdf' [1994-08-12]. Potential inconsistency detected; human verification recommended.",
          "Document 'jnu_recommendation_dean_scan.jpg' has low scan resolution (0.52 quality score); seal partially obscured."
        ]
      },
      reviewFlags: [
        {
          severity: "HIGH",
          field: "dateOfBirth",
          message: "Discrepancy in Date of Birth between Aadhaar and PG Marksheet.",
          guidance: "Desk officer must verify whether difference is due to a clerical entry error in university records."
        },
        {
          severity: "MEDIUM",
          field: "BONAFIDE_CERTIFICATE",
          message: "Institutional recommendation scan quality is low.",
          guidance: "Request clean re-scan or verify enrollment directly with university registrar."
        }
      ]
    }
  }
};
