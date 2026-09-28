const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getApplications,
  getCounts,
  getReviewQueue,
  getApplicationById,
  decide,
  reanalyze,
  updateStatus,
  bulkUpdateStatus,
  getMeritList,
  finalizeSelection,
  getAnalyticsSummary,
  getAnalyticsTrend,
  getNotifications,
  markNotificationsSeen,
} = require('../controllers/applicationController');

router.use(protect);

// Fixed paths first so they are not read as an :id
router.get('/applications', getApplications);
router.get('/applications/counts', getCounts);
router.patch('/applications/bulk-status', bulkUpdateStatus);
router.patch('/applications/finalize-selection', finalizeSelection);
router.get('/applications/:id', getApplicationById);
router.post('/applications/:id/decision', decide);
router.post('/applications/:id/reanalyze', reanalyze);
router.patch('/applications/:id/status', updateStatus);

router.get('/review-queue', getReviewQueue);
router.get('/merit-list', getMeritList);
router.get('/analytics/summary', getAnalyticsSummary);
router.get('/analytics/trend', getAnalyticsTrend);
router.get('/notifications', getNotifications);
router.patch('/notifications/seen', markNotificationsSeen);

module.exports = router;
