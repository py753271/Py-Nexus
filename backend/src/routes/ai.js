const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting specifically for AI endpoints (max 15 requests per minute per IP)
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 15,
    message: { success: false, message: 'Too many requests to AI endpoints, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/query', verifyToken, aiLimiter, aiController.queryIntelligence);
router.post('/query-stream', verifyToken, aiLimiter, aiController.streamQueryIntelligence);
router.get('/insights', verifyToken, aiLimiter, aiController.getPerformanceInsights);
router.get('/recommendations', verifyToken, aiLimiter, aiController.getRecommendations);
router.get('/history', verifyToken, aiController.getChatHistory);
router.get('/status', verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        isConfigured: !!process.env.GEMINI_API_KEY
    });
});

module.exports = router;

