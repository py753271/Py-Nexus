const aiService = require('../services/aiService');
const { asyncWrapper } = require('../middlewares/errorHandlers');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Query chat assistant
exports.queryIntelligence = asyncWrapper(async (req, res, next) => {
    const { query } = req.body;
    const userId = req.user.userId;

    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ success: false, message: 'Query is required and must be a string' });
    }

    if (query.trim().length > 2000) {
        return res.status(400).json({ success: false, message: 'Query exceeds maximum length of 2000 characters' });
    }

    // Save user message to database
    await prisma.chatMessage.create({
        data: {
            userId,
            sender: 'user',
            text: query.trim()
        }
    });

    const startTime = Date.now();
    const reply = await aiService.chatAssistant(query.trim(), userId);
    const responseTimeSec = (Date.now() - startTime) / 1000;

    // Save AI response to database
    await prisma.chatMessage.create({
        data: {
            userId,
            sender: 'bot',
            text: reply,
            responseTime: responseTimeSec
        }
    });

    res.status(200).json({ success: true, text: reply, responseTime: responseTimeSec });
});

// Fetch previous conversation history
exports.getChatHistory = asyncWrapper(async (req, res, next) => {
    const userId = req.user.userId;
    const messages = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' }
    });
    res.status(200).json({ success: true, messages });
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
        insights = await aiService.callGeminiAPI(prompt);
    } catch (e) {
        console.error(JSON.stringify({
            event: "CONTROLLER_INSIGHTS_FAILURE",
            error: e.message,
            stack: e.stack,
            timestamp: new Date().toISOString()
        }));
        insights = `**Performance Evaluation Fallback**:\nYour average task grade is **${avgTaskScore}/10** and your report grade is **${avgReportScore}/10** with an attendance of **${attendanceRate}%**.\n- *Strength*: Steady report filing.\n- *Advise*: Focus on solving daily tasks on time to maximize performance rankings.`;
    }

    res.status(200).json({ success: true, data: insights });
});

// Query chat assistant with streaming response (SSE)
exports.streamQueryIntelligence = asyncWrapper(async (req, res, next) => {
    const { query } = req.body;
    const userId = req.user.userId;

    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ success: false, message: 'Query is required and must be a string' });
    }

    if (query.trim().length > 2000) {
        return res.status(400).json({ success: false, message: 'Query exceeds maximum length of 2000 characters' });
    }

    // Save user query to database
    await prisma.chatMessage.create({
        data: {
            userId,
            sender: 'user',
            text: query.trim()
        }
    });

    // Setup Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const startTime = Date.now();
    let botReply = '';

    const geminiReq = aiService.streamGeminiAPI(
        query.trim(),
        (chunk) => {
            botReply += chunk;
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        },
        async (err) => {
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.end();
        },
        async () => {
            const responseTimeSec = (Date.now() - startTime) / 1000;
            
            // Save bot reply to database on successful stream completion
            await prisma.chatMessage.create({
                data: {
                    userId,
                    sender: 'bot',
                    text: botReply,
                    responseTime: responseTimeSec
                }
            });

            res.write(`data: ${JSON.stringify({ done: true, responseTime: responseTimeSec })}\n\n`);
            res.end();
        }
    );

    req.on('close', () => {
        if (geminiReq) {
            geminiReq.destroy();
        }
    });
});

// Fetch AI metrics and daily usage statistics for the analytics dashboard
exports.getAiAnalytics = asyncWrapper(async (req, res, next) => {
    // 1. Get total requests (bot messages)
    const totalRequests = await prisma.chatMessage.count({
        where: { sender: 'bot' }
    });

    // 2. Get failed requests
    // We identify failures by the error prefix '⚠️' or local fallback marker
    const failedRequests = await prisma.chatMessage.count({
        where: {
            sender: 'bot',
            OR: [
                { text: { startsWith: '⚠️' } },
                { text: { contains: '[Neural Engine Offline Mode]' } }
            ]
        }
    });

    const successRequests = totalRequests - failedRequests;
    const successRate = totalRequests > 0 ? (successRequests / totalRequests) * 100 : 100;

    // 3. Average latency
    const latencyAggregate = await prisma.chatMessage.aggregate({
        where: {
            sender: 'bot',
            responseTime: { not: null },
            NOT: [
                { text: { startsWith: '⚠️' } },
                { text: { contains: '[Neural Engine Offline Mode]' } }
            ]
        },
        _avg: {
            responseTime: true
        }
    });
    const avgLatency = latencyAggregate._avg.responseTime || 0;

    // 4. Cache Stats
    const cacheStats = aiService.getCacheStats();

    // 5. Daily usage (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const messages = await prisma.chatMessage.findMany({
        where: {
            createdAt: { gte: sevenDaysAgo },
            sender: 'bot'
        },
        select: {
            createdAt: true
        }
    });

    const dailyUsage = {};
    // Pre-populate last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dailyUsage[key] = 0;
    }

    messages.forEach(m => {
        const key = m.createdAt.toISOString().split('T')[0];
        if (dailyUsage[key] !== undefined) {
            dailyUsage[key]++;
        }
    });

    res.status(200).json({
        success: true,
        data: {
            totalRequests,
            successRate,
            failedRequests,
            avgLatency,
            cacheHits: cacheStats.cacheHits,
            dailyUsage
        }
    });
});
