const prisma = require('../config/db');
const { asyncWrapper } = require('../middlewares/errorHandlers');

exports.getAllCourses = asyncWrapper(async (req, res) => {
    const courses = await prisma.course.findMany({
        include: {
            category: true,
            lessons: true
        }
    });
    res.status(200).json({ success: true, data: courses });
});

exports.getCourseById = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
        include: {
            category: true,
            lessons: { orderBy: { order: 'asc' } }
        }
    });

    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
});

exports.createCourse = asyncWrapper(async (req, res) => {
    const { title, description, categoryId, thumbnail } = req.body;

    if (!title || !description || !categoryId) {
        return res.status(400).json({ success: false, message: 'Title, description, and categoryId are required' });
    }

    const course = await prisma.course.create({
        data: {
            title,
            description,
            categoryId: parseInt(categoryId),
            thumbnail
        }
    });

    res.status(201).json({ success: true, data: course });
});

exports.updateCourse = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { title, description, categoryId, thumbnail } = req.body;

    const course = await prisma.course.update({
        where: { id: parseInt(id) },
        data: { title, description, categoryId: parseInt(categoryId), thumbnail }
    });

    res.status(200).json({ success: true, data: course });
});

exports.deleteCourse = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    await prisma.course.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Course deleted' });
});
