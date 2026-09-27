import { Router } from 'express';
import { config } from '../config.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'System A - Document Intelligence Engine',
    version: '1.0.0',
    target: 'Ministry of Tribal Affairs (MoTA) Scholarship & Fellowship System',
    geminiConfigured: Boolean(config.geminiApiKey),
    geminiModel: config.geminiModel,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: [
      'Document Type Detection (15 MoTA types)',
      'Document Quality Analysis (GOOD / WARNING / POOR)',
      'Field Extraction (Identity, Category, Address, Education, Financial, Bank, Admission)',
      'Normalized Applicant Profile Generation',
      'Cross-Document Validation (9 key verification attributes)',
      'Light Anomaly Detection (LOW / MEDIUM / HIGH signals)',
      'Multi-Format Ingestion (PDF, JPG, JPEG, PNG)',
      'Demo Mode (Clean, Missing Info, Inconsistent Scenarios)'
    ]
  });
});

export default router;
