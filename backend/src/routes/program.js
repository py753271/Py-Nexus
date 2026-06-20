const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', requirePermission('depts:read'), programController.getPrograms);
router.post('/', requirePermission('depts:write'), programController.createProgram);

router.get('/batches', requirePermission('depts:read'), programController.getBatches);
router.post('/batches', requirePermission('depts:write'), programController.createBatch);

module.exports = router;
