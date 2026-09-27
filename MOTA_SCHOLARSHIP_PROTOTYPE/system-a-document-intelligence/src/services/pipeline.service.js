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
 * Step 2: Document Type Detection (per file - Concurrent Parallel Ingestion)
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
    const batchStart = Date.now();
    console.log(`\n======================================================================`);
    console.log(`🚀 [PIPELINE] BATCH INGESTION: ${files.length} DOCUMENT(S) RECEIVED`);
    console.log(`⚡ Processing ${files.length} file(s) concurrently in parallel pool...`);
    console.log(`======================================================================`);

    // CONCURRENT PARALLEL INGESTION (All files processed simultaneously)
    const parsedResults = await Promise.all(
      files.map(async (file, idx) => {
        const fileStart = Date.now();
        const sizeStr = file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'unknown size';
        console.log(`   [Worker ${idx + 1}/${files.length}] ⏳ Started: "${file.originalname}" (${sizeStr})`);

        try {
          const parsed = await parseDocument(file);
          const elapsed = Date.now() - fileStart;
          console.log(`   [Worker ${idx + 1}/${files.length}] ✅ Finished: "${file.originalname}" in ${elapsed}ms -> [${parsed.documentType}] (${(parsed.confidence * 100).toFixed(0)}%)`);
          return parsed;
        } catch (err) {
          console.error(`   [Worker ${idx + 1}/${files.length}] ❌ Error: "${file.originalname}": ${err.message}`);
          return {
            documentType: 'UNKNOWN',
            confidence: 0,
            filename: file.originalname,
            quality: 'POOR',
            qualityScore: 0.1,
            fields: {},
            missingFields: [],
            issues: [`Processing error: ${err.message}`]
          };
        } finally {
          if (!keepFiles && file.path) {
            cleanupFile(file.path);
          }
        }
      })
    );

    processedDocuments.push(...parsedResults);
    const totalElapsed = Date.now() - batchStart;
    console.log(`\n🏁 [PIPELINE] Completed batch of ${files.length} document(s) in ${totalElapsed}ms total!`);
  }

  // Step 5: Structured Data Generation
  const applicantProfile = generateApplicantProfile(processedDocuments);

  // Step 6: Cross-Document Validation
  const crossDocumentValidation = performCrossDocumentValidation(processedDocuments);

  // Step 7: Light Anomaly Detection
  const { anomalies, reviewFlags } = detectAnomalies(processedDocuments, crossDocumentValidation);

  console.log(`\n======================================================================`);
  console.log(`📊 [PIPELINE SUMMARY] Application ID: ${applicationId}`);
  console.log(`   👤 Applicant:       ${applicantProfile.applicant.fullName || '[Unresolved]'} (${applicantProfile.applicant.category || 'N/A'})`);
  console.log(`   📅 DOB:             ${applicantProfile.applicant.dateOfBirth || 'N/A'}`);
  console.log(`   💰 Income:          ${applicantProfile.financial.annualIncome ? `₹${applicantProfile.financial.annualIncome}` : 'N/A'}`);
  console.log(`   🏦 Bank:            ${applicantProfile.bank.bankName || 'N/A'} (A/C: ${applicantProfile.bank.accountNumberMasked || 'N/A'} | IFSC: ${applicantProfile.bank.ifsc || 'N/A'})`);
  console.log(`   🔗 Validations:     ${crossDocumentValidation.filter(v => v.status === 'MATCH').length} Matched, ${crossDocumentValidation.filter(v => v.status === 'MISMATCH').length} Mismatched`);
  console.log(`   🚨 Anomaly Level:   [${anomalies.level}] (${reviewFlags.length} review flags)`);
  if (anomalies.signals && anomalies.signals.length > 0) {
    console.log(`      Signals: ${anomalies.signals.join(' | ')}`);
  }
  console.log(`======================================================================\n`);

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
