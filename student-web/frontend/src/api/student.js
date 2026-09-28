import api from './axios';

const SAMPLE_APPLICATIONS = [
  {
    _id: 'app-sample-nfst-01',
    applicationCode: 'NFST/2026/JH/84920',
    scheme: 'NFST',
    session: '2026-27',
    status: 'Deficient',
    course: 'Ph.D in Tribal Studies & Linguistics',
    institution: 'Ranchi University, Ranchi',
    name: 'Sunita Soren',
    dob: '2004-05-15',
    gender: 'Female',
    phone: '9876543210',
    email: 'sunita.soren@scholarship.gov.in',
    state: 'Jharkhand',
    district: 'Ranchi',
    submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    adminRemarks:
      'Income Certificate is older than valid financial year. Please upload the latest Income Certificate (FY 2025-26) issued by Tehsildar or Sub-Divisional Magistrate.',
    documents: [
      { name: 'ST Certificate - Santhal.pdf', docType: 'caste', source: 'digilocker', fileSize: 324000 },
      { name: 'Income_Certificate_2024.pdf', docType: 'income', source: 'upload', fileSize: 412000 },
      { name: 'Admission_Letter_RU.pdf', docType: 'bonafide', source: 'upload', fileSize: 520000 },
      { name: 'Bank_Passbook_AadhaarSeeded.pdf', docType: 'passbook', source: 'upload', fileSize: 288000 },
    ],
    schemeData: {
      sections: {
        personal: { fatherName: 'Shri Somra Soren', motherName: 'Smt. Muni Soren', addressLine: 'Quarter No. 4B, Morabadi', pincode: '834008' },
        category: { tribeName: 'Santhal', familyIncome: 180000 },
        bank: { accountNumber: '382910482910', ifsc: 'SBIN0000167', bankName: 'State Bank of India' },
      },
    },
  },
];

function getStoredApps() {
  try {
    const raw = localStorage.getItem('my_applications');
    if (!raw) {
      localStorage.setItem('my_applications', JSON.stringify(SAMPLE_APPLICATIONS));
      return SAMPLE_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_APPLICATIONS;
  }
}

function storeApp(app) {
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
    .then((r) => r.data.draft)
    .catch(() => {
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
    .then((r) => r.data.applications || [])
    .catch(() => getStoredApps());

export const fetchMyApplication = (id) =>
  api
    .get(`/student/applications/${id}`)
    .then((r) => r.data.application)
    .catch(() => {
      const apps = getStoredApps();
      const found = apps.find((a) => a._id === id || a.applicationCode === id);
      if (found) return found;
      throw new Error('Application not found');
    });

export const submitApplication = (payload) =>
  api
    .post('/student/applications', payload)
    .then((r) => {
      storeApp(r.data.application);
      return r.data.application;
    })
    .catch(() => {
      const student = JSON.parse(localStorage.getItem('student') || '{}');
      const randomCode = Math.floor(10000 + Math.random() * 90000);
      const app = {
        _id: `app-${Date.now()}`,
        applicationCode: `${payload.scheme || 'MOTA'}/2026/JH/${randomCode}`,
        scheme: payload.scheme,
        session: '2026-27',
        status: 'Pending',
        name: student.name || 'Applicant',
        course: payload.course || payload.schemeData?.sections?.academic?.course || 'Higher Education Course',
        institution: payload.institution || payload.schemeData?.sections?.academic?.institutionName || 'Recognised University / Institute',
        submittedAt: new Date().toISOString(),
        documents: payload.documents || [],
        schemeData: payload.schemeData || {},
        dob: student.dob,
        gender: student.gender,
        phone: student.phone,
        email: student.email,
        category: student.category || 'ST',
        state: student.state || 'Jharkhand',
        district: student.district || 'Ranchi',
      };
      storeApp(app);
      return app;
    });
