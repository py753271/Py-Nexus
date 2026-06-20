const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create notification
exports.createNotification = async (userId, title, message, type = "System") => {
    return await prisma.notification.create({
        data: {
            userId: parseInt(userId),
            title,
            message,
            type
        }
    });
};

// Fetch notifications
exports.getUserNotifications = async (userId) => {
    return await prisma.notification.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
};

// Mark all as read
exports.markAsRead = async (userId) => {
    return await prisma.notification.updateMany({
        where: { userId: parseInt(userId), isRead: false },
        data: { isRead: true }
    });
};

// Mock Email sender
exports.sendMockEmail = async (to, subject, htmlContent) => {
    console.log(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
    // Nodemailer SMTP placeholder logs
    return true;
};
