const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', taskController.getTasks);
router.post('/', requirePermission('mentors:write'), taskController.createTask);
router.post('/submit', taskController.submitTask);
router.post('/review/:submissionId', requirePermission('mentors:write'), taskController.reviewSubmission);

module.exports = router;
