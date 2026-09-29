import api from './axios';

/* All admin API calls in one place. Pages never call axios directly. */
export const getCounts = () => api.get('/applications/counts').then((r) => r.data);
export const listApplications = (params) => api.get('/applications', { params }).then((r) => r.data);
export const getReviewQueue = (params) => api.get('/review-queue', { params }).then((r) => r.data);
export const getApplication = (id) => api.get(`/applications/${id}`).then((r) => r.data);
export const recordDecision = (id, payload) => api.post(`/applications/${id}/decision`, payload).then((r) => r.data);
export const rerunAnalysis = (id) => api.post(`/applications/${id}/reanalyze`, { includeFiles: true }).then((r) => r.data);
export const getMeritList = (scheme) => api.get('/merit-list', { params: { scheme } }).then((r) => r.data);
export const finalizeSelection = (ids) => api.patch('/applications/finalize-selection', { ids }).then((r) => r.data);
export const getSummary = () => api.get('/analytics/summary').then((r) => r.data);
export const getTrend = (days = 30) => api.get('/analytics/trend', { params: { days } }).then((r) => r.data);
export const getNotifications = () => api.get('/notifications').then((r) => r.data);
export const markNotificationsSeen = () => api.patch('/notifications/seen').then((r) => r.data);
export const verifyDocumentItem = (id, docType, payload) => api.post(`/applications/${id}/documents/${docType}/verify`, payload).then((r) => r.data);
export const getApplicationAuditLogs = (id) => api.get(`/applications/${id}/audit-logs`).then((r) => r.data);
export const getAuditLogs = (params) => api.get('/audit-logs', { params }).then((r) => r.data);

