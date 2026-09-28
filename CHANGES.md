# Student portal revamp — change log

Branch: `feature/student-portal-revamp`

> **Base commit note.** This work was built on `ba4429d` ("Merge pull request #2
> from Nikobellic06/krish"). `origin/main` was later force-pushed (now `db011e9`)
> and **no longer contains PR #2** — the landing page, `GovHeader`, `GovFooter`,
> `SchemeDetail` and the two minister photos. This zip includes all of those
> files (updated), so extracting it on the current `main` brings them back.
> Please confirm with the team that PR #2 was removed by accident before pushing.
> All components (student-web, ai-engine, scholarship-admin) are unified
> under a single repository structure.

This change turns `student-web` into a bilingual (English / Hindi) scholarship
portal for three Ministry of Tribal Affairs schemes — **Pre-Matric (Class IX–X)**,
**NFST (M.Phil / Ph.D)** and **NOS for ST (studies abroad)** — with a 6-step
application form, profile with Aadhaar e-KYC, DigiLocker document fetch, drafts,
tracking and resubmission. The shared backend (`scholarship-admin/backend`)
gets the matching APIs. No new npm packages were added anywhere.

---

## 1. How to apply this change (Windows, Git Bash)

```bash
cd TribeXcel
git checkout main && git pull
git checkout -b feature/student-portal-revamp

# Extract the zip over the repo folder (Explorer > Extract All > choose the
# TribeXcel folder > Replace files), then remove the files this change deletes:
git rm student-web/frontend/src/components/SiteHeader.jsx \
       student-web/frontend/src/components/SiteFooter.jsx \
       student-web/frontend/src/pages/ApplicationForm.jsx \
       student-web/frontend/src/pages/DocumentUpload.jsx

# Backend
cd scholarship-admin/backend
cp .env.example .env      # only if you do not already have a .env; then fill MONGO_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:5000

# Student portal (new terminal)
cd student-web/frontend
npm install
npm run dev               # http://localhost:5174

# Review, commit, push
git status
git add -A
git commit -m "Student portal: 3 schemes, 6-step bilingual form, profile e-KYC, DigiLocker, drafts, tracking"
git push -u origin feature/student-portal-revamp
```

Then open a pull request on GitHub.

---

## 2. Deleted files

| File | Replaced by |
|---|---|
| `student-web/frontend/src/components/SiteHeader.jsx` | `components/layout/PortalHeader.jsx` |
| `student-web/frontend/src/components/SiteFooter.jsx` | `components/GovFooter.jsx` (shared) |
| `student-web/frontend/src/pages/ApplicationForm.jsx` | `pages/apply/Apply.jsx` + `pages/apply/steps/*` |
| `student-web/frontend/src/pages/DocumentUpload.jsx` | `pages/apply/steps/DocumentsStep.jsx` |

---

## 3. student-web/frontend

### Added

| File | Purpose |
|---|---|
| `.env.example` | `VITE_API_URL` |
| `src/i18n/LanguageContext.jsx` | English/Hindi switch for the whole site (`t()`, `tx()`), remembered in `localStorage` (`portal_lang`) |
| `src/i18n/strings.js` | Shared bilingual strings |
| `src/config/schemes.js` | **Single source of truth** for the 3 schemes: rules, eligibility, benefits, slots, verification chain (from the MoTA guidelines) |
| `src/config/documents.js` | Document catalogue (DigiLocker vs manual, file types, size limits) and the per-scheme checklist |
| `src/config/options.js` | Dropdown options (states, boards, courses, NOS fields, countries…) |
| `src/config/steps.js` | The 6 steps / URL segments |
| `src/config/demo.js` | Demo OTP for Aadhaar e-KYC and DigiLocker |
| `src/api/student.js` | All student API calls |
| `src/utils/eligibility.js` | Live eligibility checks (age on 1 July, income, marks, QS rank, one-child rule…) |
| `src/utils/stepValidation.js` | Validation for each step |
| `src/utils/validation.js` | Field validators incl. Aadhaar Verhoeff checksum, IFSC, U-DISE |
| `src/utils/format.js` | Dates, ₹ amounts, masked account, file URLs |
| `src/utils/applicationPayload.js` | Builds the submit payload; rebuilds the form from a returned application |
| `src/utils/useTextSize.js` | A- / A / A+ text size (remembered) |
| `src/components/ui/*` | Field, Button, Alert, Modal, StatusBadge, PageLoader, PasswordInput |
| `src/components/layout/*` | UtilityBar, Emblem, PortalHeader, PortalNav, PortalLayout, AuthLayout |
| `src/components/apply/*` | ApplicationSidebar (status checklist), StepProgress, EligibilityPanel, DigiLockerModal, DocumentItem |
| `src/components/ApplicationTracker.jsx` | Submitted → verification → result tracker |
| `src/pages/apply/Apply.jsx` | The application wizard (load, draft save/autosave, step access, submit) |
| `src/pages/apply/steps/*` | Personal, Category & income, Academic (school / research / overseas), Bank, Documents, Review |
| `src/pages/Profile.jsx` | Profile + Aadhaar e-KYC |
| `src/pages/MyApplications.jsx` | All applications, officer remarks, correct & resubmit |
| `src/pages/Acknowledgement.jsx` | Printable acknowledgement (A4) |

### Restored from PR #2 (missing on the current `main`)

| File | Note |
|---|---|
| `public/minister_jual_oram.png`, `public/minister_durgadas_uikey.png` | Used by the landing page; unchanged from PR #2 |

### Modified

| File | Change |
|---|---|
| `index.html` | Noto Sans + Noto Sans Devanagari, meta description, theme colour |
| `vite.config.js` | Icons bundled into one chunk |
| `src/index.css` | Design tokens (`bg-navy`, `text-muted`, …), Warli motif band, tricolour strip, print styles, reduced motion |
| `src/main.jsx` | Wraps the app in `LanguageProvider` |
| `src/App.jsx` | All pages lazy-loaded; new routes (below) |
| `src/api/axios.js` | Exports `API_ORIGIN`, timeout, error helper |
| `src/context/AuthContext.jsx` | `updateStudent()`; logs out only on 401 (not when the server is offline) |
| `src/components/ProtectedRoute.jsx` | Returns to the requested page after login |
| `src/components/GovHeader.jsx` | Same look; uses the shared language/text size; shows Dashboard/Logout when logged in; scheme menu from config |
| `src/components/GovFooter.jsx` | Uses the shared language |
| `src/pages/Landing.jsx` | Uses the shared language; removed an unused scheme modal (it never opened and had wrong facts: NFST ₹6L income, NOS top-500 / age 35); headline now includes Pre-Matric; carousel arrows hidden on phones (they covered the text) |
| `src/pages/Login.jsx`, `Signup.jsx` | Bilingual, new layout, field-level errors, all 36 States/UTs |
| `src/pages/Dashboard.jsx` | Drafts to continue, applications with tracker, action-needed alerts, schemes, working FAQ |
| `src/pages/SchemeSelection.jsx` | Per-student state: start / continue draft / track / correct |
| `src/pages/SchemeDetail.jsx` | Built from `config/schemes.js`; Pre-Matric now open |

### Routes

| Path | Page | Login |
|---|---|---|
| `/` | Landing | no |
| `/schemes/:schemeId` | Scheme detail (`pre-matric`, `nfst`, `nos`) | no |
| `/login`, `/signup` | Auth | no |
| `/dashboard` | Dashboard | yes |
| `/profile` | Profile + e-KYC | yes |
| `/schemes` | Choose a scheme | yes |
| `/apply/:schemeId/:step` | Application (`personal`, `category`, `academic`, `bank`, `documents`, `review`) | yes |
| `/applications` | My applications | yes |
| `/applications/:id/acknowledgement` | Printable acknowledgement | yes |

---

## 4. scholarship-admin/backend

### Added

| File | Purpose |
|---|---|
| `.env.example` | The README already referred to it; it did not exist |
| `models/ApplicationDraft.js` | One draft per student per scheme — separate collection so drafts never appear in the admin queue |
| `controllers/studentProfileController.js` | Profile get/update, Aadhaar e-KYC (demo) |
| `controllers/studentDraftController.js` | Draft list/get/save/delete |
| `controllers/studentUploadController.js` | Document upload (base64 JSON, content checked by magic bytes, max 2 MB, random file names) |
| `routes/studentPortalRoutes.js` | Routes for the three controllers above |
| `utils/aadhaar.js` | Verhoeff checksum |

### Modified

| File | Change |
|---|---|
| `models/Student.js` | `fatherName`, `motherName`, `gender`, `altPhone`, `address`, `aadhaarLast4`, `aadhaarVerified`, `aadhaarVerifiedAt`; `toProfile()` safe output |
| `models/Application.js` | `scheme` enum adds `PRE_MATRIC`; `session` (default `2026-27`); `schemeData` (full form); `declaredIncome`, `declaredMarks`; document fields `docType`, `fileName`, `mimeType`, `size`, `digilockerUri`, `issuer`, `certificateNo` |
| `controllers/studentAuthController.js` | register / login / me return the full safe profile |
| `controllers/studentApplicationController.js` | Accepts `PRE_MATRIC`; new payload with `sections` (old flat payload still works — `scripts/test_full_system.js` unchanged); one application per scheme per session (409), only `Deficient` can be resubmitted; per-scheme rule checks when the AI engine is offline; draft deleted after submit; a student can only attach files from their own upload folder |
| `server.js` | Serves `/uploads`; mounts the new routes |
| `.gitignore` | Adds `uploads/` |

### New API (all need the student token)

| Method | Path | Body / notes |
|---|---|---|
| GET | `/api/student/profile` | |
| PUT | `/api/student/profile` | name, dob, gender (ignored after e-KYC), fatherName, motherName, phone, altPhone, state, address |
| POST | `/api/student/profile/aadhaar-kyc` | `{ aadhaarNumber, consent }` — stores last 4 digits only |
| GET | `/api/student/drafts` | list (no form data) |
| GET / PUT / DELETE | `/api/student/drafts/:scheme` | `PUT { data, currentStep, completedSteps }`; `409` once an application is under process |
| POST | `/api/student/uploads` | `{ fileName, mimeType, data (base64), docType }` → `{ fileUrl }` |
| POST | `/api/student/applications` | now also `session`, `sections`, `documents[].docType` etc. |

### New environment keys

| Key | Default | Meaning |
|---|---|---|
| `AI_ENGINE_SCHEMES` | `NFST,NOS` | Schemes sent to the AI engine; others (Pre-Matric) use the built-in rule checks |

---

## 5. scholarship-admin/frontend (minimal)

| File | Change |
|---|---|
| `src/pages/ReviewQueue.jsx` | Scheme filter adds Pre-Matric |
| `src/pages/Analytics.jsx` | Scheme filter adds Pre-Matric |
| `src/pages/ApplicationDetail.jsx` | "View" document link opens the file from the API server (it was relative to the admin site) |

---

## 6. Demo mode (clearly labelled "Demo" in the UI)

- **Aadhaar e-KYC** — Aadhaar number is checked with the Verhoeff checksum; OTP is `123456`. Production: call UIDAI e-KYC through a licensed AUA/KUA in `studentProfileController.verifyAadhaarKyc`.
- **DigiLocker** — sign-in OTP `123456`; documents are simulated with DigiLocker-style URIs (`in.gov.<issuer>-<DOCTYPE>-<serial>`). Production: replace `simulateFetch` in `components/apply/DigiLockerModal.jsx` with a backend call to the DigiLocker Pull/Issued Documents API (needs MeitY partner registration).
- **IFSC lookup** uses the public `ifsc.razorpay.com` directory; if it is unreachable the student types bank and branch.

---

## 7. Known limitations / for other owners

- The unified verification engine (`ai-engine/`) now fully implements official MoTA rules:
  - **Pre-Matric:** ₹2,50,000 income limit, Class IX-X, ST category.
  - **NFST:** No income ceiling, M.Phil/Ph.D, 55% PG marks, age <= 36.
  - **NOS:** ₹6,00,000 income ceiling, Master's/Ph.D abroad, 55% marks, QS Top 500.
  AI Engine seamlessly verifies documents and cross-checks entities against the application.
- **Uploads are public by URL** (random 24-hex-character names, no listing). Fine for the
  prototype; production should use private storage with signed URLs or an authenticated download route.
- Admin `ApplicationDetail` does not yet show the new `schemeData` sections (academic, bank, etc.).
- Merit list (`Merit.jsx`) is unchanged — Pre-Matric is an entitlement scheme without merit ranking.

---

## 8. Checks run

- `vite build` passes for student-web and admin frontend.
- student-web first load: **221 KB** main bundle (75 KB gzip) instead of one 345 KB bundle; every page loads on demand.
- Backend: `node --check` on all files; 40 API tests (in-memory, no MongoDB) — auth, profile, e-KYC, drafts, uploads, submit (new + old payload), duplicate block, resubmission, access control.
- 23 logic tests for eligibility, checklists, validation and payload.
- Browser run (Chromium, desktop + 390 px phone): sign up → profile → e-KYC → Pre-Matric all 6 steps with DigiLocker and uploads → submit → acknowledgement → officer returns it → correct & resubmit; autosave; Hindi mode. No console errors.
