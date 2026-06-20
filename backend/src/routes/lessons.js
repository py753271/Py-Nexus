const express = require('express');
const { createLesson, deleteLesson } = require('../controllers/lessonController');
const { verifyToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.post('/', verifyToken, requireRole(['ADMIN', 'INSTRUCTOR']), createLesson);
router.delete('/:id', verifyToken, requireRole(['ADMIN', 'INSTRUCTOR']), deleteLesson);

module.exports = router;
