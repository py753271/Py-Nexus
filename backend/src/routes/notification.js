const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', notificationController.getMyNotifications);
router.post('/read', notificationController.markAllAsRead);

module.exports = router;
