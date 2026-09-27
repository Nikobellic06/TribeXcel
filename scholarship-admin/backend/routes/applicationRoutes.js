const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getApplications,
  getApplicationById,
  updateStatus,
  bulkUpdateStatus,
  getMeritList,
  finalizeSelection,
  getAnalyticsSummary,
  getAnalyticsTrend,
} = require('../controllers/applicationController');

router.use(protect);

router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateStatus);
router.patch('/applications/bulk-status', bulkUpdateStatus);
router.patch('/applications/finalize-selection', finalizeSelection);

router.get('/merit-list', getMeritList);
router.get('/analytics/summary', getAnalyticsSummary);
router.get('/analytics/trend', getAnalyticsTrend);

module.exports = router;
