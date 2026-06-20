const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', requirePermission('mentors:read'), mentorController.getAllMentors);
router.get('/mappings', requirePermission('mentors:read'), mentorController.getInternMentorMappings);
router.post('/assign', requirePermission('mentors:write'), mentorController.assignMentor);

module.exports = router;
