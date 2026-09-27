import { v4 as uuidv4 } from 'uuid';
import { parseDocument } from './documentParser.service.js';
import { generateApplicantProfile } from './profile.service.js';
import { performCrossDocumentValidation } from './validation.service.js';
import { detectAnomalies } from './anomaly.service.js';
import { cleanupFile } from '../utils/fileUtils.js';

/**
 * Orchestrate complete Document Intelligence Pipeline
 * 
 * Step 1: Upload (files handled by Multer)
 * Step 2: Document Type Detection (per file)
 * Step 3: Document Quality Analysis (per file)
 * Step 4: Text / Field Extraction (per file)
 * Step 5: Structured Data Generation (Applicant Profile)
 * Step 6: Cross-Document Validation (9 key fields)
 * Step 7: Light Anomaly Detection (LOW / MEDIUM / HIGH with signals)
 * Step 8: Structured JSON Response
 */
export async function runDocumentIntelligencePipeline(files = [], options = {}) {
  const applicationId = options.applicationId || `APP-MOTA-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
  const keepFiles = options.keepFiles || false;

  const processedDocuments = [];

  // If already parsed documents passed in (e.g. from demo scenarios)
  if (options.preParsedDocuments && Array.isArray(options.preParsedDocuments)) {
    for (const doc of options.preParsedDocuments) {
      processedDocuments.push(doc);
    }
  } else {
    // Process each uploaded physical file
    for (const file of files) {
      try {
        const parsed = await parseDocument(file);
        processedDocuments.push(parsed);
      } catch (err) {
        console.error(`Error processing file ${file.originalname}:`, err);
        processedDocuments.push({
          documentType: 'UNKNOWN',
          confidence: 0,
          filename: file.originalname,
          quality: 'POOR',
          qualityScore: 0.1,
          fields: {},
          missingFields: [],
          issues: [`Processing error: ${err.message}`]
        });
      } finally {
        if (!keepFiles && file.path) {
          cleanupFile(file.path);
        }
      }
    }
  }

  // Step 5: Structured Data Generation
  const applicantProfile = generateApplicantProfile(processedDocuments);

  // Step 6: Cross-Document Validation
  const crossDocumentValidation = performCrossDocumentValidation(processedDocuments);

  // Step 7: Light Anomaly Detection
  const { anomalies, reviewFlags } = detectAnomalies(processedDocuments, crossDocumentValidation);

  // Step 8: Structured JSON Response
  return {
    applicationId,
    timestamp: new Date().toISOString(),
    documentsCount: processedDocuments.length,
    documents: processedDocuments,
    applicantProfile,
    crossDocumentValidation,
    anomalies,
    reviewFlags
  };
}
