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
