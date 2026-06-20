const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', reportController.getReports);
router.post('/', requireRole(['STUDENT', 'ADMIN']), reportController.submitReport);
router.patch('/:id/score', requireRole(['ADMIN']), reportController.scoreReport);
router.delete('/:id', requireRole(['ADMIN']), reportController.deleteReport);

module.exports = router;
