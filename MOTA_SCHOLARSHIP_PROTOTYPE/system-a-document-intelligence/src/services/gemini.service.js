import { config } from '../config.js';
import { fileToGenerativePart } from '../utils/fileUtils.js';

let GoogleGenerativeAI;
try {
  const genaiModule = await import('@google/generative-ai');
  GoogleGenerativeAI = genaiModule.GoogleGenerativeAI;
} catch (err) {
  console.warn('[Gemini Service] @google/generative-ai import warning:', err.message);
}

const EXTRACTION_SYSTEM_PROMPT = `
You are the Document Intelligence Engine for the Ministry of Tribal Affairs (MoTA), Government of India.
Your mission is to perform strict, objective document verification and structured field extraction from scholarship application documents.

CRITICAL INSTRUCTIONS:
1. DOCUMENT TYPE DETECTION:
Identify the document type strictly as one of these:
- ST_CERTIFICATE
- PVTG_CERTIFICATE
- INCOME_CERTIFICATE
- DOMICILE_CERTIFICATE
- AADHAAR
- MARKSHEET
- DEGREE_CERTIFICATE
- ADMISSION_LETTER
- OFFER_LETTER
- BANK_PASSBOOK
- DISABILITY_CERTIFICATE
- BONAFIDE_CERTIFICATE
- FEE_RECEIPT
- OTHER
- UNKNOWN

Provide confidence between 0.0 and 1.0.

2. DOCUMENT QUALITY ANALYSIS:
Classify document quality strictly as:
- GOOD (readable, clear, high fidelity)
- WARNING (readable with minor blur, slight skew, partial shadows, low res)
- POOR (blurry, partially unreadable text, severe cropping, heavy obstruction)

Provide qualityScore between 0.0 and 1.0.
List specific issues if any (e.g., "blur on seal", "low resolution", "partially cropped signature").
IMPORTANT: POOR QUALITY DOES NOT MEAN FRAUD. Never label a document or applicant as fraudulent.

3. TEXT & FIELD EXTRACTION:
Extract ONLY information actually present and legible in the document.
DO NOT hallucinate, infer, or invent missing values.
If any field is not explicitly present or unreadable, set its value strictly to null.

Fields to extract (include only those relevant, set others to null):
- Identity:
  - fullName: string or null
  - dateOfBirth: string (YYYY-MM-DD or as present) or null
  - gender: "Male" | "Female" | "Transgender" | null
  - fatherName: string or null
  - motherName: string or null
- Category:
  - category: "ST" | "PVTG" | "SC" | "OBC" | "GEN" | null
  - tribeName: string or null (e.g. Santhal, Gond, Bhil, Birhor, Oraon, etc.)
  - certificateNumber: string or null
  - issuingAuthority: string or null
  - issueDate: string or null
- Address:
  - address: string or null
  - state: string or null
  - district: string or null
  - domicileState: string or null
- Education:
  - institution: string or null
  - board: string or null
  - course: string or null
  - class: string or null
  - year: string or null
  - marks: string or null
  - percentage: string or null
  - qualification: string or null
- Financial:
  - annualIncome: string or null (numbers as string)
  - incomeCertificateNumber: string or null
  - incomeCertificateDate: string or null
- Bank:
  - accountHolderName: string or null
  - bankName: string or null
  - accountNumberMasked: string or null (e.g. XXXXXX1234)
  - ifsc: string or null
- Admission:
  - institution: string or null
  - course: string or null
  - programme: string or null
  - admissionYear: string or null
  - country: string or null
  - offerDate: string or null

4. RESPONSE FORMAT:
You MUST respond with valid JSON ONLY matching this schema:
{
  "documentType": "...",
  "confidence": 0.95,
  "quality": "GOOD",
  "qualityScore": 0.94,
  "fields": {
    "fullName": "...",
    "dateOfBirth": "...",
    ...
  },
  "missingFields": ["field1", "field2"],
  "issues": ["issue 1", "issue 2"]
}
`;

/**
 * Call Gemini API with an uploaded file
 */
export async function analyzeDocumentWithGemini(filePath, mimeType, originalName) {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  if (!GoogleGenerativeAI) {
    throw new Error('Google Generative AI SDK is not available.');
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);

  // Candidate models in order of preference
  const candidateModels = [
    config.geminiModel,
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ];

  const generativePart = fileToGenerativePart(filePath, mimeType);
  let lastError = null;

  for (const modelName of [...new Set(candidateModels)]) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const prompt = `${EXTRACTION_SYSTEM_PROMPT}\n\nDocument filename: ${originalName}\nPlease analyze this document.`;
      const result = await model.generateContent([prompt, generativePart]);
      const response = await result.response;
      const text = response.text();

      const parsed = JSON.parse(text);
      return sanitizeExtractionResult(parsed, originalName);
    } catch (err) {
      console.warn(`[Gemini Service] Model ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to analyze document with Gemini API.');
}

/**
 * Sanitize and validate JSON structure returned by Gemini
 */
export function sanitizeExtractionResult(parsed, filename) {
  const validTypes = config.documentTypes;
  let docType = (parsed.documentType || 'UNKNOWN').toUpperCase().trim();
  if (!validTypes.includes(docType)) {
    docType = 'UNKNOWN';
  }

  let quality = (parsed.quality || 'WARNING').toUpperCase().trim();
  if (!['GOOD', 'WARNING', 'POOR'].includes(quality)) {
    quality = 'WARNING';
  }

  const confidence = typeof parsed.confidence === 'number' 
    ? Math.max(0, Math.min(1, parsed.confidence)) 
    : 0.75;

  const qualityScore = typeof parsed.qualityScore === 'number'
    ? Math.max(0, Math.min(1, parsed.qualityScore))
    : (quality === 'GOOD' ? 0.92 : quality === 'WARNING' ? 0.70 : 0.45);

  const rawFields = parsed.fields && typeof parsed.fields === 'object' ? parsed.fields : {};
  const cleanedFields = {};

  for (const [k, v] of Object.entries(rawFields)) {
    if (v === null || v === undefined || v === '' || String(v).toLowerCase() === 'null') {
      cleanedFields[k] = null;
    } else {
      cleanedFields[k] = String(v).trim();
    }
  }

  const missingFields = Array.isArray(parsed.missingFields) ? parsed.missingFields : [];
  const issues = Array.isArray(parsed.issues) ? parsed.issues : [];

  return {
    documentType: docType,
    confidence: Number(confidence.toFixed(2)),
    filename: filename,
    quality: quality,
    qualityScore: Number(qualityScore.toFixed(2)),
    fields: cleanedFields,
    missingFields: missingFields,
    issues: issues
  };
}
