require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const studentApplicationRoutes = require('./routes/studentApplicationRoutes');
const studentPortalRoutes = require('./routes/studentPortalRoutes');
const { UPLOAD_ROOT } = require('./controllers/studentUploadController');
const { protectAny } = require('./middleware/authMiddleware');

connectDB();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.STUDENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. curl, test runners) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// SECURE CITIZEN DOCUMENT STREAMING: Public express.static eliminated.
// Enforces authentication and strict applicant ownership (anti-IDOR protection).
app.get('/uploads/:studentId/:filename', protectAny, (req, res) => {
  const { studentId, filename } = req.params;

  // Student check: Students can only view their own uploaded documents
  if (req.student && req.student._id.toString() !== studentId) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to access this document' });
  }

  // Admin/Reviewer check: Permitted
  if (!req.student && !req.admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const safeFilename = path.basename(filename);
  const filePath = path.join(UPLOAD_ROOT, studentId, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const ext = path.extname(safeFilename).toLowerCase();
  const mimeMap = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  const mime = mimeMap[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', mime);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'inline');
  fs.createReadStream(filePath).pipe(res);
});

const mongoose = require('mongoose');
const { SCHEME_RULES } = require('./config/schemeRules');
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/* Service Health Check — must be before protected route registration */
app.get(['/api/health', '/health'], async (req, res) => {
  let aiStatus = 'DOWN';
  try {
    const aiRes = await fetch(`${AI_ENGINE_URL}/health`, { signal: AbortSignal.timeout(2500) });
    if (aiRes.ok) aiStatus = 'UP';
  } catch (_) {}

  res.json({
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    aiEngine: aiStatus,
    timestamp: new Date().toISOString(),
  });
});

/* Schemes API — public, no auth required */
app.get('/api/schemes', (req, res) => {
  res.json(SCHEME_RULES);
});

/* AI Document Analysis Proxy — protected: requires valid student or admin credentials */
app.post(['/api/ai/analyze-document', '/api/analyze-document'], protectAny, async (req, res) => {
  try {
    const { data, fileName, docType, documentType, applicationId, documentId } = req.body || {};
    if (!data && !req.body.file) {
      return res.status(400).json({ success: false, message: 'File data is required' });
    }

    const base64Data = data ? data.replace(/^data:[^,]+,/, '') : '';
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: req.body.mimeType || 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, fileName || 'document.pdf');
    if (docType || documentType) formData.append('document_hint', docType || documentType);
    if (applicationId) formData.append('application_id', applicationId);
    if (documentId) formData.append('document_id', documentId);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    const aiRes = await fetch(`${AI_ENGINE_URL}/api/analyze-document`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!aiRes.ok) {
      return res.status(aiRes.status).json({
        success: false,
        status: 'AI_UNAVAILABLE',
        message: `AI engine returned status ${aiRes.status}`,
      });
    }
    const result = await aiRes.json();
    res.json(result);
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'AI_UNAVAILABLE',
      message: 'Document verification engine is temporarily unavailable. Manual officer review will be required.',
      error: err.message,
    });
  }
});

const digilockerRoutes = require('./routes/digilockerRoutes');

app.use('/api/admin', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/student', studentPortalRoutes);
app.use('/api/student', studentApplicationRoutes);
app.use('/api/student/digilocker', digilockerRoutes);
app.use('/api/digilocker', digilockerRoutes);
app.use('/api/digilocker-sandbox', digilockerRoutes);
app.use('/api', applicationRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'TribeXcel scholarship API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
