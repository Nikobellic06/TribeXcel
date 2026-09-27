import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import healthRoutes from './routes/health.routes.js';
import documentRoutes from './routes/document.routes.js';
import demoRoutes from './routes/demo.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve developer test dashboard from public/
app.use(express.static(path.resolve(__dirname, '../public')));

// API Routes
app.use('/api', healthRoutes);
app.use('/api', documentRoutes);
app.use('/api', demoRoutes);

// Root route redirect/fallback to dashboard if accessed via browser
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API Endpoint Not Found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Engine Unhandled Error]:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred in the Document Intelligence Engine'
  });
});

const server = app.listen(config.port, () => {
  console.log('================================================================');
  console.log(' MINISTRY OF TRIBAL AFFAIRS (MoTA) - SCHOLARSHIP PROTOTYPE');
  console.log(' SYSTEM A: DOCUMENT INTELLIGENCE ENGINE');
  console.log('================================================================');
  console.log(` Server running on: http://localhost:${config.port}`);
  console.log(` Test Dashboard:    http://localhost:${config.port}/`);
  console.log(` Health Check:      http://localhost:${config.port}/api/health`);
  console.log(` Gemini API Key:    ${config.geminiApiKey ? 'Configured [Live AI active]' : 'NOT CONFIGURED [Running in intelligent simulation mode]'}`);
  console.log(` Model Target:      ${config.geminiModel}`);
  console.log('----------------------------------------------------------------');
  console.log(' Available REST Endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/analyze-documents   (multipart/form-data)');
  console.log('   POST /api/analyze-document    (multipart/form-data)');
  console.log('   GET  /api/demo-application    (?scenario=clean|missing|inconsistent)');
  console.log('   POST /api/demo-application    ({"scenario": "..."})');
  console.log('================================================================');
});

export default app;
