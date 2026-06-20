const prisma = require('../config/db');
const { asyncWrapper } = require('../middlewares/errorHandlers');

exports.getMyEnrollments = asyncWrapper(async (req, res) => {
    const userId = parseInt(req.user.userId);
    const enrollments = await prisma.enrollment.findMany({
        where: { userId: userId },
        include: { course: true }
    });
    res.status(200).json({ success: true, data: enrollments });
});

exports.enrollInCourse = asyncWrapper(async (req, res) => {
    const userId = parseInt(req.user.userId);
    const { courseId } = req.body;

    const cid = parseInt(courseId);
    if (!courseId || isNaN(cid)) {
        return res.status(400).json({ success: false, message: 'Valid Course ID is required' });
    }
    const existing = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: userId,
                courseId: cid
            }
        }
    });

    if (existing) {
        return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            userId: userId,
            courseId: cid
        }
    });

    res.status(201).json({ success: true, data: enrollment });
});

exports.updateProgress = asyncWrapper(async (req, res) => {
    const userId = parseInt(req.user.userId);
    const { courseId } = req.params;
    const { progress } = req.body;

    const enrollment = await prisma.enrollment.update({
        where: {
            userId_courseId: {
                userId: userId,
                courseId: parseInt(courseId)
            }
        },
        data: { progress: parseFloat(progress) }
    });

    res.status(200).json({ success: true, data: enrollment });
});
