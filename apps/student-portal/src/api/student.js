import api from './axios';

const SERVER_ERROR_MESSAGE =
  'Unable to connect to the Ministry application server. Please check your internet connection and try again.';

/* Profile */
export const fetchProfile = async () => {
  try {
    const res = await api.get('/student/profile');
    return res.data?.student || null;
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const updateProfile = async (payload) => {
  try {
    const res = await api.put('/student/profile', payload);
    return res.data?.student;
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const verifyAadhaarKyc = async (payload) => {
  try {
    const res = await api.post('/student/profile/aadhaar-kyc', payload);
    return res.data?.student;
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

/* Drafts (stored in backend database only) */
export const fetchDraft = async (schemeCode) => {
  try {
    const res = await api.get(`/student/drafts/${schemeCode}`);
    return res.data?.draft || null;
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    return null;
  }
};

export const saveDraft = async (schemeCode, payload) => {
  try {
    const res = await api.put(`/student/drafts/${schemeCode}`, payload);
    if (res.data?.locked) return null;
    return res.data?.draft;
  } catch (err) {
    if (err?.response?.status === 409) return null;
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const deleteDraft = async (schemeCode) => {
  try {
    await api.delete(`/student/drafts/${schemeCode}`);
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const fetchDrafts = async () => {
  try {
    const res = await api.get('/student/drafts');
    return res.data?.drafts || [];
  } catch (err) {
    return [];
  }
};

/* Uploads — validated on backend server */
export const uploadFile = async (payload) => {
  try {
    const res = await api.post('/student/uploads', payload);
    return res.data;
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

/* Applications — Authoritative Backend Management */
export const fetchMyApplications = async () => {
  try {
    const res = await api.get('/student/applications');
    return res.data?.applications || [];
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const fetchMyApplication = async (id) => {
  try {
    const res = await api.get(`/student/applications/${id}`);
    if (res.data?.application) {
      return res.data.application;
    }
    throw new Error('Application not found');
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const submitApplication = async (payload) => {
  try {
    const res = await api.post('/student/applications', payload);
    if (res.data?.application) {
      return res.data.application;
    }
    throw new Error(res.data?.message || 'Failed to submit application');
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const resolveDeficiency = async (applicationId, payload) => {
  try {
    const res = await api.post(`/student/applications/${applicationId}/resolve-deficiency`, payload);
    return res.data?.application;
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const fetchDigiLockerDocuments = async () => {
  try {
    const res = await api.get('/student/documents');
    return res.data?.documents || [];
  } catch (err) {
    if (!err.response) throw new Error(SERVER_ERROR_MESSAGE);
    throw err;
  }
};

export const initiateDigiLockerAuth = async (payload = {}) => {
  const res = await api.post('/digilocker/authorize', payload);
  return res.data;
};

export const fetchDigiLockerSession = async (sessionId) => {
  const res = await api.get(`/digilocker/session/${sessionId}`);
  return res.data?.session;
};

export const submitDigiLockerOtp = async (sessionId, otp) => {
  const res = await api.post(`/digilocker/session/${sessionId}/auth-otp`, { otp });
  return res.data;
};

export const submitDigiLockerConsent = async (sessionId, consentGranted = true) => {
  const res = await api.post(`/digilocker/session/${sessionId}/consent`, { consentGranted });
  return res.data;
};

export const fetchIssuedDigiLockerDocuments = async (sessionId) => {
  const res = await api.get(`/digilocker/session/${sessionId}/documents`);
  return res.data;
};

export const retrieveDigiLockerDocuments = async (sessionId, selectedDocumentIds) => {
  const res = await api.post(`/digilocker/session/${sessionId}/retrieve`, { selectedDocumentIds });
  return res.data;
};

export const completeDigiLockerSession = async (sessionId) => {
  const res = await api.post(`/digilocker/session/${sessionId}/complete`);
  return res.data;
};

export const cancelDigiLockerSession = async (sessionId) => {
  const res = await api.post(`/digilocker/session/${sessionId}/cancel`);
  return res.data;
};

export const fetchDigiLockerScenarios = async () => {
  const res = await api.get('/digilocker/dev/scenarios');
  return res.data;
};

export const setDigiLockerScenario = async (scenario) => {
  const res = await api.post('/digilocker/dev/scenario', { scenario });
  return res.data;
};

/* --- DigiLocker Sandbox Wallet API --- */
export const fetchWalletOverview = async () => {
  const res = await api.get('/digilocker/wallet/overview');
  return res.data;
};

export const fetchWalletDocuments = async (params = {}) => {
  const res = await api.get('/digilocker/wallet/documents', { params });
  return res.data?.documents || [];
};

export const uploadWalletDocument = async (payload) => {
  const res = await api.post('/digilocker/wallet/upload', payload);
  return res.data;
};

export const fetchWalletDocumentDetail = async (id) => {
  const res = await api.get(`/digilocker/wallet/documents/${id}`);
  return res.data?.document;
};

export const updateWalletDocumentFields = async (id, payload) => {
  const res = await api.patch(`/digilocker/wallet/documents/${id}/fields`, payload);
  return res.data;
};

export const markWalletDocumentReady = async (id) => {
  const res = await api.post(`/digilocker/wallet/documents/${id}/verify`);
  return res.data;
};


export const deleteWalletDocument = async (id) => {
  const res = await api.delete(`/digilocker/wallet/documents/${id}`);
  return res.data;
};

