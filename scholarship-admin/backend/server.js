require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const studentApplicationRoutes = require('./routes/studentApplicationRoutes');
const studentPortalRoutes = require('./routes/studentPortalRoutes');
const { UPLOAD_ROOT } = require('./controllers/studentUploadController');

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Documents uploaded from the student portal. File names are random and
// unguessable; see CHANGES.md before using this in production.
app.use(
  '/uploads',
  express.static(UPLOAD_ROOT, {
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
    },
  })
);

const mongoose = require('mongoose');
const { SCHEME_RULES } = require('./config/schemeRules');
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

app.use('/api/admin', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/student', studentPortalRoutes);
app.use('/api/student', studentApplicationRoutes);
app.use('/api', applicationRoutes);

/* Service Health Check (Part 50) */
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

/* Schemes API (Part 33) */
app.get('/api/schemes', (req, res) => {
  res.json(SCHEME_RULES);
});

/* AI Document Analysis Proxy Endpoint (Part 9 & Part 33) */
app.post(['/api/ai/analyze-document', '/api/analyze-document'], async (req, res) => {
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

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Scholarship admin API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
