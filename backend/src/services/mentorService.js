const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMentors = async () => {
    return await prisma.user.findMany({
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
};

exports.getInternMentorMappings = async () => {
    return await prisma.user.findMany({
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
};

exports.assignMentor = async (internId, mentorId) => {
    const intern = await prisma.user.findFirst({
        where: { id: parseInt(internId), role: 'STUDENT' }
    });
    if (!intern) {
        throw new Error('Intern not found');
    }

    if (mentorId) {
        const mentor = await prisma.user.findFirst({
            where: { id: parseInt(mentorId), role: { in: ['ADMIN', 'INSTRUCTOR'] } }
        });
        if (!mentor) {
            throw new Error('Mentor not found or invalid role');
        }
    }

    return await prisma.user.update({
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
};
