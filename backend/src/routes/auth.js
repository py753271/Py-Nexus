const express = require('express');
const { register, login, getMe, logout, verify2FALogin, generate2FA, verify2FASetup, disable2FA } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/verify-2fa', verify2FALogin);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);

// 2FA Routes
router.post('/2fa/generate', verifyToken, generate2FA);
router.post('/2fa/verify-setup', verifyToken, verify2FASetup);
router.post('/2fa/disable', verifyToken, disable2FA);

module.exports = router;
