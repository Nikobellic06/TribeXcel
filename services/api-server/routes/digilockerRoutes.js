const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/studentAuthMiddleware');
const {
  getCatalogue,
  getAuthorizationUrl,
  exchangeToken,
  getIssuedDocuments,
  pullDocument,
  getStudentDocuments,
} = require('../controllers/digilockerController');

// Public route to view DigiLocker catalogue
router.get('/digilocker/catalogue', getCatalogue);

// Protected routes requiring student authentication
router.use(protectStudent);
router.get('/digilocker/authorize', getAuthorizationUrl);
router.post('/digilocker/token', exchangeToken);
router.get('/digilocker/issued-documents', getIssuedDocuments);
router.post('/digilocker/pull-document', pullDocument);
router.get('/documents', getStudentDocuments);

module.exports = router;
