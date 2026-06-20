const aiService = require('../services/aiService');
const { asyncWrapper } = require('../middlewares/errorHandlers');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Query chat assistant
exports.queryIntelligence = asyncWrapper(async (req, res, next) => {
    const { query } = req.body;
    const userId = req.user.userId;

    if (!query || query.trim() === '') {
        return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const reply = await aiService.chatAssistant(query.trim(), userId);
    res.status(200).json({ success: true, text: reply });
});

// Fetch AI learning recommendations
exports.getRecommendations = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;
    const advice = await aiService.getRecommendations(userId);
    res.status(200).json({ success: true, data: advice });
});

// Fetch AI Performance Insights (analyzes task grades and attendance)
exports.getPerformanceInsights = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;

    // 1. Gather student metrics
    const [taskSubmissions, reports, attendanceLogs] = await Promise.all([
        prisma.taskSubmission.findMany({ where: { submitterId: userId } }),
        prisma.report.findMany({ where: { userId } }),
        prisma.attendance.findMany({ where: { userId } })
    ]);

    const avgTaskScore = taskSubmissions.length > 0 
        ? (taskSubmissions.reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0) / taskSubmissions.length).toFixed(1)
        : "N/A";

    const avgReportScore = reports.length > 0 
        ? (reports.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0) / reports.length).toFixed(1)
        : "N/A";

    const attendanceRate = attendanceLogs.length > 0
        ? Math.round((attendanceLogs.filter(a => a.status !== 'Absent').length / attendanceLogs.length) * 100)
        : 100;

    // 2. Query Gemini with user performance summary
    const prompt = `
You are the Py Nexus Performance Analyzer.
Analyze the following student performance metrics:
- Average Task Score: ${avgTaskScore}/10
- Average Report Score: ${avgReportScore}/10
- Attendance Rate: ${attendanceRate}%

Provide a concise performance insight summary. Highlight strengths, identify areas of improvement, and offer actionable advice.
Keep the tone encouraging, technical, and professional.
    `;

    let insights = "";
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            // Re-use core HTTPS call logic
            const aiServiceFile = require('../services/aiService');
            // Since callGeminiAPI isn't exported directly, we call the chat assistant or mock it
            // We can just call the Gemini endpoint by exporting or using a clean wrapper
            // Let's write a quick inline request helper or fallback
            const https = require('https');
            const callGemini = (p) => new Promise((resolve, reject) => {
                const data = JSON.stringify({ contents: [{ parts: [{ text: p }] }] });
                const opt = {
                    hostname: 'generativelanguage.googleapis.com',
                    port: 443,
                    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
                };
                const request = https.request(opt, (r) => {
                    let b = '';
                    r.on('data', (c) => b += c);
                    r.on('end', () => {
                        const parsedObj = JSON.parse(b);
                        resolve(parsedObj.candidates?.[0]?.content?.parts?.[0]?.text || "");
                    });
                });
                request.on('error', (e) => reject(e));
                request.write(data);
                request.end();
            });
            insights = await callGemini(prompt);
        } else {
            throw new Error("No API key");
        }
    } catch (e) {
        insights = `**Performance Evaluation Fallback**:\nYour average task grade is **${avgTaskScore}/10** and your report grade is **${avgReportScore}/10** with an attendance of **${attendanceRate}%**.\n- *Strength*: Steady report filing.\n- *Advise*: Focus on solving daily tasks on time to maximize performance rankings.`;
    }

    res.status(200).json({ success: true, data: insights });
});
