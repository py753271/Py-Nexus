const programService = require('../services/programService');
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Get all programs
exports.getPrograms = asyncWrapper(async (req, res, next) => {
    const list = await programService.getPrograms();
    res.status(200).json({ success: true, data: list });
});

// Create program
exports.createProgram = asyncWrapper(async (req, res, next) => {
    const { name, description, duration } = req.body;
    if (!name || !duration) {
        return res.status(400).json({ success: false, message: 'Program name and duration are required' });
    }

    const item = await programService.createProgram(name, description, duration);
    res.status(201).json({ success: true, data: item });
});

// Get all batches
exports.getBatches = asyncWrapper(async (req, res, next) => {
    const list = await programService.getBatches();
    res.status(200).json({ success: true, data: list });
});

// Create batch
exports.createBatch = asyncWrapper(async (req, res, next) => {
    const { name, startDate, endDate, programId } = req.body;
    if (!name || !startDate || !endDate || !programId) {
        return res.status(400).json({ success: false, message: 'All batch parameters are required' });
    }

    const item = await programService.createBatch(name, startDate, endDate, programId);
    res.status(201).json({ success: true, data: item });
});
