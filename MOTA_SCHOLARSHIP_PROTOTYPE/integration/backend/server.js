import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import healthRoutes from './routes/health.routes.js';
import processRoutes from './routes/process.routes.js';
import demoRoutes from './routes/demo.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// API routes
app.use('/api', healthRoutes);
app.use('/api', processRoutes);
app.use('/api', demoRoutes);

// Serve frontend build if exists
const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.resolve(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Integration Server Error]:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An error occurred in the Integration Layer'
  });
});

const server = app.listen(config.port, () => {
  console.log('================================================================');
  console.log(' MINISTRY OF TRIBAL AFFAIRS (MoTA) - SCHOLARSHIP PROTOTYPE');
  console.log(' INTEGRATION LAYER: SYSTEM A (DOCUMENT AI) + SYSTEM B (VERIFICATION)');
  console.log('================================================================');
  console.log(` Integration API : http://localhost:${config.port}/api`);
  console.log(` Health Check    : http://localhost:${config.port}/api/health`);
  console.log(` System A Target : ${config.systemAUrl}`);
  console.log(` System B Target : ${config.systemBUrl}`);
  console.log('----------------------------------------------------------------');
  console.log(' Endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/process-application (multipart/form-data)');
  console.log('   GET  /api/demo-application');
  console.log('   POST /api/demo-application    ({"scenario": "eligible|ineligible|human_review"})');
  console.log('================================================================');
});

export default app;
