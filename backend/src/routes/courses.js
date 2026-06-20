const express = require('express');
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { verifyToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.post('/', verifyToken, requireRole(['ADMIN', 'INSTRUCTOR']), createCourse);
router.put('/:id', verifyToken, requireRole(['ADMIN', 'INSTRUCTOR']), updateCourse);
router.delete('/:id', verifyToken, requireRole(['ADMIN', 'INSTRUCTOR']), deleteCourse);

module.exports = router;
