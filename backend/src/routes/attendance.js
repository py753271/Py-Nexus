const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);
router.get('/my-stats', attendanceController.getMyStats);
router.get('/logs', requirePermission('users:read'), attendanceController.getGlobalLogs);

module.exports = router;
