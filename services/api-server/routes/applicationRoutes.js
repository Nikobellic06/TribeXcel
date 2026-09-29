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
  getAuditLogs,
  verifyDocumentItem,
} = require('../controllers/applicationController');

router.use(protect);

// Fixed paths first so they are not read as an :id
router.get('/applications', getApplications);
router.get('/applications/counts', getCounts);
router.patch('/applications/bulk-status', bulkUpdateStatus);
router.patch('/applications/finalize-selection', finalizeSelection);
router.get('/applications/:id', getApplicationById);
router.post('/applications/:id/decision', decide);
router.post('/applications/:id/verify', (req, res, next) => {
  req.body = { ...req.body, decision: 'verify' };
  decide(req, res, next);
});
router.post('/applications/:id/defect', (req, res, next) => {
  req.body = { ...req.body, decision: 'defective' };
  decide(req, res, next);
});
router.post('/applications/:id/reject', (req, res, next) => {
  req.body = { ...req.body, decision: 'reject' };
  decide(req, res, next);
});
router.post('/applications/:id/reanalyze', reanalyze);
router.patch('/applications/:id/status', updateStatus);
router.post('/applications/:id/documents/:docType/verify', verifyDocumentItem);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// Admin prefixed route aliases (Part 33)
router.get('/admin/applications', getApplications);
router.get('/admin/applications/:id', getApplicationById);
router.post('/admin/applications/:id/verify', (req, res, next) => {
  req.body = { ...req.body, decision: 'verify' };
  decide(req, res, next);
});
router.post('/admin/applications/:id/defect', (req, res, next) => {
  req.body = { ...req.body, decision: 'defective' };
  decide(req, res, next);
});
router.post('/admin/applications/:id/reject', (req, res, next) => {
  req.body = { ...req.body, decision: 'reject' };
  decide(req, res, next);
});
router.post('/admin/applications/:id/documents/:docType/verify', verifyDocumentItem);
router.get('/admin/dashboard', getCounts);
router.get('/admin/analytics', getAnalyticsSummary);
router.get('/admin/audit-logs', getAuditLogs);

router.get('/review-queue', getReviewQueue);
router.get('/merit-list', getMeritList);
router.get('/analytics/summary', getAnalyticsSummary);
router.get('/analytics/trend', getAnalyticsTrend);
router.get('/notifications', getNotifications);
router.patch('/notifications/seen', markNotificationsSeen);

module.exports = router;
