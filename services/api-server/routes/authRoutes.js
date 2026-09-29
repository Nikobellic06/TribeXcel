const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginRateLimit } = require('../middleware/loginRateLimit');

router.post('/login', loginRateLimit, login);
router.get('/me', protect, getProfile);

module.exports = router;
