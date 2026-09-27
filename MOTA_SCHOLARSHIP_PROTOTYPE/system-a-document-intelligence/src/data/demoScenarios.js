/**
 * Demo Application Scenarios for MoTA Document Intelligence Engine
 * 
 * 1. clean: Consistent, high quality documents with full ST verification
 * 2. missing: Incomplete documents with missing critical fields (income, IFSC) and warning quality
 * 3. inconsistent: Multiple inconsistencies (conflicting DOB, name variations, conflicting student name)
 */

export const demoScenarios = {
  clean: {
    id: "APP-MOTA-2026-CLEAN-01",
    scenario: "clean",
    title: "Clean & Consistent ST Application",
    description: "All documents are high-quality, authentic, and perfectly consistent across Aadhaar, ST Certificate, Marksheet, Admission Letter, Bank Passbook, and Income Certificate.",
    documents: [
      {
        documentType: "AADHAAR",
        confidence: 0.98,
        filename: "aadhaar_sunita_soren.pdf",
        quality: "GOOD",
        qualityScore: 0.96,
        fields: {
          fullName: "Sunita Soren",
          dateOfBirth: "2004-05-14",
          gender: "Female",
          fatherName: "Mangal Soren",
          motherName: "Marangmai Soren",
          address: "Vill - Haripur, PO - Dumka, Dist - Dumka, Jharkhand - 814101",
          state: "Jharkhand",
          district: "Dumka",
          domicileState: "Jharkhand"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "ST_CERTIFICATE",
        confidence: 0.97,
        filename: "st_certificate_dumka.pdf",
        quality: "GOOD",
        qualityScore: 0.95,
        fields: {
          fullName: "Sunita Soren",
          fatherName: "Mangal Soren",
          category: "ST",
          tribeName: "Santhal",
          certificateNumber: "JH/ST/2021/88921",
          issuingAuthority: "Sub-Divisional Officer, Dumka",
          issueDate: "2021-08-12",
          state: "Jharkhand",
          district: "Dumka"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "INCOME_CERTIFICATE",
        confidence: 0.95,
        filename: "income_certificate_2023.pdf",
        quality: "GOOD",
        qualityScore: 0.93,
        fields: {
          fullName: "Sunita Soren",
          fatherName: "Mangal Soren",
          annualIncome: "120000",
          incomeCertificateNumber: "INC/JHK/2023/45120",
          incomeCertificateDate: "2023-04-20",
          issuingAuthority: "Circle Officer, Dumka Sadar",
          state: "Jharkhand"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "MARKSHEET",
        confidence: 0.96,
        filename: "class12_marksheet_jac.pdf",
        quality: "GOOD",
        qualityScore: 0.94,
        fields: {
          fullName: "Sunita Soren",
          dateOfBirth: "2004-05-14",
          board: "Jharkhand Academic Council (JAC)",
          class: "12th Standard",
          year: "2022",
          marks: "435/500",
          percentage: "87.0%",
          qualification: "Higher Secondary (Class XII)",
          institution: "St. Xavier's Inter College, Ranchi"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "ADMISSION_LETTER",
        confidence: 0.95,
        filename: "nit_jamshedpur_admission.pdf",
        quality: "GOOD",
        qualityScore: 0.95,
        fields: {
          fullName: "Sunita Soren",
          institution: "National Institute of Technology (NIT) Jamshedpur",
          course: "B.Tech Computer Science and Engineering",
          programme: "Undergraduate Degree",
          admissionYear: "2023",
          country: "India",
          offerDate: "2023-07-28"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "BANK_PASSBOOK",
        confidence: 0.94,
        filename: "sbi_passbook_frontpage.jpg",
        quality: "GOOD",
        qualityScore: 0.92,
        fields: {
          accountHolderName: "Sunita Soren",
          bankName: "State Bank of India",
          accountNumberMasked: "XXXXXX5621",
          ifsc: "SBIN0000214",
          address: "Dumka Main Branch, Jharkhand"
        },
        missingFields: [],
        issues: []
      }
    ]
  },

  missing: {
    id: "APP-MOTA-2026-MISSING-02",
    scenario: "missing",
    title: "Application with Missing & Incomplete Information",
    description: "Applicant belongs to a Particularly Vulnerable Tribal Group (PVTG - Birhor). Income certificate has missing income amount due to faint print, passbook lacks IFSC code, and Aadhaar only has Year of Birth.",
    documents: [
      {
        documentType: "AADHAAR",
        confidence: 0.88,
        filename: "aadhaar_ramesh_scan.jpg",
        quality: "WARNING",
        qualityScore: 0.74,
        fields: {
          fullName: "Ramesh Birhor",
          dateOfBirth: null, // Only year present in document
          gender: "Male",
          fatherName: "Somra Birhor",
          motherName: null,
          address: "Ghutra Para, Korba, Chhattisgarh - 495677",
          state: "Chhattisgarh",
          district: "Korba",
          domicileState: "Chhattisgarh"
        },
        missingFields: ["dateOfBirth (only YOB 2003 present)", "motherName"],
        issues: ["Exact Date of Birth missing on Aadhaar card; only Year of Birth (2003) visible", "Slight corner blur along left edge"]
      },
      {
        documentType: "PVTG_CERTIFICATE",
        confidence: 0.93,
        filename: "pvtg_certificate_korba.pdf",
        quality: "GOOD",
        qualityScore: 0.90,
        fields: {
          fullName: "Ramesh Birhor",
          fatherName: "Somra Birhor",
          category: "PVTG",
          tribeName: "Birhor",
          certificateNumber: "CG/PVTG/2020/112",
          issuingAuthority: "Collector & District Magistrate, Korba",
          issueDate: "2020-11-15",
          state: "Chhattisgarh"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "INCOME_CERTIFICATE",
        confidence: 0.72,
        filename: "tehsil_income_cert_scanned.jpg",
        quality: "POOR",
        qualityScore: 0.48,
        fields: {
          fullName: "Ramesh Birhor",
          fatherName: "Somra Birhor",
          annualIncome: null, // Missing value
          incomeCertificateNumber: "INC-TEH-2023-77",
          incomeCertificateDate: null,
          issuingAuthority: "Tehsildar, Katghora",
          state: "Chhattisgarh"
        },
        missingFields: ["annualIncome", "incomeCertificateDate"],
        issues: [
          "Annual income figure is unreadable or obscured by faint stamp imprint",
          "Low scan resolution below recommended threshold",
          "Missing date of issuance"
        ]
      },
      {
        documentType: "BANK_PASSBOOK",
        confidence: 0.81,
        filename: "cbi_passbook_photo.png",
        quality: "WARNING",
        qualityScore: 0.69,
        fields: {
          accountHolderName: "Ramesh Birhor",
          bankName: "Central Bank of India",
          accountNumberMasked: "XXXXXX8912",
          ifsc: null // Missing IFSC
        },
        missingFields: ["ifsc"],
        issues: ["Branch IFSC code obscured by official bank seal"]
      }
    ]
  },

  inconsistent: {
    id: "APP-MOTA-2026-INCONSISTENT-03",
    scenario: "inconsistent",
    title: "Application with Cross-Document Inconsistencies",
    description: "Applicant has conflicting Date of Birth across Aadhaar and Marksheet, name abbreviation difference, and a conflicting student name on the Bonafide Certificate.",
    documents: [
      {
        documentType: "AADHAAR",
        confidence: 0.97,
        filename: "aadhaar_card_scan.pdf",
        quality: "GOOD",
        qualityScore: 0.94,
        fields: {
          fullName: "Rahul Kumar",
          dateOfBirth: "2003-08-10",
          gender: "Male",
          fatherName: "Mohan Kumar",
          motherName: "Saraswati Devi",
          address: "At/PO - Bargarh, Dist - Bargarh, Odisha - 768028",
          state: "Odisha",
          district: "Bargarh",
          domicileState: "Odisha"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "ST_CERTIFICATE",
        confidence: 0.95,
        filename: "st_certificate_bargarh.pdf",
        quality: "GOOD",
        qualityScore: 0.92,
        fields: {
          fullName: "Rahul Kr.", // Minor variation
          fatherName: "Mohan Kumar",
          category: "ST",
          tribeName: "Gond",
          certificateNumber: "OD/ST/2019/3301",
          issuingAuthority: "Tahasildar, Bargarh",
          issueDate: "2019-06-15",
          state: "Odisha"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "MARKSHEET",
        confidence: 0.96,
        filename: "chse_12th_marksheet.pdf",
        quality: "GOOD",
        qualityScore: 0.93,
        fields: {
          fullName: "Rahul Kumar",
          dateOfBirth: "2002-11-12", // Conflicting DOB!
          board: "Council of Higher Secondary Education (CHSE) Odisha",
          class: "12th Standard",
          year: "2021",
          marks: "380/500",
          percentage: "76.0%",
          qualification: "Higher Secondary",
          institution: "Panchayat College, Bargarh"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "BONAFIDE_CERTIFICATE",
        confidence: 0.91,
        filename: "college_bonafide_letter.pdf",
        quality: "GOOD",
        qualityScore: 0.91,
        fields: {
          fullName: "Rajesh Kumar", // Conflicting Name!
          institution: "Sambalpur University Institute of Information Technology",
          course: "B.Tech Computer Science",
          class: "1st Year",
          admissionYear: "2022"
        },
        missingFields: [],
        issues: []
      },
      {
        documentType: "INCOME_CERTIFICATE",
        confidence: 0.94,
        filename: "income_cert_odisha.pdf",
        quality: "GOOD",
        qualityScore: 0.92,
        fields: {
          fullName: "Rahul Kumar",
          fatherName: "Mohan Kumar",
          annualIncome: "450000",
          incomeCertificateNumber: "INC/OD/2022/9912",
          incomeCertificateDate: "2022-05-18",
          issuingAuthority: "Revenue Officer, Bargarh",
          state: "Odisha"
        },
        missingFields: [],
        issues: []
      }
    ]
  }
};
