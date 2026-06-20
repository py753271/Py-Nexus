const programService = require('../services/programService');
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Enroll Intern in Program and Batch
exports.enrollIntern = asyncWrapper(async (req, res, next) => {
    const { internId, programId, batchId } = req.body;
    if (!internId || !programId || !batchId) {
        return res.status(400).json({ success: false, message: 'Intern ID, Program ID, and Batch ID are required' });
    }

    const enrollment = await programService.enrollIntern(internId, programId, batchId);
    res.status(200).json({ success: true, message: 'Intern enrolled successfully', data: enrollment });
});

// Update Lifecycle Stage
exports.updateStage = asyncWrapper(async (req, res, next) => {
    const { internId, stage } = req.body;
    if (!internId || !stage) {
        return res.status(400).json({ success: false, message: 'Intern ID and Stage are required' });
    }

    const updated = await programService.updateLifecycleStage(internId, stage);
    res.status(200).json({ success: true, message: 'Lifecycle stage updated successfully', data: updated });
});
