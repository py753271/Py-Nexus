const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

// Public verification route
router.get('/verify/:hash', certificateController.verifyCertificate);

// Secure issuance route
router.post('/issue', verifyToken, requirePermission('users:write'), certificateController.issueCertificate);

module.exports = router;
