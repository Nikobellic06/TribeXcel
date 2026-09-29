# Ministry of Tribal Affairs (MoTA) - TribeXcel Platform Architecture

## 1. System Overview

**TribeXcel** is the AI-enabled Scholarship and Fellowship Management System engineered for the **Ministry of Tribal Affairs (MoTA), Government of India**. The platform digitizes and unifies the complete beneficiary journey—from registration, Aadhaar-based e-KYC, and DigiLocker document retrieval to deterministic rule evaluation, AI-assisted document quality inspection, nodal officer scrutiny, and DBT-ready merit generation.

---

## 2. Monorepo Organization

```
TribeXcel/
├── apps/
│   ├── student-portal/       # Vite + React student web application (Port 5174)
│   └── admin-portal/         # Vite + React scrutiny officer dashboard (Port 5173)
├── services/
│   ├── api-server/           # Node.js Express REST API & MongoDB Data Store (Port 5000)
│   └── ai-engine/            # Python FastAPI Document OCR & Intelligence (Port 8000)
├── packages/
│   └── scheme-config/        # Canonical single-source-of-truth scheme configuration
├── docs/                     # Production architecture, security, and scheme documentation
├── scripts/                  # Seed scripts, migration utilities, and deployment helpers
├── package.json              # NPM Workspaces monorepo manifest
├── start-all.ps1             # PowerShell orchestrator
├── start-all.bat             # Batch orchestrator
└── seed-all.bat              # Database seeder script
```

---

## 3. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Beneficiary ["Student Beneficiaries"]
        SP["apps/student-portal<br/>(Port 5174)"]
    end

    subgraph Administration ["Ministry Scrutiny Cell"]
        AP["apps/admin-portal<br/>(Port 5173)"]
    end

    subgraph CoreServices ["Core Backend Services"]
        API["services/api-server<br/>(Node.js Express - Port 5000)"]
        AI["services/ai-engine<br/>(Python FastAPI - Port 8000)"]
        DB[("MongoDB Database")]
    end

    subgraph ExternalEcosystem ["National Digital Public Infrastructure (DPI)"]
        DL["DigiLocker / API Setu<br/>OAuth 2.0 Gateway"]
        UIDAI["UIDAI / Aadhaar e-KYC<br/>(Verhoeff Checksum + Masked)"]
        NSP["National Scholarship Portal (NSP)<br/>(scholarships.gov.in)"]
    end

    SP -->|"REST API / Bearer Token"| API
    AP -->|"Scrutiny & Review API"| API
    API -->|"OCR & Layout Inspection"| AI
    API -->|"Mongoose ODM"| DB
    API -->|"Token Exchange & URI Query"| DL
    API -->|"Aadhaar Verification"| UIDAI
    SP -.->|"Federated Routing"| NSP
```

---

## 4. End-to-End Application Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor S as Student Beneficiary
    participant SP as Student Portal
    participant API as API Server
    participant DL as DigiLocker / API Setu
    participant AI as AI Engine
    participant DB as MongoDB
    actor O as Scrutiny Officer
    participant AP as Admin Portal

    Note over S,SP: 1. Registration & e-KYC
    S->>SP: Register (Email, Mobile, Password)
    SP->>API: POST /api/student/register
    API->>DB: Create Student Record
    S->>SP: Submit Aadhaar Number
    SP->>API: POST /api/student/profile/aadhaar-kyc
    API->>API: Validate Verhoeff Checksum
    API->>DB: Store Masked (XXXX-XXXX-1234) + Timestamp
    API->>DB: Record Audit Log (AADHAAR_KYC_VERIFIED)

    Note over S,DL: 2. DigiLocker Document Ingestion
    S->>SP: Click "Fetch from DigiLocker"
    SP->>API: GET /api/student/digilocker/authorize
    API-->>SP: OAuth Redirect URI with CSRF State
    S->>DL: Authenticate & Authorize
    DL->>API: GET /api/student/digilocker/callback?code=...
    API->>DL: Token Exchange (OAuth 2.0)
    API->>DL: Query Issued Documents
    DL-->>API: List of Issued URIs (CSTCR, INCER, etc.)
    API->>DL: Download Cryptographic XML/PDF
    API->>DB: Create Document Record (status: VERIFIED, source: digilocker)
    API->>DB: Record Audit Log (DOCUMENT_FETCHED_DIGILOCKER)

    Note over S,API: 3. Application Submission & Freezing
    S->>SP: Fill Form & Click "Submit Application"
    SP->>API: POST /api/student/applications
    API->>DB: Verify Document Ownership & Real Status
    API->>API: Calculate Deterministic Rule Snapshot
    API->>DB: Save Immutable Snapshot (version: 1, status: Pending)
    API->>API: Trigger Background AI Analysis
    API->>AI: POST /api/v1/analyze
    AI-->>API: OCR Extracted Fields & Quality Flags
    API->>DB: Update aiAnalysis Record
    API->>DB: Record Audit Log (APPLICATION_SUBMISSION)

    Note over O,AP: 4. Officer Scrutiny & Decisions
    O->>AP: Open Application Review Queue
    AP->>API: GET /api/applications/:id
    API-->>AP: Application Snapshot + AI Findings + Rule Evaluation
    O->>AP: Mark Specific Document Deficient
    AP->>API: POST /api/applications/:id/documents/:docType/verify
    API->>DB: Update Document (status: DEFICIENT)
    O->>AP: Record Decision: Defective (with remarks & deadline)
    AP->>API: POST /api/applications/:id/decision
    API->>DB: Update Application (status: Deficient, resubmissionOpen: true)
    API->>DB: Record Audit Log (APPLICATION_DECISION)

    Note over S,SP: 5. Deficiency Correction & Resubmission
    S->>SP: Receives Action Required Banner
    S->>SP: Re-uploads Corrected Certificate
    SP->>API: POST /api/student/applications/:id/resubmit
    API->>DB: Increment version to 2, status: Pending, resubmissionCount: 1
    API->>DB: Record Audit Log (APPLICATION_RESUBMISSION)
```

---

## 5. Security & Data Integrity Principles

1. **Authoritative Backend Document Model:**
   - The frontend never dictates document verification status.
   - When submitting applications, the server cross-checks uploaded document URLs and DigiLocker URIs against the MongoDB `Document` collection owned by the student.
   - Manual uploads are initialized as `PENDING` and require official scrutiny.
   - Only documents retrieved directly from API Setu / DigiLocker obtain `VERIFIED` status upon token-verified issuance.

2. **Immutable Snapshot Versioning:**
   - Applications maintain complete historical snapshots (`v1`, `v2`, etc.).
   - Resubmission does not mutate or overwrite previous officer audits; each revision is appended to `versionHistory`.

3. **Tamper-Evident Audit Logging:**
   - Every state transition, upload, e-KYC validation, and scrutiny decision logs an immutable entry to `AuditLog` capturing:
     - `actor` (ID, model, name, role)
     - `action` (strict enum)
     - `target` (entity type and ID)
     - `clientIp` and `userAgent`
     - `timestamp` (ISO 8601 UTC)
     - `metadata` (before/after states, error details, filenames)
