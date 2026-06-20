const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middlewares/auth');

router.post('/query', verifyToken, aiController.queryIntelligence);
router.get('/insights', verifyToken, aiController.getPerformanceInsights);
router.get('/recommendations', verifyToken, aiController.getRecommendations);

module.exports = router;

