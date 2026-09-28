const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/studentAuthMiddleware');
const { getProfile, updateProfile, verifyAadhaarKyc } = require('../controllers/studentProfileController');
const { listDrafts, getDraft, saveDraft, deleteDraft } = require('../controllers/studentDraftController');
const { uploadFile } = require('../controllers/studentUploadController');

/* Student portal: profile, e-KYC, drafts and document uploads. All need login. */
router.get('/profile', protectStudent, getProfile);
router.put('/profile', protectStudent, updateProfile);
router.post('/profile/aadhaar-kyc', protectStudent, verifyAadhaarKyc);

router.get('/drafts', protectStudent, listDrafts);
router.get('/drafts/:scheme', protectStudent, getDraft);
router.put('/drafts/:scheme', protectStudent, saveDraft);
router.delete('/drafts/:scheme', protectStudent, deleteDraft);

router.post('/uploads', protectStudent, uploadFile);

module.exports = router;
