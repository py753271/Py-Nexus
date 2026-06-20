const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Get all mentors (Users with role ADMIN or INSTRUCTOR)
exports.getAllMentors = asyncWrapper(async (req, res, next) => {
    const mentors = await prisma.user.findMany({
        where: {
            role: { in: ['ADMIN', 'INSTRUCTOR'] }
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true
        },
        orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: mentors });
});

// Get intern-to-mentor mappings (All students and their mentors)
exports.getInternMentorMappings = asyncWrapper(async (req, res, next) => {
    const interns = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: {
            id: true,
            name: true,
            email: true,
            department: true,
            mentorId: true,
            mentor: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: interns });
});

// Assign mentor to intern
exports.assignMentor = asyncWrapper(async (req, res, next) => {
    const { internId, mentorId } = req.body;
    if (!internId) {
        return res.status(400).json({ success: false, message: 'Intern ID is required' });
    }

    const intern = await prisma.user.findFirst({
        where: { id: parseInt(internId), role: 'STUDENT' }
    });
    if (!intern) {
        return res.status(404).json({ success: false, message: 'Intern not found' });
    }

    if (mentorId) {
        const mentor = await prisma.user.findFirst({
            where: { id: parseInt(mentorId), role: { in: ['ADMIN', 'INSTRUCTOR'] } }
        });
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found or invalid role' });
        }
    }

    const updated = await prisma.user.update({
        where: { id: intern.id },
        data: {
            mentorId: mentorId ? parseInt(mentorId) : null
        },
        select: {
            id: true,
            name: true,
            email: true,
            mentorId: true,
            mentor: {
                select: { id: true, name: true }
            }
        }
    });

    res.status(200).json({ success: true, message: 'Mentor assigned successfully', data: updated });
});
