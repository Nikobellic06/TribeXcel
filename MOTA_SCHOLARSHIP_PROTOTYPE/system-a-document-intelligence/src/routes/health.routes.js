import { Router } from 'express';
import { config } from '../config.js';

const router = Router();

router.get('/health', async (req, res) => {
  let ocrConnected = false;
  try {
    const ocrHealthRes = await fetch(`${config.ocrServiceUrl}/health`, { signal: AbortSignal.timeout(2000) });
    ocrConnected = ocrHealthRes.ok;
  } catch (e) {
    ocrConnected = false;
  }

  res.status(200).json({
    status: 'UP',
    service: 'System A - Document Intelligence Engine',
    version: '2.0.0',
    target: 'Ministry of Tribal Affairs (MoTA) Scholarship & Fellowship System',
    ocrEngine: 'PaddleOCR (PP-OCRv6) / PyMuPDF / OpenCV',
    ocrServiceConnected: ocrConnected,
    ocrServiceUrl: config.ocrServiceUrl,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: [
      'Real Document OCR (PaddleOCR PP-OCRv6 via RapidOCR)',
      'Digital & Scanned PDF Ingestion (PyMuPDF)',
      'Computer Vision Preprocessing (OpenCV CLAHE & Blur Detection)',
      'Deterministic Evidence-Based Classification (15 MoTA types)',
      'Document-Specific Schema Extraction with Per-Field Confidence',
      'Document Quality Analysis (GOOD / WARNING / POOR)',
      'Cross-Document Validation (9 verification attributes)',
      'Light Anomaly Detection & Verifier Advisory',
      'Multi-Format Ingestion (PDF, JPG, JPEG, PNG)',
      'Demo Mode (Clean, Missing Info, Inconsistent Scenarios)'
    ]
  });
});

export default router;
