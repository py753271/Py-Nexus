const express = require('express');
const router = express.Router();
const lifecycleController = require('../controllers/lifecycleController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/enroll', requirePermission('mentors:write'), lifecycleController.enrollIntern);
router.post('/stage', requirePermission('mentors:write'), lifecycleController.updateStage);

module.exports = router;
