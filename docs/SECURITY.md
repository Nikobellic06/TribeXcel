# TribeXcel - Security Architecture & Compliance Guidelines

**Authority:** Ministry of Tribal Affairs (MoTA), Government of India  
**Standard:** Indian e-Governance Security Baseline, GIGW 3.0 & CERT-In Guidelines

---

## 1. Zero Trust Architecture & Client Anti-Bypass

### The Threat Model
In legacy scholarship prototypes, client-side code often computed eligibility flags or set `verified: true` attributes before transmitting payloads to the API.

### TribeXcel Enforcement
- **No Client-Side Authority:**
  - The client application (`apps/student-portal`) is strictly a presentation and input collection layer.
  - The backend (`services/api-server`) validates every submission against server-side rule engines and authoritative database state.
- **Document Ownership & State Integrity:**
  - When an application payload lists attached documents, the backend queries the MongoDB `Document` collection owned by the authenticated student.
  - A document only receives `verified: true` if its source is `digilocker` and it was fetched via verified OAuth 2.0 / API Setu tokens.
  - Manual file uploads are locked into `PENDING` status until scrutinized by an authorized verification officer.

---

## 2. Identity Verification & Aadhaar e-KYC Protection

1. **Verhoeff Checksum Validation:**
   - Prior to accepting an Aadhaar number, the backend validates the 12-digit number using the standard Verhoeff algorithm.
   - Any number failing the Verhoeff check is rejected immediately with an HTTP 400 Bad Request error.
2. **UIDAI Compliance & Masked Storage:**
   - In accordance with UIDAI regulations and the Aadhaar Act, raw 12-digit Aadhaar numbers are **NEVER** stored in the database.
   - Only the last 4 digits (`aadhaarLast4`, e.g. `1234`) and a secure one-way salted cryptographic hash (`aadhaarHash`) are persisted alongside the verification timestamp.
   - Profile payloads returned to clients expose only masked formats (`XXXX-XXXX-1234`).

---

## 3. Secure File Upload & Storage

1. **Magic-Byte MIME Verification:**
   - File extensions are ignored for validation.
   - The backend inspects the actual file buffer header (magic bytes) to ensure only valid signatures are accepted:
     - `application/pdf`: `%PDF-` (`25 50 44 46`)
     - `image/jpeg`: `FF D8 FF`
     - `image/png`: `89 50 4E 47 0D 0A 1A 0A`
2. **File Size Hard Limits:**
   - Strict 2MB ceiling enforced at both reverse proxy (NGINX/Vite) and backend Express middleware (`multer`).
3. **Unguessable Cryptographic Filenames:**
   - Uploaded files are renamed using `crypto.randomBytes(16).toString('hex')` plus verified extension.
   - Path traversal attempts (`../`, absolute paths, null bytes) are stripped.

---

## 4. DigiLocker / API Setu Sandbox & OAuth 2.0 Architecture

1. **Cryptographic CSRF Protection:**
   - Every DigiLocker authentication initiation generates a random cryptographic state token stored with short TTL in cache/session.
   - Callback endpoints verify the state token before initiating token exchange.
2. **Server-Side Token Exchange:**
   - DigiLocker `client_secret` is kept strictly on the backend server environment and never delivered to frontend bundles.
   - Access tokens are used exclusively in server-to-server communication to fetch document metadata and payloads.

---

## 5. Tamper-Evident Audit Logging

1. **Append-Only Event Store:**
   - The `AuditLog` collection maintains an append-only, immutable record of every user and officer action.
   - Entries cannot be updated or deleted through standard API endpoints.
2. **Audit Schema:**
   - `actor`: User ID, role (`student`, `admin`, `system`), IP address, User Agent.
   - `action`: Strict enum (`APPLICATION_SUBMISSION`, `DOCUMENT_VERIFIED`, `OFFICER_DECISION`, etc.).
   - `target`: Entity type (`Application`, `Document`, `Student`) and Entity ID.
   - `metadata`: Snapshot of modified fields, previous values, and remarks.
