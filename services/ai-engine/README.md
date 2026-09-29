# TribeXcel — AI Verification & Merit Engine (Section 8 — SIH26239)

This is the standalone **AI/ML Verification & Merit Scoring Microservice** for the **TribeXcel** digital scholarship and fellowship management platform (Ministry of Tribal Affairs, Government of India).

It implements the requirements detailed in **Section 8 ("Team Role — AI / ML Developer")** of the system architecture specification:
1. **8.1 OCR Pipeline**: Modular OCR engine supporting PyMuPDF (PDF text extraction), Tesseract, and Google Vision API with document parsing for Caste Certificates, Income Certificates, Marksheets, and Admission Letters.
2. **8.2 Eligibility Rule Engine**: Real-time evaluation of the 4 core scholarship criteria:
   - *Income within scheme limit* (NFST: <= Rs. 6.0L, NOS: <= Rs. 8.0L)
   - *Category matches ST records* (cross-referencing recognized tribal communities e.g. Santhal, Munda, Gond, Bhil, Oraon)
   - *Marks meet minimum cutoff* (NFST: >= 55%, NOS: >= 60%)
   - *All required documents present* (Caste, Income, Marksheet, Admission Letter)
3. **8.3 Merit Scoring Engine**: Calculates normalized 0-100 scores for:
   - `academic`: Normalized marksheet percentage/CGPA
   - `exam`: Qualifying entrance examination score
   - `socioEconomic`: Hardship scale calculated inversely from annual family income and affirmative priority regions
   - `interview`: Baseline interview score
4. **8.4 Synchronous Backend API Contract**: Single `POST /verify` endpoint returning the exact data shape needed by the Express backend and React Admin panel.
5. **8.5 Stretch Goals**:
   - Image sharpness & blur detection (OpenCV Laplacian variance)
   - Cross-field name mismatch & fraud flagging

---

## Folder Structure

```
ai-engine/
├── app/
│   ├── config.py              # Scheme rules, limits, tribal communities, weights
│   ├── main.py                # FastAPI app & endpoints (CORS enabled)
│   ├── models/
│   │   ├── request.py         # VerificationRequest, DocumentInput Pydantic models
│   │   └── response.py        # VerificationResponse, AiVerification, MeritScores models
│   ├── ocr/
│   │   ├── engine.py          # Multi-engine OCR coordinator (PyMuPDF, Vision, Tesseract)
│   │   └── parsers.py         # Regex & layout parsers for Caste, Income, Marksheet, Admission
│   ├── quality/
│   │   └── authenticity.py    # Image sharpness, blur score & tamper detection
│   └── rules/
│       ├── eligibility.py     # 4-check eligibility evaluator & status decider
│       └── merit.py           # Academic, exam & socio-economic merit formulas
├── sample_data/               # Realistic sample certificates & letters for testing
│   ├── sample_caste_cert.txt
│   ├── sample_income_cert.txt
│   ├── sample_marksheet.txt
│   └── sample_admission.txt
├── tests/
│   └── test_verification.py   # Automated test suite (Eligible, Deficient, Flagged, Over-income)
├── .env.example
├── requirements.txt
└── README.md
```

---

## Quickstart

### 1. Install Dependencies
```bash
cd ai-engine
pip install -r requirements.txt
```

### 2. Run Automated Verification Tests
```bash
python tests/test_verification.py
```
This runs 4 end-to-end verification cases:
- Case 1: Fully eligible ST applicant (Birsa Munda - NFST) -> `Status: Eligible`, `Score: 100/100`
- Case 2: Incomplete documentation -> `Status: Deficient`, `Score: 45/100`
- Case 3: Identity mismatch / fraud flag -> `Status: Flagged`
- Case 4: Income exceeds ceiling (Rs. 9.5L > Rs. 6.0L) -> `Status: Deficient`

### 3. Start the Microservice
```bash
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

## API Endpoints

### 1. `POST /verify` (Synchronous Backend Verification)
Accepts JSON payload from the main Node.js backend when a student submits an application:

**Request Body:**
```json
{
  "name": "Birsa Munda",
  "email": "birsa.munda@example.com",
  "phone": "9876543210",
  "dob": "2000-11-15",
  "category": "Scheduled Tribe",
  "state": "Jharkhand",
  "scheme": "NFST",
  "course": "Ph.D. in Development Studies",
  "institution": "IIT Bombay",
  "documents": [
    {
      "name": "Caste Certificate",
      "source": "manual",
      "raw_text": "GOVERNMENT OF JHARKHAND... belongs to the Munda Community... Scheduled Tribe"
    },
    {
      "name": "Income Certificate",
      "source": "manual",
      "raw_text": "Annual family income is Rs. 1,80,000 for FY 2024-25"
    },
    {
      "name": "Latest Marksheet",
      "source": "manual",
      "raw_text": "CGPA: 8.42 / 10, Equivalent Percentage Obtained: 79.99 %"
    },
    {
      "name": "Admission Letter",
      "source": "manual",
      "raw_text": "Selected for Admission to Full-Time Ph.D. program"
    }
  ]
}
```

**Response Body (Matches Admin UI & Mongo Model):**
```json
{
  "status": "Eligible",
  "aiVerification": {
    "checks": [
      {
        "label": "Income within scheme limit",
        "passed": true,
        "details": "Income of Rs. 180,000 is within the Rs. 600,000 limit."
      },
      {
        "label": "Category matches ST records",
        "passed": true,
        "details": "Verified Scheduled Tribe status from Caste Certificate (Tribe: Munda)."
      },
      {
        "label": "Marks meet minimum cutoff",
        "passed": true,
        "details": "Obtained 80.0% meets minimum cutoff of 55%."
      },
      {
        "label": "All required documents present",
        "passed": true,
        "details": "All 4 required documents attached."
      }
    ],
    "score": 100
  },
  "meritScores": {
    "academic": 80,
    "exam": 76,
    "socioEconomic": 88,
    "interview": 70
  },
  "recommendation_reason": "All eligibility criteria and required documents satisfied."
}
```

### 2. `POST /verify-files`
Multipart form-data endpoint where PDF/image files can be uploaded directly for verification.

### 3. `POST /ocr/extract`
Utility endpoint for testing OCR and entity parsing on a single uploaded file.

### 4. `GET /health` & `GET /schemes`
Returns service status, active scheme parameters, and OCR engine configurations.

---

## Future Integration with Node.js Backend

In `scholarship-admin/backend/controllers/studentApplicationController.js`, replace the `runMockVerification` function with:

```javascript
const axios = require('axios');

async function runAiVerification(applicationData) {
  try {
    const response = await axios.post('http://localhost:8000/verify', applicationData, { timeout: 8000 });
    return response.data;
  } catch (err) {
    console.error('AI microservice error, falling back to rule defaults:', err.message);
    return runMockVerification(applicationData.documents);
  }
}
```
