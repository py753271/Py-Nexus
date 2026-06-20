const taskService = require('../services/taskService');
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Create Task
exports.createTask = asyncWrapper(async (req, res, next) => {
    const { title, description, dueDate, priority, assignedToId } = req.body;
    const createdById = req.user.userId;

    if (!title || !dueDate || !assignedToId) {
        return res.status(400).json({ success: false, message: 'Title, Due Date, and Assigned Intern are required' });
    }

    const task = await taskService.createTask(title, description, dueDate, priority, assignedToId, createdById);
    res.status(201).json({ success: true, message: 'Task assigned successfully', data: task });
});

// Get Tasks
exports.getTasks = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;
    const role = req.user.role;
    const list = await taskService.getTasks(userId, role);
    res.status(200).json({ success: true, data: list });
});

// Submit Task
exports.submitTask = asyncWrapper(async (req, res, next) => {
    const { taskId, content } = req.body;
    const submitterId = req.user.userId;

    if (!taskId || !content) {
        return res.status(400).json({ success: false, message: 'Task ID and submission content are required' });
    }

    const submission = await taskService.submitTask(taskId, submitterId, content);
    res.status(200).json({ success: true, message: 'Task submitted successfully', data: submission });
});

// Review Submission
exports.reviewSubmission = asyncWrapper(async (req, res, next) => {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;
    const reviewerId = req.user.userId;

    if (score === undefined || score === null) {
        return res.status(400).json({ success: false, message: 'Score is required for review' });
    }

    const reviewed = await taskService.reviewSubmission(submissionId, reviewerId, score, feedback);
    res.status(200).json({ success: true, message: 'Submission reviewed successfully', data: reviewed });
});
