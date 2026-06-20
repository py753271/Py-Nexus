const prisma = require('../config/db');
const { asyncWrapper } = require('../middlewares/errorHandlers');

exports.createLesson = asyncWrapper(async (req, res) => {
    const { courseId, title, videoUrl, order } = req.body;

    if (!courseId || !title || !videoUrl || order === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required lesson fields' });
    }

    const lesson = await prisma.lesson.create({
        data: {
            title,
            videoUrl,
            order: parseInt(order),
            courseId: parseInt(courseId)
        }
    });

    res.status(201).json({ success: true, data: lesson });
});

exports.deleteLesson = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    await prisma.lesson.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Lesson deleted' });
});
