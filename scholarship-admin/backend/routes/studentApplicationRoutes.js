const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/studentAuthMiddleware');
const {
  submitApplication,
  getMyApplications,
  getMyApplicationById,
} = require('../controllers/studentApplicationController');

router.use(protectStudent);

router.post('/applications', submitApplication);
router.get('/applications', getMyApplications);
router.get('/applications/:id', getMyApplicationById);

module.exports = router;
