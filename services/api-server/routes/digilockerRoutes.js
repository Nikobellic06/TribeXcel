const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/studentAuthMiddleware');
const { protectAny } = require('../middleware/authMiddleware');
const {
  getCatalogue,
  authorize,
  getSession,
  authenticateOtp,
  processConsent,
  getIssuedDocuments,
  retrieveDocuments,
  completeSession,
  cancelAuthorization,
  revokeAccess,
  getDeveloperScenarios,
  setDeveloperScenario,
} = require('../controllers/digilockerController');

const {
  getWalletOverview,
  getWalletDocuments,
  uploadDocument,
  getDocumentDetail,
  updateDocumentFields,
  markDocumentReady,
  streamDocumentFile,
  seedDemoDocuments,
  deleteDocument,
} = require('../controllers/digilockerWalletController');

// Public route to view DigiLocker catalogue & developer sandbox scenarios
router.get('/catalogue', getCatalogue);
router.get('/dev/scenarios', getDeveloperScenarios);
router.post('/dev/scenario', setDeveloperScenario);

// Streaming file preview: Accessible with student or officer token via header or ?token=
router.get('/wallet/documents/:id/file', protectAny, streamDocumentFile);

// All subsequent routes require student authentication
router.use(protectStudent);

// --- DIGILOCKER SANDBOX WALLET ENDPOINTS ---
router.get('/wallet/overview', getWalletOverview);
router.get('/wallet/documents', getWalletDocuments);
router.post('/wallet/upload', uploadDocument);
router.get('/wallet/documents/:id', getDocumentDetail);
router.patch('/wallet/documents/:id/fields', updateDocumentFields);
router.post('/wallet/documents/:id/verify', markDocumentReady);
router.post('/wallet/seed-demo', seedDemoDocuments);
router.delete('/wallet/documents/:id', deleteDocument);

// --- OAUTH-STYLE AUTHORIZATION & SESSION ENDPOINTS ---
router.post('/authorize', authorize);
router.get('/authorize', authorize);

// Session State Machine endpoints
router.get('/session/:id', getSession);
router.post('/session/:id/auth-otp', authenticateOtp);
router.post('/session/:id/consent', processConsent);
router.get('/session/:id/documents', getIssuedDocuments);
router.post('/session/:id/retrieve', retrieveDocuments);
router.post('/session/:id/complete', completeSession);
router.post('/session/:id/cancel', cancelAuthorization);

// Generic document & provider operations
router.get('/documents', getIssuedDocuments);
router.post('/documents/retrieve', retrieveDocuments);
router.post('/documents/:id/retrieve', retrieveDocuments);
router.post('/revoke', revokeAccess);

module.exports = router;
