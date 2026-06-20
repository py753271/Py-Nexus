const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Get all reports (Admin sees all, Student sees own)
exports.getReports = asyncWrapper(async (req, res, next) => {
    const userId = parseInt(req.user.userId);
    const { filter } = req.query;
    let reports;
    
    if (req.user.role === 'ADMIN' && filter !== 'own') {
        reports = await prisma.report.findMany({
            include: { user: { select: { name: true, department: true } } },
            orderBy: { createdAt: 'desc' }
        });
    } else {
        reports = await prisma.report.findMany({
            where: { userId: userId },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    res.status(200).json({ success: true, data: reports });
});

// Create a new report (Student only) + Trigger AI Auto-Evaluation
exports.submitReport = asyncWrapper(async (req, res, next) => {
    const userId = parseInt(req.user.userId);
    const { title, content } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Report title is required' });
    }

    // 1. Create the raw report
    let report = await prisma.report.create({
        data: {
            title,
            content,
            userId: userId,
            status: "Pending"
        }
    });

    // 2. Trigger AI Auto-Evaluation asynchronously (or synchronously for instant feedback)
    try {
        const aiEvaluation = await aiService.evaluateReport(title, content);
        
        // 3. Update report with AI grade
        report = await prisma.report.update({
            where: { id: report.id },
            data: {
                score: aiEvaluation.score,
                status: "Reviewed" // Mark as Reviewed by AI
            }
        });

        // 4. Create an in-app notification for the user
        await notificationService.createNotification(
            userId,
            "Report Evaluated by AI",
            `Your report "${title}" was auto-graded. Score: ${aiEvaluation.score}/10. Feedback: ${aiEvaluation.feedback}`,
            "Alert"
        );
    } catch (aiErr) {
        console.error("[Report Controller] AI grading execution error:", aiErr);
    }

    res.status(201).json({ success: true, data: report });
});

// Review/Score a report manually (Admin/Mentor only)
exports.scoreReport = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { score, status } = req.body;

    if (score === undefined || score === null) {
        return res.status(400).json({ success: false, message: 'Score is required' });
    }

    const reportId = parseInt(id);
    const report = await prisma.report.update({
        where: { id: reportId },
        data: { 
            score: parseFloat(score),
            status: status || 'Reviewed'
        }
    });

    // Notify student of manual grade
    await notificationService.createNotification(
        report.userId,
        "Report Graded by Mentor",
        `Your report "${report.title}" was reviewed. Grade: ${parseFloat(score)}/10.`,
        "System"
    );

    res.status(200).json({ success: true, data: report });
});

// Delete a report
exports.deleteReport = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    await prisma.report.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Report deleted successfully' });
});
