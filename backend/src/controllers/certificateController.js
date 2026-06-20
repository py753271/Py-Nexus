const certificateService = require('../services/certificateService');
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Issue certificate
exports.issueCertificate = asyncWrapper(async (req, res, next) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
        return res.status(400).json({ success: false, message: 'User ID and Course ID are required' });
    }

    const cert = await certificateService.issueCertificate(userId, courseId);
    res.status(201).json({ success: true, message: 'Certificate issued successfully', data: cert });
});

// Verify certificate by hash (public route)
exports.verifyCertificate = asyncWrapper(async (req, res, next) => {
    const { hash } = req.params;
    if (!hash) {
        return res.status(400).json({ success: false, message: 'Certificate hash is required' });
    }

    const cert = await certificateService.verifyCertificate(hash);
    res.status(200).json({ success: true, message: 'Certificate verified', data: cert });
});
