const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all announcements
exports.getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        next(error);
    }
};

// Create a new announcement (Admin only)
exports.createAnnouncement = async (req, res, next) => {
    try {
        const { title, description, priority } = req.body;
        const announcement = await prisma.announcement.create({
            data: {
                title,
                description,
                priority
            }
        });
        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        next(error);
    }
};

// Toggle pinned status
exports.togglePin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const current = await prisma.announcement.findUnique({ where: { id: parseInt(id) } });
        const updated = await prisma.announcement.update({
            where: { id: parseInt(id) },
            data: { pinned: !current.pinned }
        });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// Delete an announcement
exports.deleteAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        next(error);
    }
};
