import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config.js';
import { processApplication } from '../controllers/process.controller.js';

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${safeName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

const router = Router();

// Main and alias endpoints for application processing
router.post('/process-application', upload.any(), processApplication);
router.post('/application/process', upload.any(), processApplication);
router.post('/documents/upload', upload.any(), processApplication);
router.post('/analyze-documents', upload.any(), processApplication);

// GET /api/schemes
router.get('/schemes', (req, res) => {
  res.json({
    schemes: [
      {
        id: 'PRE_MATRIC',
        code: 'PM-ST',
        name: 'Pre-Matric Scholarship for ST Students',
        eligibleClasses: ['IX', 'X', 'Class IX', 'Class X'],
        incomeCeiling: 250000,
        requiredDocuments: ['ST Certificate', 'Income Certificate', 'School Enrollment / Admission Verification', 'Bank Account Passbook / Proof']
      },
      {
        id: 'NOS',
        code: 'NOS-ST',
        name: 'National Overseas Scholarship (NOS) for ST Candidates',
        supportedLevels: ['MASTERS', 'PHD', 'POST_DOCTORAL'],
        incomeCeiling: 600000,
        minQualifyingMarksPct: 55.0,
        requiredDocuments: ['ST / PVTG Certificate', 'Income Certificate', 'Qualifying Degree Marksheet / Certificate', 'Overseas University Offer / Admission Letter', 'Valid Passport / Proof of Age']
      },
      {
        id: 'NATIONAL_FELLOWSHIP',
        code: 'NFST',
        name: 'National Fellowship for Higher Education of ST Students',
        supportedProgrammes: ['M.PHIL', 'PHD', 'INTEGRATED_PHD'],
        incomeCeiling: null,
        minQualifyingMarksPct: 55.0,
        requiredDocuments: ['ST Certificate', 'Postgraduate Degree Marksheet / Certificate', 'Admission / Registration Letter in M.Phil / PhD', 'Eligible Institution Verification / Recommendation']
      }
    ]
  });
});

export default router;
