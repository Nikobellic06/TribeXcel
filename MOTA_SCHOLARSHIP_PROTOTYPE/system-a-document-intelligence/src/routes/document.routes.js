import { Router } from 'express';
import { upload } from '../utils/fileUtils.js';
import { analyzeMultipleDocuments, analyzeSingleDocument } from '../controllers/document.controller.js';

const router = Router();

// Middleware to normalize single file upload from upload.any()
const handleSingleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error', message: err.message });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

// Middleware to normalize multiple file upload from upload.any()
const handleMultipleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error', message: err.message });
    }
    next();
  });
};

/**
 * POST /api/analyze-documents
 * Ingests multiple documents (PDF, JPG, JPEG, PNG)
 */
router.post('/analyze-documents', handleMultipleUpload, analyzeMultipleDocuments);

/**
 * POST /api/analyze-document
 * Ingests a single document
 */
router.post('/analyze-document', handleSingleUpload, analyzeSingleDocument);

export default router;
