# MoTA Prototype — System B: AI-Assisted Scholarship Verification Engine

An API-first, deterministic, and explainable verification engine built for the **Ministry of Tribal Affairs (MoTA)** digital scholarship prototype.

---

## 1. Important Decision Boundary (Section 14)

* **AI-Assisted Pre-Verification:** This engine automates document and eligibility verification based on structured scheme rules.
* **No Autonomous Grant/Reject:** The engine explicitly does **NOT** claim *"AI granted scholarship"* or *"AI rejected scholarship"*.
* **Official Disclaimer:**
  > *"AI-assisted verification result. Final decision subject to authorized Ministry officer review."*
* **Preserving Fair Scrutiny:** Document inconsistencies and scan uncertainties are **never** auto-failed; they map to `HUMAN_REVIEW` for an authorized officer.

---

## 2. Supported Schemes & Official Rule Formulations

### 1. Pre-Matric Scholarship for ST Students (`PRE_MATRIC`)
* **Category:** Scheduled Tribe (ST) or PVTG.
* **Current Class:** Strictly enrolled in **Class IX** or **Class X**.
* **Institution:** Government, Local Body, or Aided/Recognized School.
* **Income Limit:** Annual family income $\le$ **₹2,50,000** (2.5 Lakh).
* **Bank Details:** Active Bank Account Number and 11-digit IFSC code for Direct Benefit Transfer (DBT).
* **No Concurrent Scholarship:** Must not hold another Central or State scholarship.
* **Required Documents:** ST Certificate, Income Certificate, School Verification, Bank Proof.

### 2. National Overseas Scholarship (NOS) (`NOS`)
* **Target Degree Levels:**
  * **Master's:** Relevant Bachelor's qualification, minimum **55%**, maximum age **32 years**.
  * **PhD:** Relevant Master's qualification, minimum **55%**, maximum age **35 years**.
  * **Post-Doctoral:** Relevant Master's (min **55%**), officially **awarded PhD**, maximum age **38 years**.
* **Income Limit:** Annual family income $\le$ **₹6,00,000** (6.0 Lakh/year).
* **Category:** Scheduled Tribe (ST) or Particularly Vulnerable Tribal Group (PVTG).
* **Special Provision:** Female applicant priority allocation flag supported (30% slots earmarked).
* **Admission Offer:** Unconditional offer from an accredited foreign university.
* **Required Documents:** ST/PVTG Certificate, Income Certificate, Degree Marksheets, Overseas Offer, Age Proof/Passport.

### 3. National Fellowship for Higher Education of ST Students (`NATIONAL_FELLOWSHIP`)
* **Category:** Scheduled Tribe (ST).
* **Programme:** Enrolled in regular **M.Phil** or **Ph.D.** programme.
* **Qualifying Degree:** Postgraduate / Master's degree.
* **Academic Cutoff:** Minimum **55%** at postgraduate level.
* **Maximum Age:** $\le$ **36 years** as on the closing date.
* **Eligible Institution:** UGC Sec 2(f)/12(B) recognized Universities, Deemed Universities, CFTIs, Institutes of National Importance.
* **IMPORTANT:** **No income criterion**. Under official guidelines, this fellowship has **NO income ceiling**.

---

## 3. Architecture & Data Flow

```
                      +-----------------------------------+
                      |   System A: Document Ingestion    |
                      |   (OCR & Entity Extraction)       |
                      +-----------------+-----------------+
                                        |
                 Pre-extracted intelligence (No duplicate OCR)
                                        |
                                        v
+-------------------------------------------------------------------------+
|     System B: AI-Assisted Verification Engine (REST API :5050)          |
|                                                                         |
|  +--------------------+   +----------------------+   +---------------+  |
|  |  Document Verifier |   | Deterministic Rules  |   |  Deficiency   |  |
|  |  • PRESENT         |   | • Pre-Matric Rules   |   |   Detector    |  |
|  |  • MISSING         |   | • NOS Rules          |   |  • MISMATCH   |  |
|  |  • LOW_CONFIDENCE  |   | • Fellowship Rules   |   |  • LOW_CONF   |  |
|  |  • INVALID         |   | (PASS/FAIL/REVIEW)   |   |  • MISSING    |  |
|  +---------+----------+   +----------+-----------+   +-------+-------+  |
|            |                         |                       |          |
|            +-------------------------+-----------------------+          |
|                                      |                                  |
|                                      v                                  |
|                 +--------------------------------------+                |
|                 |    Final Status & Explainability     |                |
|                 |  • ELIGIBLE / NOT_ELIGIBLE           |                |
|                 |  • HUMAN_REVIEW / INCOMPLETE         |                |
|                 |  • Structured Explainability (✓/✗/⚠) |                |
|                 +--------------------------------------+                |
+-------------------------------------------------------------------------+
```

---

## 4. REST API Specification

### `GET /api/health`
Health and operational status of the verification engine.

### `GET /api/schemes`
Returns definitions, guidelines, and required documents for all three schemes.

### `POST /api/verify` (Main Endpoint)
**Request Body:**
```json
{
  "applicationId": "MOTA-PM-2026-001",
  "scheme": "PRE_MATRIC",
  "applicant": {
    "fullName": "Mangal Munda",
    "category": "Scheduled Tribe",
    "gender": "Male",
    "dateOfBirth": "2010-06-15"
  },
  "education": {
    "currentClass": "Class IX",
    "institutionName": "Govt. High School Khunti",
    "institutionType": "Government School",
    "isRecognized": true
  },
  "financial": {
    "annualFamilyIncome": 140000,
    "receivingOtherScholarship": false,
    "bankDetails": {
      "accountNumber": "98765432101234",
      "ifscCode": "SBIN0001234",
      "bankName": "State Bank of India"
    }
  },
  "documents": {
    "ST Certificate": { "status": "PRESENT" },
    "Income Certificate": { "status": "PRESENT" },
    "School Enrollment / Admission Verification": { "status": "PRESENT" },
    "Bank Account Passbook / Proof": { "status": "PRESENT" }
  },
  "documentIntelligence": {
    "crossChecks": [
      { "field": "applicantName", "match": true },
      { "field": "dateOfBirth", "match": true }
    ]
  }
}
```

**Response Body:**
```json
{
  "applicationId": "MOTA-PM-2026-001",
  "scheme": "PRE_MATRIC",
  "schemeName": "Pre-Matric Scholarship for ST Students",
  "documentVerification": [
    {
      "document": "ST Certificate",
      "status": "PRESENT",
      "reason": "ST Certificate is present. Verified through System A document intelligence."
    }
  ],
  "ruleEvaluation": [
    {
      "ruleId": "PM-INCOME-01",
      "criterion": "Annual family income",
      "expected": "<= 250000",
      "actual": 140000,
      "status": "PASS",
      "reason": "Reported annual family income of ₹1,40,000 is within the scheme limit of ₹2,50,000."
    }
  ],
  "deficiencies": [],
  "finalStatus": "ELIGIBLE",
  "explanation": "### AI-Assisted Verification Summary...\n✓ Criteria Successfully Verified...",
  "humanReviewRequired": false
}
```

### `POST /api/check-documents`
Validates only the document presence, validity, and confidence against the scheme requirements.

### `POST /api/evaluate-rules`
Evaluates only the deterministic eligibility rules for an application.

### `GET /api/demo-application?scenario=DEMO_1_ELIGIBLE`
Retrieves pre-configured demo applications.

### `POST /api/demo-application`
Executes verification on a selected demo scenario (`DEMO_1_ELIGIBLE`, `DEMO_2_INELIGIBLE`, `DEMO_3_HUMAN_REVIEW`, `DEMO_4_INCOMPLETE`).

---

## 5. Quickstart & How to Run

### Install Dependencies
```bash
cd MOTA_SCHOLARSHIP_PROTOTYPE/system-b-verification-engine
npm install
```

### Run Automated Test Suite
```bash
npm test
```
All 14 tests covering all 3 schemes, eligible, ineligible, human review, and sub-APIs will execute.

### Start the Service
```bash
npm start
```
* **API Base:** `http://localhost:5050/api`
* **Healthcheck:** `http://localhost:5050/api/health`
* **Test Bed Dashboard:** `http://localhost:5050/`
