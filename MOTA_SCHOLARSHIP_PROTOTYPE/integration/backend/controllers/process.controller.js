import fs from 'fs';
import { analyzeDocumentsWithSystemA } from '../services/systemAClient.js';
import { verifyWithSystemB } from '../services/systemBClient.js';
import { buildSystemBPayload, buildFinalResponse, normalizeScheme } from '../services/transformer.js';

function cleanupUploadedFiles(files = []) {
  for (const f of files) {
    try {
      if (f.path && fs.existsSync(f.path)) {
        fs.unlinkSync(f.path);
      }
    } catch (e) {
      // ignore unlink errors
    }
  }
}

/**
 * POST /api/process-application
 * End-to-end integration: System A (Document AI) -> System B (Verification) -> Final Response Contract
 */
export async function processApplication(req, res) {
  const files = req.files || [];
  const requestedScheme = req.body?.scheme || 'PRE_MATRIC';
  const applicationId = req.body?.applicationId || `MOTA-APP-${Date.now().toString().slice(-6)}`;

  if (!files || files.length === 0) {
    return res.status(400).json({
      error: 'No documents provided',
      message: 'Please attach at least one document (PDF, JPG, PNG) in the "documents" field.'
    });
  }

  let systemAData = null;
  let systemBData = null;

  try {
    // Step 1 & 2: Call System A for Document Intelligence
    try {
      systemAData = await analyzeDocumentsWithSystemA(files, applicationId);
    } catch (errA) {
      console.error('[Process Controller] System A Error:', errA.message);
      return res.status(503).json({
        error: 'Document Intelligence Failure',
        message: 'Document Intelligence Engine unavailable.',
        details: errA.message
      });
    }

    // Step 3 & 4: Transform System A output into System B payload
    const systemBPayload = buildSystemBPayload(systemAData, requestedScheme, {
      applicationId,
      fullName: req.body?.fullName,
      scheme: requestedScheme
    });

    // Step 5: Send structured data to System B for verification
    try {
      systemBData = await verifyWithSystemB(systemBPayload);
    } catch (errB) {
      console.error('[Process Controller] System B Error:', errB.message);
      return res.status(503).json({
        error: 'Verification Engine Failure',
        message: 'Verification Engine unavailable.',
        details: errB.message,
        documentIntelligence: systemAData
      });
    }

    // Step 6 & 7: Combine both responses into Final Contract
    const finalResponse = buildFinalResponse(systemAData, systemBData, requestedScheme);

    return res.status(200).json(finalResponse);
  } catch (err) {
    console.error('[Process Controller] Unexpected error:', err);
    return res.status(500).json({
      error: 'Processing Error',
      message: 'Failed to process scholarship application.',
      details: err.message
    });
  } finally {
    cleanupUploadedFiles(files);
  }
}
