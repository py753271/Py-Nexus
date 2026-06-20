const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Daily check-in
exports.checkIn = async (userId, location) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
        where: {
            userId: parseInt(userId),
            date: today
        }
    });

    if (existing) {
        throw new Error('Already checked in for today');
    }

    const checkInTime = new Date();
    // Late threshold: after 9:30 AM
    const lateLimit = new Date();
    lateLimit.setHours(9, 30, 0, 0);
    const status = checkInTime > lateLimit ? 'Late' : 'Present';

    return await prisma.attendance.create({
        data: {
            userId: parseInt(userId),
            date: today,
            checkIn: checkInTime,
            status,
            location
        }
    });
};

// Daily check-out
exports.checkOut = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
        where: {
            userId: parseInt(userId),
            date: today
        }
    });

    if (!attendance) {
        throw new Error('No check-in record found for today');
    }

    if (attendance.checkOut) {
        throw new Error('Already checked out for today');
    }

    return await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
            checkOut: new Date()
        }
    });
};

// Get stats for user
exports.getUserStats = async (userId) => {
    const logs = await prisma.attendance.findMany({
        where: { userId: parseInt(userId) }
    });

    const total = logs.length;
    const present = logs.filter(l => l.status === 'Present').length;
    const late = logs.filter(l => l.status === 'Late').length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return {
        totalDays: total,
        presentCount: present,
        lateCount: late,
        attendancePercentage: rate,
        logs: logs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30)
    };
};

// Get all attendance logs (Admin)
exports.getGlobalLogs = async () => {
    return await prisma.attendance.findMany({
        include: {
            user: { select: { name: true, email: true, department: true } }
        },
        orderBy: { date: 'desc' },
        take: 100
    });
};
