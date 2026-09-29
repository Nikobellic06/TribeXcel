# Ministry of Tribal Affairs (MoTA) — TribeXcel Platform
## AI-Enabled Scholarship & Fellowship Management System
**Government of India | जनजातीय कार्य मंत्रालय, भारत सरकार**

---

## 1. Executive Summary

**TribeXcel** is the production-grade digital platform developed for the **Ministry of Tribal Affairs (MoTA)**, Government of India. The platform oversees the complete scholarship and fellowship lifecycle for Scheduled Tribe (ST) scholars across India and abroad:

```
Registration 
  → Verhoeff Aadhaar e-KYC 
  → Scheme Discovery & Rules Engine 
  → DigiLocker / API Setu Retrieval 
  → Multi-Stage Document OCR & Quality Intelligence 
  → Deterministic Eligibility Evaluation 
  → Ministry Officer Scrutiny & Deficiency Lifecycle 
  → Automated DBT-Ready Merit Ranking
```

---

## 2. Official MoTA Scheme Spectrum

TribeXcel implements the authoritative Ministry policy framework covering **5 schemes** under two operational tracks:

### Direct Application Track (Managed natively on TribeXcel)
1. **NFST — National Fellowship for ST Students (M.Phil / Ph.D)**
   - **Type:** Central Sector Scheme
   - **Annual Slots:** 750 (462 General ST, 225 Female ST horizontal, 38 Divyangjan, 25 PVTG)
   - **Benefits:** JRF ₹37,000/month; SRF ₹42,000/month; Contingency up to ₹25,000/year; HRA (8%/16%/27%); Escort allowance ₹2,000/month
   - **Rules:** Minimum 55% in Master's; maximum age 36 years; **STRICTLY NO INCOME LIMIT**.
2. **NOS — National Overseas Scholarship for ST Students**
   - **Type:** Central Sector Scheme
   - **Annual Slots:** 20 (17 General ST, 3 PVTG)
   - **Benefits:** Maintenance allowance (USD 15,400 / GBP 9,900/year); actual tuition fees; contingency USD 1,500/year; return airfare
   - **Rules:** Top 1000 QS World University Rankings; family income ceiling ₹6,00,000/year (orphans exempt); max 2 children per family.

### External Federated Track (Official Advisory & Federated Routing)
3. **Top Class Education for ST Students** — 1000 slots in 250+ premier institutions (IITs, IIMs, NITs, AIIMS). Redirection to [scholarships.gov.in](https://scholarships.gov.in).
4. **Post-Matric Scholarship for ST Students** — Centrally Sponsored entitlement scheme (Class XI through PG). Redirection to State Portals and NSP.
5. **Pre-Matric Scholarship for ST Students** — Centrally Sponsored scheme for Classes IX and X. Redirection to State Portals and NSP.

---

## 3. Monorepo Architecture

```
TribeXcel/
├── apps/
│   ├── student-portal/         # React + Vite Student Web App (Port 5174)
│   └── admin-portal/           # React + Vite Ministry Scrutiny Portal (Port 5173)
├── services/
│   ├── api-server/             # Node.js + Express + Mongoose REST API (Port 5000)
│   └── ai-engine/              # Python FastAPI OCR & Verification Engine (Port 8000)
├── packages/
│   └── scheme-config/          # Shared Canonical Scheme Definitions & Rules
├── docs/                       # Architecture, Security, Schemes, and API Documentation
│   ├── ARCHITECTURE.md
│   ├── SCHEMES.md
│   └── SECURITY.md
├── scripts/                    # Database seeding and deployment utilities
├── start-all.ps1               # 1-Click PowerShell Service Orchestrator
├── start-all.bat               # 1-Click Windows Command Prompt Orchestrator
└── seed-all.bat                # 1-Click Database Seeding Script
```

---

## 4. Key Security & Compliance Guarantees

1. **Aadhaar e-KYC (Verhoeff & Masked Storage):**
   - Aadhaar numbers are verified via the Verhoeff checksum algorithm.
   - Raw 12-digit Aadhaar numbers are **never stored** in the database. Only `aadhaarLast4` (`XXXX-XXXX-1234`) and a salted one-way hash are retained.
2. **Server-Authoritative Document Model:**
   - The frontend cannot bypass document verification by sending synthetic flags.
   - Document state is governed by the MongoDB `Document` collection. Manual uploads enter `PENDING` state and require nodal officer scrutiny.
   - Real DigiLocker / API Setu integration verifies document signatures at source.
3. **Immutable Snapshot Versioning:**
   - Each submitted application creates an immutable snapshot (`v1`, `v2`, etc.).
   - Corrected resubmissions increment version numbers and retain audit history.
4. **Institutional e-Governance Design:**
   - Adheres strictly to Government of India (GoI) Guidelines for Indian Government Websites (GIGW 3.0).
   - Deep navy (`#1a3557`), saffron/ochre accents, accessible contrast ratios, bilingual (Hindi/English), screen-reader friendly typography.

---

## 5. Quick Start & Setup

### Prerequisites
- **Node.js** >= 18.0.0
- **Python** >= 3.10
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### 1. Install Dependencies
```bash
# Install root workspaces dependencies
npm install

# Install Python AI Engine requirements
cd services/ai-engine
pip install -r requirements.txt
cd ../..
```

### 2. Seed Database
```bash
# Seed default scrutiny officer and sample applications
npm run seed:admin
npm run seed:applications

# Or use the convenient batch script:
seed-all.bat
```

### 3. Launch All Services
```bash
# Windows PowerShell:
.\start-all.ps1

# Or Windows Command Prompt:
start-all.bat
```

---

## 6. Port Allocations & Default Credentials

| Service | Port | Local URL | Documentation / Health |
| :--- | :--- | :--- | :--- |
| **AI Verification Engine** | `8000` | http://localhost:8000 | http://localhost:8000/docs |
| **Central API Server** | `5000` | http://localhost:5000 | http://localhost:5000/api/health |
| **Student Web Portal** | `5174` | http://localhost:5174 | Portal for applicants |
| **Ministry Admin Portal**| `5173` | http://localhost:5173 | Portal for scrutiny officers |

### Default Credentials
- **Ministry Verification Officer (Admin):**
  - **Email:** `admin@mota.gov.in`
  - **Password:** `Admin@123`
  - **Role:** Verification Officer / Scrutiny Cell
- **Student Beneficiary Account:**
  - Self-register at `http://localhost:5174/signup` or login with seeded demo accounts.

---

## 7. Verification & Build Commands

```bash
# Build Student Portal
npm run build:student

# Build Admin Portal
npm run build:admin

# Build All Portals
npm run build:all

# Syntax Check Node Backend
node -c services/api-server/server.js

# Compile Python AI Engine
python -m py_compile services/ai-engine/app/main.py
```

---

## 8. License & Ministry Attribution
Developed for the **Ministry of Tribal Affairs (MoTA), Government of India**.  
Strictly for official government scholarship administration and public digital welfare.
