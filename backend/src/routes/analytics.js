const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middlewares/auth');

router.get('/global', verifyToken, analyticsController.getGlobalStats);
router.get('/personal', verifyToken, analyticsController.getStudentActivity);

module.exports = router;
