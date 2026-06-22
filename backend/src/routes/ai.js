const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middlewares/auth');

router.post('/query', verifyToken, aiController.queryIntelligence);
router.get('/insights', verifyToken, aiController.getPerformanceInsights);
router.get('/recommendations', verifyToken, aiController.getRecommendations);
router.get('/status', verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        isConfigured: !!process.env.GEMINI_API_KEY
    });
});

module.exports = router;

