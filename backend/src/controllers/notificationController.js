const notificationService = require('../services/notificationService');
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Get my notifications
exports.getMyNotifications = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;
    const list = await notificationService.getUserNotifications(userId);
    res.status(200).json({ success: true, data: list });
});

// Mark all as read
exports.markAllAsRead = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;
    await notificationService.markAsRead(userId);
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
});
