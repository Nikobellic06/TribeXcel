# Ministry of Tribal Affairs (MoTA) — National Scholarship & Fellowship Portal
## Integrated Digital Platform for Scheduled Tribe Students

An end-to-end, integrated Government of India scholarship verification and lifecycle platform. It unifies the **Student Scholarship Portal**, the **Central Node.js/Express Backend & Database**, the **AI Document & Verification Engine (Python/PaddleOCR/PyMuPDF/OpenCV)**, and the **Scholarship Administration Portal**.

---

## 1. System Architecture

```
                    STUDENT WEB PORTAL (React + Vite + Tailwind)
                            [Port 5174: http://localhost:5174]
                                        │
                                        │ HTTP API
                                        ▼
                       CENTRAL SCHOLARSHIP BACKEND (Node.js + Express)
                            [Port 5000: http://localhost:5000]
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
                 ▼                      ▼                      ▼
        MongoDB Database           Local Storage           AI ENGINE (Python + FastAPI)
    mongodb://127.0.0.1:27017       uploads/            [Port 8000: http://localhost:8000]
    - Student Profiles                  │                      │
    - Applications                      │             ┌────────┼────────┐
    - Documents Metadata                │             ▼        ▼        ▼
    - Status History                    │          OpenCV  PaddleOCR  PyMuPDF
    - Officer Decisions                 │             │        │        │
                 ▲                      │             └────────┼────────┘
                 │                      │                      │
                 │                      │             Document Classification
                 │                      │             Structured Extraction
                 │                      │             Field Validation
                 │                      │             Cross-Document Checks
                 │                      │             Scheme Rule Engine
                 │                      │                      │
                 │                      │                      ▼
                 └──────────────────────┴───────────── Structured AI Analysis
                                                               │
                                                               ▼
                                                 ADMIN PORTAL (React + Vite)
                                              [Port 5173: http://localhost:5173]
                                                               │
                                                               ▼
                                                   OFFICER DECISION & AUDIT
```

---

## 2. Directory Structure

```
TribeXcel/
├── ai-engine/                  # [Python 3.10+ FastAPI] AI Document & Verification Engine
│   ├── app/
│   │   ├── config.py           # Pre-Matric, NFST, and NOS scheme configurations
│   │   ├── main.py             # FastAPI entry point (/api/analyze-document, /health, etc.)
│   │   ├── models/             # Pydantic request/response schemas
│   │   ├── ocr/
│   │   │   ├── engine.py       # RapidOCR (PaddleOCR PP-OCRv6) + PyMuPDF + OpenCV CLAHE/Deskew
│   │   │   ├── classifier.py   # Content-based classification (14 document types)
│   │   │   ├── extractors.py   # Specialized schema regex & proximity extractors
│   │   │   └── validation.py   # Field validation and confidence scoring
│   │   └── rules/
│   │       ├── cross_check.py  # Cross-document consistency verification
│   │       ├── scholarship_rules.py # Pre-Matric, NFST, and NOS rule evaluation
│   │       └── merit.py        # Objective multi-criteria merit calculation
│   └── requirements.txt
│
├── scholarship-admin/          # [Admin Ecosystem & Backend]
│   ├── backend/                # Node.js + Express + Mongoose central API (Port 5000)
│   │   ├── config/             # MongoDB connection and scheme rules
│   │   ├── controllers/        # Application, Auth, Student Drafts, Uploads
│   │   ├── models/             # Application, Student, Admin, ApplicationDraft
│   │   ├── routes/             # Admin, Student, Uploads, Health, AI proxy
│   │   ├── scripts/            # Database seed scripts (seedAdmin, seedApplications)
│   │   └── services/           # Rule engine, cross-checks, review assessment
│   └── frontend/               # React 18 + Vite admin portal for verification officers (Port 5173)
│
├── student-web/                # [Student Portal Ecosystem]
│   └── frontend/               # React 18 + Vite student portal with Gov design (Port 5174)
│       ├── src/
│       │   ├── components/     # EligibilityCheckerModal, GovHeader, ApplicationTracker
│       │   ├── pages/          # Landing, Dashboard, SchemeSelection, Apply, Acknowledgement
│       │   └── services/       # documentIntelligence.js (live scanning pipeline)
│
├── start-all.bat               # 1-Click launcher for all 4 services (Windows Command Prompt)
├── start-all.ps1               # 1-Click launcher for all 4 services (PowerShell)
└── seed-all.bat                # 1-Click database seeding script
```

---

## 3. Technology Stack & Key Highlights

- **AI Document Engine:** Python 3.13, FastAPI, RapidOCR (Official PaddleOCR PP-OCRv6 on ONNX), OpenCV, PyMuPDF, Pillow, Regex.
  - **Zero Gemini:** Purely local, deterministic processing with zero cloud/API charges.
  - **Content-Based:** Classifies documents strictly from OCR text and keywords, never filenames.
  - **Assistive AI:** Officers retain final authority; AI provides preliminary checks and evidence.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication.
- **Student Frontend:** React 18, Vite, Tailwind CSS 4, Lucide React, bilingual (EN/HI).
- **Admin Frontend:** React 18, Vite, Tailwind CSS, Recharts.

---

## 4. Quick Start (Windows)

### Prerequisites
1. **Node.js** (v18+)
2. **Python** (v3.10+)
3. **MongoDB Community Server** running locally on port 27017.

### Step 1: Seed the Database
Run the seeding script to initialize the admin officer and 20 realistic test applications:
```powershell
.\seed-all.bat
```
*(Or manually in `scholarship-admin/backend`: `npm run seed:admin admin@mota.gov.in Admin@1234 "Rajesh Kumar"` followed by `npm run seed:applications`)*

### Step 2: Start All Services
Launch all 4 services simultaneously:
```powershell
.\start-all.bat
```
*(Or `.\start-all.ps1` in PowerShell)*

This opens 4 terminals:
| Service | URL | Role |
|---|---|---|
| **AI Document Engine** | `http://localhost:8000` | PaddleOCR, classification, extraction |
| **Central Backend** | `http://localhost:5000` | Express REST API & MongoDB |
| **Student Web Portal** | `http://localhost:5174` | Student registration, application, document upload |
| **Admin Web Portal** | `http://localhost:5173` | Verification officer review queue & decisions |

---

## 5. Demo Credentials

### Verification Officer (Admin Portal — `http://localhost:5173`)
- **Email:** `admin@mota.gov.in`
- **Password:** `Admin@1234`
- **Role:** Scholarship Verification Officer

### Demo ST Student (Student Portal — `http://localhost:5174`)
- **Email:** `sunita.soren@scholarship.gov.in`
- **Password:** `Demo@1234`
- *(Or use the 1-Click "SIH Evaluator Quick Access" button on the student login page)*

---

## 6. End-to-End Demonstration Walkthrough

### Part A: Student Submission & Real AI Processing
1. Open **Student Portal** at `http://localhost:5174`.
2. Click **"1-Click Demo Login"** (or sign in as Sunita Soren).
3. Click **"Check Eligibility"** on the header to evaluate scheme qualifications.
4. Select **National Fellowship for Higher Education of ST Students (NFST)**.
5. In Step 4 (Documents), upload test documents (located in `sample-documents/`):
   - `sample_st_certificate.pdf`
   - `sample_income_certificate.pdf`
   - `sample_marksheet.pdf`
6. Observe the real-time AI scanning drawer:
   - `Validating` $\to$ `Reading with PaddleOCR` $\to$ `Classifying Type` $\to$ `Extracting Entities` $\to$ `Completed`.
   - Inspect extracted fields (Certificate No, Issuing Authority, Financial Year, Income).
7. Review application details and submit. Print the official system-generated **Acknowledgement Receipt**.

### Part B: Verification Officer Action & Decision
1. Open **Admin Portal** at `http://localhost:5173` and log in.
2. Go to **Review Queue** or **Applications**. Open the newly submitted application.
3. Review:
   - **Uploaded Documents:** View/download links.
   - **AI Preliminary Checks:** Bounding box confidence, OCR text, extracted entities.
   - **Cross-Document Verification:** Name match, DOB match, Income match between certificates and form.
   - **Scheme Rules:** Pre-Matric/NFST/NOS eligibility rule outcomes.
4. Choose an Officer Action:
   - **Verify:** Marks application as `Eligible` for final merit selection.
   - **Mark Defective:** Enter mandatory defect category (e.g., *Illegible document*) and required correction.
   - **Reject:** Enter mandatory statutory rejection reason and officer remarks.

### Part C: Defect & Resubmission Flow
1. If the officer marks an application **Defective**, switch back to the **Student Portal** (`http://localhost:5174`).
2. Student Dashboard displays an **"Action Required / Defective Application"** card with the officer's exact remarks and a 15-day compliance notice.
3. Student clicks **"Correct and Resubmit"**, updates the requested document, and resubmits.
4. The application returns to the Admin Review Queue with updated audit history (`Resubmitted after correction`).

---

## 7. Service Health Checks

- **Backend Health:** `http://localhost:5000/api/health`
  ```json
  {
    "status": "UP",
    "database": "CONNECTED",
    "aiEngine": "UP",
    "timestamp": "2026-09-28T11:00:00.000Z"
  }
  ```
- **AI Engine Health & Swagger Docs:** `http://localhost:8000/docs` and `http://localhost:8000/health`
