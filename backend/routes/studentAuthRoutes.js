const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/studentAuthController');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protectStudent, getProfile);

module.exports = router;
