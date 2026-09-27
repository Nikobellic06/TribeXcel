# Ministry of Tribal Affairs (MoTA) — System A: Document Intelligence Engine

> **AI-Powered Scholarship and Fellowship Management System Prototype**  
> *Notice: This repository contains ONLY the AI backend/engine (System A). It is designed to be consumed via REST APIs by future MoTA web portals, mobile apps, and System B (Eligibility & Award Engine).*

---

## 🏛️ System Overview

The **MoTA Document Intelligence Engine** automates the ingestion, type classification, legibility quality assessment, field extraction, cross-document verification, and light anomaly detection for tribal scholarship applications (including Pre-Matric, Post-Matric, National Fellowship, and Overseas Scholarships).

### Core Pipeline Architecture

```text
DOCUMENT UPLOAD (PDF, JPG, JPEG, PNG)
        ↓
DOCUMENT TYPE DETECTION (15 MoTA Document Classes)
        ↓
DOCUMENT QUALITY ANALYSIS (GOOD / WARNING / POOR)
        ↓
TEXT / FIELD EXTRACTION (Identity, Category, Education, Financial, Bank, Admission)
        ↓
STRUCTURED DATA GENERATION (Normalized Applicant Profile)
        ↓
CROSS-DOCUMENT VALIDATION (9 Verification Attributes)
        ↓
LIGHT ANOMALY DETECTION (LOW / MEDIUM / HIGH Advisory Signals)
        ↓
STRUCTURED JSON RESPONSE
```

---

## ⚡ Technology Stack

- **Runtime:** Node.js (v20+ / v22+)
- **Framework:** Express.js (ES Modules)
- **Ingestion / Uploads:** Multer (Local temporary storage in `./uploads`)
- **Document Intelligence AI:** Google Gemini API (`@google/generative-ai` & `@google/genai` with multimodal vision)
- **Fallback Simulation Engine:** High-fidelity heuristic engine for offline or API-free demonstration
- **Architecture:** REST API-first, JSON schema enforced, No database required for prototype

---

## 📋 Document Types Handled

The engine strictly classifies ingested documents into one of the following 15 MoTA categories:

| Document Type Code | Description |
|---|---|
| `ST_CERTIFICATE` | Scheduled Tribe Caste Certificate issued by Revenue / Sub-Divisional Authority |
| `PVTG_CERTIFICATE` | Particularly Vulnerable Tribal Group Certificate |
| `INCOME_CERTIFICATE` | Revenue / Tehsildar issued Annual Family Income Certificate |
| `DOMICILE_CERTIFICATE` | State / Permanent Residence Certificate |
| `AADHAAR` | UIDAI Identity Card / Letter |
| `MARKSHEET` | Secondary / Higher Secondary / Board Marksheet |
| `DEGREE_CERTIFICATE` | Bachelor's / Master's / Diploma Certificate |
| `ADMISSION_LETTER` | Higher Educational Institution Formal Admission Letter |
| `OFFER_LETTER` | Provisional / University Admission Offer Letter |
| `BANK_PASSBOOK` | Bank Account Passbook / Statement (for DBT Disbursement) |
| `DISABILITY_CERTIFICATE` | PwD Medical Board Certificate (if applicable) |
| `BONAFIDE_CERTIFICATE` | Educational Institution Enrolment / Bonafide Certificate |
| `FEE_RECEIPT` | Institutional Tuition / Hostel Fee Receipt |
| `OTHER` | Miscellaneous supporting document |
| `UNKNOWN` | Unidentifiable document |

---

## 🔍 Core Capabilities & Safety Guarantees

### 1. Document Quality Analysis (Not Fraud)
- Classified as `GOOD`, `WARNING`, or `POOR` with confidence score and identified issues (blur, low resolution, cropped content, missing pages).
- **CRITICAL POLICY:** *Poor scan quality does NOT mean fraud.* The engine never marks an applicant or document as fraudulent.

### 2. Strict Non-Hallucination Field Extraction
- Extracts only data genuinely present and legible.
- Returns `null` for missing or obscured fields. Never fabricates numbers, dates, or names.
- Schema covers: Identity, Category, Address, Education, Financial, Bank, Admission.

### 3. Cross-Document Validation Matrix
Compares 9 attributes across all submitted documents:
1. **Full Name** (`fullName` / `accountHolderName`)
2. **Date of Birth** (`dateOfBirth`)
3. **Category** (`category` — ST, PVTG, etc.)
4. **Tribe Name** (`tribeName` — Santhal, Gond, Bhil, Birhor, etc.)
5. **Domicile State** (`domicileState` / `state`)
6. **Institution** (`institution`)
7. **Course** (`course` / `programme`)
8. **Qualification** (`qualification`)
9. **Annual Income** (`annualIncome`)

**Validation Statuses:**
- `MATCH`: Values align consistently across records.
- `MINOR_VARIATION`: Minor spelling or transliteration variation (e.g., "Rahul Kumar" vs "Rahul Kr.").
- `MISMATCH`: Direct contradiction (e.g., differing DOBs or conflicting student names).
- `NOT_AVAILABLE`: Found in fewer than 2 documents for cross-comparison.

> *Applicants are never automatically rejected on mismatch; discrepancies are flagged for human desk review.*

### 4. Light Anomaly Detection
- Returns anomaly level: `LOW`, `MEDIUM`, or `HIGH`.
- Provides evidence signals and desk officer guidance.
- Advisory wording: *"Potential inconsistency detected; human verification recommended."*

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18.0.0 or higher, tested on v22.17.1)
- npm (v9.0.0 or higher)

### 2. Installation
Navigate into the engine directory:
```bash
cd MOTA_SCHOLARSHIP_PROTOTYPE/system-a-document-intelligence
npm install
```

### 3. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env`:
```env
PORT=5001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
MAX_FILE_SIZE_MB=10
```
> *Note: If `GEMINI_API_KEY` is omitted, the engine automatically runs in intelligent simulation fallback mode, allowing full evaluation without an active API key.*

### 4. Start Server
```bash
# Start server
npm start

# Or run in watch mode for development
npm run dev
```

The server starts at `http://localhost:5001`.

### 5. Run Automated Tests
```bash
npm test
```
Runs the automated test suite testing all endpoints, file uploads, quality checks, profile generation, and demo scenarios.

---

## 📡 REST API Reference

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies service uptime, configuration, and Gemini AI status.
- **Example cURL:**
  ```bash
  curl http://localhost:5001/api/health
  ```
- **Sample Response:**
  ```json
  {
    "status": "UP",
    "service": "System A - Document Intelligence Engine",
    "version": "1.0.0",
    "geminiConfigured": true,
    "timestamp": "2026-09-27T13:45:00.000Z"
  }
  ```

---

### 2. Ingest & Analyze Multiple Documents
- **Endpoint:** `POST /api/analyze-documents`
- **Content-Type:** `multipart/form-data`
- **Fields:** `documents` (one or more files: PDF, JPG, JPEG, PNG)
- **Example cURL:**
  ```bash
  curl -X POST http://localhost:5001/api/analyze-documents \
    -F "documents=@sample-documents/01_aadhaar_card.pdf" \
    -F "documents=@sample-documents/02_st_certificate_jharkhand.pdf" \
    -F "documents=@sample-documents/03_income_certificate.pdf"
  ```
- **Response Format:**
  ```json
  {
    "applicationId": "APP-MOTA-1774812345-A1B2",
    "timestamp": "2026-09-27T13:45:00.000Z",
    "documentsCount": 3,
    "documents": [
      {
        "documentType": "AADHAAR",
        "confidence": 0.98,
        "filename": "01_aadhaar_card.pdf",
        "quality": "GOOD",
        "qualityScore": 0.96,
        "fields": {
          "fullName": "Sunita Soren",
          "dateOfBirth": "2004-05-14",
          "gender": "Female",
          "domicileState": "Jharkhand"
        },
        "missingFields": [],
        "issues": []
      }
    ],
    "applicantProfile": {
      "applicant": {
        "fullName": "Sunita Soren",
        "dateOfBirth": "2004-05-14",
        "gender": "Female",
        "category": "ST",
        "tribeName": "Santhal",
        "domicileState": "Jharkhand"
      },
      "education": {
        "class": "12th Standard",
        "institution": "St. Xavier's Inter College",
        "percentage": "87.0%"
      },
      "financial": {
        "annualIncome": "120000"
      },
      "bank": {
        "bankName": "State Bank of India",
        "accountHolderName": "Sunita Soren",
        "accountNumberMasked": "XXXXXX5621",
        "ifsc": "SBIN0000214"
      },
      "documents": [...]
    },
    "crossDocumentValidation": [
      {
        "field": "fullName",
        "label": "Full Name",
        "status": "MATCH",
        "documents": [
          { "document": "01_aadhaar_card.pdf", "value": "Sunita Soren" },
          { "document": "02_st_certificate_jharkhand.pdf", "value": "Sunita Soren" }
        ],
        "remarks": "Values match consistently across all documents."
      }
    ],
    "anomalies": {
      "level": "LOW",
      "signals": [
        "No conflicting signals detected. All extracted documents are consistent."
      ]
    },
    "reviewFlags": []
  }
  ```

---

### 3. Ingest Single Document
- **Endpoint:** `POST /api/analyze-document`
- **Content-Type:** `multipart/form-data`
- **Fields:** `document` (single file: PDF, JPG, JPEG, PNG)
- **Example cURL:**
  ```bash
  curl -X POST http://localhost:5001/api/analyze-document \
    -F "document=@sample-documents/01_aadhaar_card.pdf"
  ```
- **Response Format:**
  ```json
  {
    "documentType": "AADHAAR",
    "confidence": 0.98,
    "filename": "01_aadhaar_card.pdf",
    "quality": "GOOD",
    "qualityScore": 0.96,
    "fields": {
      "fullName": "Sunita Soren",
      "dateOfBirth": "2004-05-14",
      "gender": "Female",
      "address": "Vill - Haripur, PO - Dumka, Dist - Dumka, Jharkhand - 814101"
    },
    "missingFields": [],
    "issues": []
  }
  ```

---

### 4. Demo Application Endpoints (No Upload Required)
- **Endpoint:** `GET /api/demo-application`  
  Lists all available demo scenarios (`clean`, `missing`, `inconsistent`).
- **Endpoint:** `POST /api/demo-application`  
  Runs the pipeline against a chosen demo scenario.
- **Example cURL:**
  ```bash
  # Test Clean Application
  curl -X POST http://localhost:5001/api/demo-application \
    -H "Content-Type: application/json" \
    -d '{"scenario": "clean"}'

  # Test Application with Missing Info
  curl -X POST http://localhost:5001/api/demo-application \
    -H "Content-Type: application/json" \
    -d '{"scenario": "missing"}'

  # Test Application with Inconsistencies
  curl -X POST http://localhost:5001/api/demo-application \
    -H "Content-Type: application/json" \
    -d '{"scenario": "inconsistent"}'
  ```

---

## 🖥️ Minimal Developer & Evaluation Dashboard

A minimal test UI is built-in for interactive evaluation:
- Open your browser to: **`http://localhost:5001/`**
- Features:
  - Drag-and-drop or select multiple documents (PDF, JPG, PNG)
  - Execute full analysis with one click
  - Load demo scenarios (`Clean`, `Missing Info`, `Inconsistent`) instantly
  - View detected document types, confidence, and quality metrics
  - View normalized applicant profile cards
  - View the 9-point cross-document validation comparison matrix
  - View light anomaly detection signals and desk review flags
  - Inspect and copy formatted raw REST JSON responses

---

## 📁 Project Directory Structure

```text
MOTA_SCHOLARSHIP_PROTOTYPE/
└── system-a-document-intelligence/
    ├── .env.example                     # Environment template
    ├── .env                             # Local configuration
    ├── .gitignore                       # Git ignore rules
    ├── package.json                     # Node.js dependencies & scripts
    ├── README.md                        # Documentation
    ├── uploads/                         # Temporary upload directory
    ├── sample-documents/                # Pre-generated sample documents
    ├── public/                          # Minimal Developer Test Dashboard
    │   ├── index.html
    │   ├── style.css
    │   └── app.js
    ├── tests/
    │   └── test-engine.js               # Comprehensive test suite
    └── src/
        ├── index.js                     # Express server entry point
        ├── config.js                    # Configuration & environment loader
        ├── controllers/
        │   ├── document.controller.js   # Single & multi-document controller
        │   └── demo.controller.js       # Demo application controller
        ├── routes/
        │   ├── health.routes.js         # GET /api/health
        │   ├── document.routes.js       # Document upload & analysis routes
        │   └── demo.routes.js           # Demo scenarios routes
        ├── services/
        │   ├── gemini.service.js        # Gemini Vision AI integration
        │   ├── documentParser.service.js# Ingestion parser & fallback logic
        │   ├── profile.service.js       # Normalized profile generator
        │   ├── validation.service.js    # 9-point cross-document validator
        │   ├── anomaly.service.js       # Light anomaly & review flags
        │   └── pipeline.service.js      # Core orchestrator pipeline
        ├── data/
        │   └── demoScenarios.js         # Clean, Missing, Inconsistent demo data
        └── utils/
            ├── fileUtils.js             # Multer setup, cleanup, base64 helper
            └── textNormalizer.js        # String similarity, Levenshtein, dates
```
