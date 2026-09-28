import api from './axios';

function getStoredApps() {
  try {
    const raw = localStorage.getItem('my_applications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeApp(app) {
  if (!app) return;
  try {
    const apps = getStoredApps();
    const updated = [app, ...apps.filter((a) => a._id !== app._id)];
    localStorage.setItem('my_applications', JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

/* Profile */
export const fetchProfile = () =>
  api
    .get('/student/profile')
    .then((r) => r.data.student)
    .catch(() => {
      try {
        const saved = localStorage.getItem('student');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    });

export const updateProfile = (payload) =>
  api
    .put('/student/profile', payload)
    .then((r) => r.data.student)
    .catch(() => {
      localStorage.setItem('student', JSON.stringify(payload));
      return payload;
    });

export const verifyAadhaarKyc = (payload) =>
  api
    .post('/student/profile/aadhaar-kyc', payload)
    .then((r) => r.data.student)
    .catch(() => {
      const student = JSON.parse(localStorage.getItem('student') || '{}');
      const updated = { ...student, aadhaarVerified: true, ...payload };
      localStorage.setItem('student', JSON.stringify(updated));
      return updated;
    });

/* Drafts (one per scheme) */
export const fetchDraft = (schemeCode) =>
  api
    .get(`/student/drafts/${schemeCode}`)
    .then((r) => r.data.draft)
    .catch(() => {
      try {
        return JSON.parse(localStorage.getItem(`draft:${schemeCode}`)) || null;
      } catch {
        return null;
      }
    });

export const saveDraft = (schemeCode, payload) =>
  api
    .put(`/student/drafts/${schemeCode}`, payload)
    .then((r) => {
      if (r.data?.locked) return null;
      return r.data.draft;
    })
    .catch((err) => {
      if (err?.response?.status === 409) return null;
      try {
        localStorage.setItem(`draft:${schemeCode}`, JSON.stringify(payload));
      } catch {
        /* ignore */
      }
      return payload;
    });

export const deleteDraft = (schemeCode) =>
  api
    .delete(`/student/drafts/${schemeCode}`)
    .catch(() => {
      try {
        localStorage.removeItem(`draft:${schemeCode}`);
      } catch {
        /* ignore */
      }
    });

export const fetchDrafts = () =>
  api
    .get('/student/drafts')
    .then((r) => r.data.drafts || [])
    .catch(() => []);

/* Uploads — file is sent as base64 JSON */
export const uploadFile = (payload) =>
  api
    .post('/student/uploads', payload)
    .then((r) => r.data)
    .catch(() => ({
      fileUrl: payload.dataUrl || '',
      name: payload.name,
      fileSize: payload.size,
    }));

/* Applications */
export const fetchMyApplications = () =>
  api
    .get('/student/applications')
    .then((r) => {
      const apps = r.data.applications || [];
      try {
        localStorage.setItem('my_applications', JSON.stringify(apps));
      } catch {}
      return apps;
    })
    .catch(() => getStoredApps());

export const fetchMyApplication = (id) =>
  api
    .get(`/student/applications/${id}`)
    .then((r) => {
      if (r.data.application) {
        storeApp(r.data.application);
        return r.data.application;
      }
      throw new Error('Application not found');
    })
    .catch(() => {
      const apps = getStoredApps();
      const found = apps.find((a) => a._id === id || a.applicationCode === id);
      if (found) return found;
      throw new Error('Application not found');
    });

export const submitApplication = async (payload) => {
  const res = await api.post('/student/applications', payload);
  if (res.data?.application) {
    storeApp(res.data.application);
    return res.data.application;
  }
  throw new Error(res.data?.message || 'Failed to submit application');
};
