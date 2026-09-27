import { parseDocument } from '../services/documentParser.service.js';
import { runDocumentIntelligencePipeline } from '../services/pipeline.service.js';
import { cleanupFile } from '../utils/fileUtils.js';

/**
 * POST /api/analyze-documents
 * Accepts multiple documents and processes them through the full pipeline
 */
export async function analyzeMultipleDocuments(req, res) {
  try {
    const files = req.files || [];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No documents uploaded',
        message: 'Please provide one or more documents in the "documents" or "files" multipart form field.'
      });
    }

    const applicationId = req.body.applicationId;
    const result = await runDocumentIntelligencePipeline(files, { applicationId });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[Document Controller] Error in analyzeMultipleDocuments:', err);
    return res.status(500).json({
      error: 'Document Analysis Failed',
      message: err.message
    });
  }
}

/**
 * POST /api/analyze-document
 * Analyzes a single uploaded document and returns structured field extraction & quality analysis
 */
export async function analyzeSingleDocument(req, res) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      error: 'No document uploaded',
      message: 'Please upload a single file in the "document" or "file" multipart form field.'
    });
  }

  try {
    const result = await parseDocument(file);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Document Controller] Error in analyzeSingleDocument:', err);
    return res.status(500).json({
      error: 'Document Processing Failed',
      message: err.message
    });
  } finally {
    if (file && file.path) {
      cleanupFile(file.path);
    }
  }
}
