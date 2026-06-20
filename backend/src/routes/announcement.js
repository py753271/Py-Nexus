const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Public/User routes
router.get('/', announcementController.getAnnouncements);

// Admin only routes
router.post('/', verifyToken, requireRole(['ADMIN']), announcementController.createAnnouncement);
router.patch('/:id/pin', verifyToken, requireRole(['ADMIN']), announcementController.togglePin);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), announcementController.deleteAnnouncement);

module.exports = router;
