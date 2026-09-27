# Ministry of Tribal Affairs (MoTA) — AI Engines Integration Layer & Demo Dashboard

> **Prototype — Complete AI-Assisted Document Intelligence & Scholarship Verification Pipeline**  
> *Combines System A (Document Intelligence Engine) and System B (Scholarship Verification Engine) into one unified API and evaluation dashboard.*

---

## 🏛️ System Architecture

```text
                               DEMO DASHBOARD (React + Vite + Tailwind)
                                        │
                                        ▼ (HTTP / JSON)
                                 INTEGRATION API (Port 5002)
                                  /                     \
                   Multipart / PDF / JPG                 Normalized Application JSON
                                /                         \
                               ▼                           ▼
                     SYSTEM A API (Port 5001)    SYSTEM B API (Port 5050)
                      Document Intelligence        Scholarship Verification
                                \                         /
                          Document AI Results       Eligibility Verification Results
                                  \                     /
                                   ▼                   ▼
                                 COMBINED FINAL RESPONSE CONTRACT
```

---

## 🔄 End-to-End Pipeline

```text
DOCUMENT UPLOAD (PDF, JPG, JPEG, PNG)
      ↓
AI DOCUMENT ANALYSIS (System A - 15 MoTA Document Classes)
      ↓
DATA EXTRACTION (Identity, Category, Education, Financial, Bank)
      ↓
CROSS-DOCUMENT VALIDATION (9 Verification Attributes, Name/DOB consistency)
      ↓
SCHOLARSHIP VERIFICATION (System B - Statutory Scheme Rules & Ceilings)
      ↓
EXPLAINABLE RESULT (Deficiency breakdown & Rule-by-rule evaluation)
      ↓
HUMAN REVIEW FLAG (Non-autonomous AI; Final officer review requirement)
```

---

## 📁 Complete Folder Structure

```text
MOTA_SCHOLARSHIP_PROTOTYPE/
├── system-a-document-intelligence/       # Port 5001 (Gemini Vision AI / Heuristic Ingestion)
├── system-b-verification-engine/          # Port 5050 (Rule & Document Verification Engine)
└── integration/                           # Port 5002 (Integration Layer & Demo Dashboard)
    ├── .env.example                       # Environment template
    ├── .env                               # Active configuration
    ├── .gitignore                         # Git ignore configuration
    ├── package.json                       # Integration dependencies & scripts
    ├── README.md                          # Comprehensive documentation
    ├── uploads/                           # Temporary file upload directory
    ├── backend/
    │   ├── server.js                      # Express server entry point
    │   ├── config.js                      # Port, timeout & URL configuration
    │   ├── controllers/
    │   │   ├── health.controller.js       # GET /api/health
    │   │   ├── process.controller.js      # POST /api/process-application
    │   │   └── demo.controller.js         # Demo application controller
    │   ├── routes/
    │   │   ├── health.routes.js           # Health routes
    │   │   ├── process.routes.js          # Ingestion routes with Multer
    │   │   └── demo.routes.js             # Demo evaluation routes
    │   ├── services/
    │   │   ├── systemAClient.js           # HTTP client for System A
    │   │   ├── systemBClient.js           # HTTP client for System B
    │   │   ├── transformer.js             # Bridges System A -> System B -> Contract
    │   │   └── demoService.js             # Reliable demo execution service
    │   ├── data/
    │   │   └── demoScenarios.js           # Datasets for Eligible, Ineligible & Human Review
    │   └── test/
    │       └── test-integration.js        # 38-assertion automated test suite
    └── frontend/                          # React + Vite + Tailwind CSS Demo Dashboard
        ├── index.html
        ├── package.json
        ├── vite.config.js                 # Dev server with proxy to port 5002
        ├── tailwind.config.js
        ├── postcss.config.js
        └── src/
            ├── main.jsx                   # React root entry
            ├── App.jsx                    # Main application orchestration
            ├── index.css                  # Tailwind styles
            └── components/
                ├── Header.jsx                         # MoTA branding & engine health badges
                ├── ApplicationSection.jsx             # Section 1: Ingestion & demo buttons
                ├── PipelineStatus.jsx                 # Section 2: 6-stage pipeline tracker
                ├── DocumentIntelligenceSection.jsx    # Section 3: System A extracted doc cards
                ├── ApplicantProfileSection.jsx        # Section 4: Synthesized profile cards
                ├── CrossDocValidationSection.jsx      # Section 5: Cross-check comparison matrix
                ├── EligibilityVerificationSection.jsx # Section 6: System B statutory rule table
                ├── FinalResultSection.jsx             # Section 7: Explainable decision & notice
                └── RawJsonModal.jsx                   # Raw REST JSON viewer & copy modal
```

---

## ⚙️ Environment Variables

File: `MOTA_SCHOLARSHIP_PROTOTYPE/integration/.env`

```env
PORT=5002
NODE_ENV=development

# System A: Document Intelligence Engine
SYSTEM_A_URL=http://localhost:5001

# System B: Scholarship Verification Engine
SYSTEM_B_URL=http://localhost:5050
```

---

## 🚀 Exact Commands to Start All Engines

Open **4 separate terminal windows** (or start in background):

### Terminal 1: Start System A (Document Intelligence Engine)
```powershell
cd c:\Users\prakh\Desktop\GIthub\TribeXcel\MOTA_SCHOLARSHIP_PROTOTYPE\system-a-document-intelligence
npm start
```
*Runs on: `http://localhost:5001`*

### Terminal 2: Start System B (Scholarship Verification Engine)
```powershell
cd c:\Users\prakh\Desktop\GIthub\TribeXcel\MOTA_SCHOLARSHIP_PROTOTYPE\system-b-verification-engine
npm start
```
*Runs on: `http://localhost:5050`*

### Terminal 3: Start Integration API Server
```powershell
cd c:\Users\prakh\Desktop\GIthub\TribeXcel\MOTA_SCHOLARSHIP_PROTOTYPE\integration
npm start
```
*Runs on: `http://localhost:5002` (also serves production dashboard build)*

### Terminal 4: Start Demo Dashboard (Vite Hot-Reload)
```powershell
cd c:\Users\prakh\Desktop\GIthub\TribeXcel\MOTA_SCHOLARSHIP_PROTOTYPE\integration\frontend
npm run dev
```
*Runs on: `http://localhost:3000` (proxies `/api` requests to port 5002)*

---

## 📡 Integration REST API Reference

### 1. Unified Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies connectivity to Integration layer, System A, and System B.
- **Example cURL:**
  ```bash
  curl http://localhost:5002/api/health
  ```
- **Response:**
  ```json
  {
    "integration": "UP",
    "systemA": "UP",
    "systemB": "UP",
    "timestamp": "2026-09-27T14:00:00.000Z"
  }
  ```

---

### 2. End-to-End Application Processing
- **Endpoint:** `POST /api/process-application`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `documents` (one or more files: PDF, JPG, PNG)
  - `scheme` (`PRE_MATRIC` | `NOS` | `NATIONAL_FELLOWSHIP`)
  - `applicationId` (optional identifier)
- **Example cURL:**
  ```bash
  curl -X POST http://localhost:5002/api/process-application \
    -F "scheme=PRE_MATRIC" \
    -F "documents=@sample-documents/01_aadhaar_card.pdf" \
    -F "documents=@sample-documents/02_st_certificate_jharkhand.pdf" \
    -F "documents=@sample-documents/03_income_certificate.pdf"
  ```

---

### 3. Response Contract Format (Section 5)
```json
{
  "applicationId": "MOTA-PM-2026-001",
  "scheme": "PRE_MATRIC",

  "applicant": {
    "fullName": "Mangal Munda",
    "dateOfBirth": "2010-06-15",
    "gender": "Male",
    "category": "Scheduled Tribe",
    "tribeName": "Munda",
    "domicileState": "Jharkhand"
  },

  "education": {
    "class": "Class IX",
    "institution": "Govt. High School Khunti",
    "percentage": "78.4%"
  },

  "financial": {
    "annualIncome": "140000"
  },

  "documents": [ ... ],

  "documentIntelligence": {
    "extractedData": { ... },
    "documentResults": [
      {
        "documentName": "munda_st_certificate_khunti.pdf",
        "detectedType": "ST_CERTIFICATE",
        "confidence": 0.98,
        "quality": "GOOD",
        "qualityScore": 0.96,
        "fields": { ... },
        "missingFields": [],
        "issues": []
      }
    ],
    "crossDocumentValidation": [
      {
        "field": "fullName",
        "label": "Full Name",
        "status": "MATCH",
        "documents": [ ... ],
        "remarks": "Full name matches consistently across all records."
      }
    ],
    "anomalies": [ ... ],
    "reviewFlags": [ ... ]
  },

  "verification": {
    "documentVerification": [
      { "document": "ST Certificate", "status": "PRESENT", "confidence": 0.98 }
    ],
    "ruleEvaluation": [
      {
        "id": "PM-INCOME-01",
        "rule": "Annual family income <= 2.5 Lakh",
        "status": "PASS",
        "expected": "<= ₹2,50,000",
        "actual": "₹1,40,000",
        "reason": "Income is within the applicable limit."
      }
    ],
    "deficiencies": [],
    "finalStatus": "ELIGIBLE",
    "explanation": "Applicant satisfies all statutory eligibility requirements under the Pre-Matric ST Scholarship Scheme.",
    "humanReviewRequired": false
  }
}
```

---

## 🧪 Automated Integration Test Suite

Run the full automated test suite verifying all endpoints, demo modes, live processing, and response contract compliance:

```powershell
cd c:\Users\prakh\Desktop\GIthub\TribeXcel\MOTA_SCHOLARSHIP_PROTOTYPE\integration
npm test
```

### Verified Test Assertions (38/38 Passed):
- `GET /api/health`: Integration, System A, and System B all report UP
- `GET /api/demo-application`: Available demo scenarios returned
- `POST /api/demo-application` (eligible): Status is `ELIGIBLE`, rules pass, `humanReviewRequired: false`
- `POST /api/demo-application` (ineligible): Status is `NOT_ELIGIBLE`, lists failed criteria (Category, Income, Marks, Age)
- `POST /api/demo-application` (human_review): Status is `HUMAN_REVIEW`, `humanReviewRequired: true`, DOB mismatch detected
- `POST /api/process-application`: Live multi-document upload through System A + System B
- **Section 5 Response Contract Compliance:** All 8 top-level keys, all 5 documentIntelligence keys, and all 6 verification keys strictly enforced.

---

## 🎯 SIH Presentation Demo Procedure

1. **Open Dashboard:** Navigate to `http://localhost:3000` (or `http://localhost:5002`).
2. **Demo 1 — Eligible:**
   - Click `[Demo: Eligible]`
   - Watch the 6-stage pipeline animate from *Document Upload* to *Final Report*.
   - Point out: Verified ST Munda category, Class IX enrollment, income ₹1,40,000 <= ₹2,50,000 ceiling, all documents matched.
   - Result: **ELIGIBLE** (AI-assisted verification result).
3. **Demo 2 — Ineligible:**
   - Click `[Demo: Ineligible]`
   - Point out scheme: *National Overseas Scholarship (NOS)*.
   - Show failed statutory criteria in Section 6: Category (OBC instead of ST), Income (₹8.5L > ₹6L limit), Marks (51.5% < 55% cutoff), Age (35 > 32 limit).
   - Result: **NOT_ELIGIBLE** (Definitive rule failure, no ambiguity).
4. **Demo 3 — Human Review:**
   - Click `[Demo: Human Review]`
   - Point out scheme: *National Fellowship (NFST)*.
   - Show Section 5: **Date of Birth MISMATCH** (Aadhaar 20/08/1995 vs PG marksheet 12/08/1994).
   - Show Section 3: Low-resolution scan warning on institutional recommendation.
   - Result: **HUMAN_REVIEW** (`humanReviewRequired: true`).
   - Highlight: *Uncertainty does not cause automatic rejection; it flags the application for desk officer verification.*
5. **Inspect Full API JSON:**
   - Click **"View Full API JSON"** in Section 7 to demonstrate the exact schema consumed by future MoTA web and mobile apps.
