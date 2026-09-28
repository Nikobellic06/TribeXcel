import api from './axios';

/* Profile */
export const fetchProfile = () => api.get('/student/profile').then((r) => r.data.student);
export const updateProfile = (payload) => api.put('/student/profile', payload).then((r) => r.data.student);
export const verifyAadhaarKyc = (payload) =>
  api.post('/student/profile/aadhaar-kyc', payload).then((r) => r.data.student);

/* Drafts (one per scheme) */
export const fetchDraft = (schemeCode) =>
  api.get(`/student/drafts/${schemeCode}`).then((r) => r.data.draft);
export const saveDraft = (schemeCode, payload) =>
  api.put(`/student/drafts/${schemeCode}`, payload).then((r) => r.data.draft);
export const deleteDraft = (schemeCode) => api.delete(`/student/drafts/${schemeCode}`);
export const fetchDrafts = () => api.get('/student/drafts').then((r) => r.data.drafts || []);

/* Uploads — file is sent as base64 JSON so the backend needs no extra package */
export const uploadFile = (payload) => api.post('/student/uploads', payload).then((r) => r.data);

/* Applications */
export const fetchMyApplications = () =>
  api.get('/student/applications').then((r) => r.data.applications || []);
export const fetchMyApplication = (id) =>
  api.get(`/student/applications/${id}`).then((r) => r.data.application);
export const submitApplication = (payload) =>
  api.post('/student/applications', payload).then((r) => r.data.application);
