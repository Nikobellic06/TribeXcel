const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/studentAuthMiddleware');
const {
  submitApplication,
  getMyApplications,
  getMyApplicationById,
  resolveDeficiency,
  streamStudentApplicationDocument,
} = require('../controllers/studentApplicationController');

router.use(protectStudent);

router.post('/applications', submitApplication);
router.get('/applications', getMyApplications);
router.get('/applications/:id', getMyApplicationById);
router.get('/applications/:id/documents/:documentId', streamStudentApplicationDocument);
router.post('/applications/:id/resolve-deficiency', resolveDeficiency);

module.exports = router;
