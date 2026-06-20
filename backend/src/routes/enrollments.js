const express = require('express');
const { getMyEnrollments, enrollInCourse, updateProgress } = require('../controllers/enrollmentController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/me', getMyEnrollments);
router.post('/', enrollInCourse);
router.put('/:courseId/progress', updateProgress);

module.exports = router;
