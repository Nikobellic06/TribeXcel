import { config } from '../config.js';
import { analyzeDocumentWithGemini, sanitizeExtractionResult } from './gemini.service.js';

/**
 * Intelligent Local Simulation when GEMINI_API_KEY is not set or network is unavailable
 */
export function simulateDocumentAnalysis(originalName, mimeType) {
  const lower = originalName.toLowerCase();
  
  let documentType = 'UNKNOWN';
  let confidence = 0.85;
  let quality = 'GOOD';
  let qualityScore = 0.94;
  let fields = {};
  let missingFields = [];
  let issues = [];

  if (lower.includes('aadhaar') || lower.includes('aadhar') || lower.includes('uid')) {
    documentType = 'AADHAAR';
    confidence = 0.98;
    fields = {
      fullName: 'Sunita Soren',
      dateOfBirth: '2004-05-14',
      gender: 'Female',
      fatherName: 'Mangal Soren',
      motherName: 'Marangmai Soren',
      address: 'Vill - Haripur, PO - Dumka, Dist - Dumka, Jharkhand - 814101',
      state: 'Jharkhand',
      district: 'Dumka',
      domicileState: 'Jharkhand'
    };
  } else if (lower.includes('st_cert') || lower.includes('caste') || lower.includes('tribe')) {
    documentType = 'ST_CERTIFICATE';
    confidence = 0.96;
    fields = {
      fullName: 'Sunita Soren',
      fatherName: 'Mangal Soren',
      category: 'ST',
      tribeName: 'Santhal',
      certificateNumber: 'JH/ST/2021/88921',
      issuingAuthority: 'Sub-Divisional Officer, Dumka',
      issueDate: '2021-08-12',
      state: 'Jharkhand',
      district: 'Dumka'
    };
  } else if (lower.includes('pvtg')) {
    documentType = 'PVTG_CERTIFICATE';
    confidence = 0.97;
    fields = {
      fullName: 'Ramesh Birhor',
      fatherName: 'Somra Birhor',
      category: 'PVTG',
      tribeName: 'Birhor',
      certificateNumber: 'CG/PVTG/2020/112',
      issuingAuthority: 'Collector & District Magistrate, Korba',
      issueDate: '2020-11-15',
      state: 'Chhattisgarh'
    };
  } else if (lower.includes('income')) {
    documentType = 'INCOME_CERTIFICATE';
    confidence = 0.95;
    fields = {
      fullName: 'Sunita Soren',
      fatherName: 'Mangal Soren',
      annualIncome: '120000',
      incomeCertificateNumber: 'INC/JHK/2023/45120',
      incomeCertificateDate: '2023-04-20',
      issuingAuthority: 'Circle Officer, Dumka',
      state: 'Jharkhand'
    };
  } else if (lower.includes('mark') || lower.includes('10th') || lower.includes('12th') || lower.includes('hsc')) {
    documentType = 'MARKSHEET';
    confidence = 0.95;
    fields = {
      fullName: 'Sunita Soren',
      board: 'Jharkhand Academic Council (JAC)',
      course: 'Higher Secondary (Science)',
      class: '12th Standard',
      year: '2022',
      marks: '435/500',
      percentage: '87.0%',
      qualification: 'Higher Secondary (Class XII)',
      institution: "St. Xavier's Inter College, Ranchi"
    };
  } else if (lower.includes('degree') || lower.includes('diploma') || lower.includes('grad')) {
    documentType = 'DEGREE_CERTIFICATE';
    confidence = 0.94;
    fields = {
      fullName: 'Sunita Soren',
      institution: 'Ranchi University',
      course: 'Bachelor of Science (B.Sc)',
      year: '2025',
      qualification: 'Bachelor Degree'
    };
  } else if (lower.includes('admission') || lower.includes('allotment') || lower.includes('josaa')) {
    documentType = 'ADMISSION_LETTER';
    confidence = 0.96;
    fields = {
      fullName: 'Sunita Soren',
      institution: 'National Institute of Technology (NIT) Jamshedpur',
      course: 'B.Tech Computer Science and Engineering',
      programme: 'Undergraduate Degree',
      admissionYear: '2023',
      country: 'India',
      offerDate: '2023-07-28'
    };
  } else if (lower.includes('offer')) {
    documentType = 'OFFER_LETTER';
    confidence = 0.94;
    fields = {
      fullName: 'Sunita Soren',
      institution: 'National Institute of Technology (NIT) Jamshedpur',
      course: 'B.Tech Computer Science',
      offerDate: '2023-07-25'
    };
  } else if (lower.includes('passbook') || lower.includes('bank') || lower.includes('sbi')) {
    documentType = 'BANK_PASSBOOK';
    confidence = 0.93;
    fields = {
      accountHolderName: 'Sunita Soren',
      bankName: 'State Bank of India',
      accountNumberMasked: 'XXXXXX5621',
      ifsc: 'SBIN0000214'
    };
  } else if (lower.includes('domicile') || lower.includes('residence')) {
    documentType = 'DOMICILE_CERTIFICATE';
    confidence = 0.95;
    fields = {
      fullName: 'Sunita Soren',
      domicileState: 'Jharkhand',
      state: 'Jharkhand',
      district: 'Dumka',
      certificateNumber: 'DOM/JH/2021/771'
    };
  } else if (lower.includes('bonafide')) {
    documentType = 'BONAFIDE_CERTIFICATE';
    confidence = 0.94;
    fields = {
      fullName: 'Sunita Soren',
      institution: 'National Institute of Technology (NIT) Jamshedpur',
      course: 'B.Tech',
      class: '1st Year'
    };
  } else if (lower.includes('disability') || lower.includes('pwd')) {
    documentType = 'DISABILITY_CERTIFICATE';
    confidence = 0.92;
    fields = {
      fullName: 'Sunita Soren',
      disabilityType: 'Locomotor',
      percentage: '40%'
    };
  } else if (lower.includes('fee') || lower.includes('receipt')) {
    documentType = 'FEE_RECEIPT';
    confidence = 0.92;
    fields = {
      fullName: 'Sunita Soren',
      institution: 'NIT Jamshedpur',
      amount: '62500'
    };
  } else {
    documentType = 'OTHER';
    confidence = 0.65;
    quality = 'WARNING';
    qualityScore = 0.70;
    fields = {
      fullName: null,
      notes: 'General supporting document'
    };
    issues = ['Document type could not be confidently identified as standard MoTA category'];
  }

  // Detect quality warning if filename mentions blur or poor
  if (lower.includes('blur') || lower.includes('poor') || lower.includes('bad')) {
    quality = 'POOR';
    qualityScore = 0.45;
    issues.push('Scan has high blur and low optical clarity');
  } else if (lower.includes('warning') || lower.includes('lowres') || lower.includes('scan')) {
    quality = 'WARNING';
    qualityScore = 0.72;
    issues.push('Scan resolution is below recommended 300 DPI');
  }

  return {
    documentType,
    confidence,
    filename: originalName,
    quality,
    qualityScore,
    fields,
    missingFields,
    issues,
    _engine: 'local-heuristic'
  };
}

/**
 * Process a single document through Gemini or fallback
 */
export async function parseDocument(file) {
  const filePath = file.path;
  const mimeType = file.mimetype;
  const originalName = file.originalname;

  if (config.geminiApiKey) {
    try {
      console.log(`[Document Intelligence] Calling Gemini API for ${originalName} (${mimeType})...`);
      const result = await analyzeDocumentWithGemini(filePath, mimeType, originalName);
      result._engine = 'gemini-vision-ai';
      return result;
    } catch (err) {
      console.warn(`[Document Intelligence] Gemini processing failed for ${originalName}: ${err.message}. Using fallback engine.`);
      const simulated = simulateDocumentAnalysis(originalName, mimeType);
      simulated._fallbackReason = err.message;
      return simulated;
    }
  } else {
    console.log(`[Document Intelligence] GEMINI_API_KEY not configured. Using local intelligence engine for ${originalName}.`);
    return simulateDocumentAnalysis(originalName, mimeType);
  }
}
