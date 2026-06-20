const attendanceService = require('../services/attendanceService');
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Check-in
exports.checkIn = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;
    const { location } = req.body;
    const log = await attendanceService.checkIn(userId, location);
    res.status(201).json({ success: true, message: 'Checked in successfully', data: log });
});

// Check-out
exports.checkOut = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;
    const log = await attendanceService.checkOut(userId);
    res.status(200).json({ success: true, message: 'Checked out successfully', data: log });
});

// Get own stats
exports.getMyStats = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;
    const stats = await attendanceService.getUserStats(userId);
    res.status(200).json({ success: true, data: stats });
});

// Get global logs (Admin/Mentor)
exports.getGlobalLogs = asyncWrapper(async (req, res, next) => {
    const logs = await attendanceService.getGlobalLogs();
    res.status(200).json({ success: true, data: logs });
});
