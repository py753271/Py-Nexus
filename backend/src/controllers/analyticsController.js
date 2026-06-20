const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getGlobalStats = async (req, res, next) => {
    try {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        const [studentCount, courseCount, enrollmentCount, categories, reports, users, threads, avgScoreResult] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.course.count(),
            prisma.enrollment.count(),
            prisma.category.findMany({ include: { _count: { select: { courses: true } } } }),
            prisma.report.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
            prisma.user.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { name: true, createdAt: true, role: true } }),
            prisma.forumThread.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } }),
            prisma.report.aggregate({ _avg: { score: true } })
        ]);

        const avgScore = avgScoreResult._avg.score ? parseFloat(avgScoreResult._avg.score).toFixed(1) : "0.0";

        // Construct Event Stream
        const events = [];
        reports.forEach(r => events.push({ action: "Report submitted", detail: `${r.user.name} - ${r.title}`, time: r.createdAt, color: "orange" }));
        users.forEach(u => events.push({ action: "New user registered", detail: `${u.name} (${u.role})`, time: u.createdAt, color: u.role === 'ADMIN' ? 'purple' : 'green' }));
        threads.forEach(t => events.push({ action: "Q&A Thread", detail: t.title, time: t.createdAt, color: "blue" }));

        const eventStream = events
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 10)
            .map(e => ({
                action: e.action,
                detail: e.detail,
                time: "Recently", // Simplification for now
                color: e.color
            }));

        res.status(200).json({
            success: true,
            data: {
                studentCount,
                courseCount,
                enrollmentCount,
                avgScore: `${avgScore}/10`,
                eventStream,
                categoryStats: categories.map(c => ({ name: c.name, count: c._count.courses }))
            }
        });
    } catch (error) {
        console.error("GLOBAL ANALYTICS ERROR:", error);
        next(error);
    }
};

exports.getStudentActivity = async (req, res, next) => {
    try {
        res.setHeader('Cache-Control', 'no-no-cache, no-store, must-revalidate');
        const userId = parseInt(req.user.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User Identity" });
        }
        console.log(`[Analytics] Computing stats for user ID: ${userId}`);

        // 1. Stats Counters
        const [totalReports, pendingReports, forumPosts, articles, enrollments] = await Promise.all([
            prisma.report.count({ where: { userId } }),
            prisma.report.count({ where: { userId, status: 'Pending' } }),
            prisma.forumThread.count({ where: { authorId: userId } }),
            prisma.article.findMany({ 
                take: 5, 
                orderBy: { views: 'desc' },
                select: { title: true, views: true, category: true }
            }),
            prisma.enrollment.findMany({
                where: { userId },
                include: { course: { include: { category: true } } }
            })
        ]);

        // 2. Weekly Reports (Last 7 weeks)
        const reports = await prisma.report.findMany({
            where: { userId },
            select: { createdAt: true }
        });

        const weeklyReports = {};
        for(let i=0; i<7; i++) { weeklyReports[`Wk ${7-i}`] = 0; }

        reports.forEach(r => {
            if (r.createdAt && typeof r.createdAt.getDate === 'function') {
                const day = r.createdAt.getDate();
                const weekNum = Math.min(Math.ceil(day / 7), 5); // 1-5
                const key = `Wk ${weekNum}`;
                if (weeklyReports[key] !== undefined) weeklyReports[key]++;
            }
        });
        const weeklyData = Object.keys(weeklyReports).map(key => ({ week: key, reports: weeklyReports[key] }));

        // 3. Skill Distribution
        const skillMap = {};
        enrollments.forEach(e => {
            if (e.course && e.course.category) {
                const cat = e.course.category.name;
                const prog = parseFloat(e.progress) || 0;
                skillMap[cat] = (skillMap[cat] || 0) + prog;
            }
        });
        
        const totalProgress = Object.values(skillMap).reduce((a, b) => a + b, 0) || 1;
        const skillDist = Object.keys(skillMap).map(name => ({
            name,
            value: Math.round((skillMap[name] / totalProgress) * 100)
        }));

        res.status(200).json({
            success: true,
            data: {
                counters: {
                    totalReports: totalReports || 0,
                    pendingReports: pendingReports || 0,
                    forumPosts: forumPosts || 0,
                    totalViews: articles.reduce((sum, a) => sum + (parseInt(a.views) || 0), 0)
                },
                weeklyReports: weeklyData,
                skillDistribution: skillDist.length ? skillDist : [{ name: "Exploration", value: 100 }],
                topArticles: articles || [],
                taskProgress: enrollments.slice(0, 4).map(e => ({
                    task: (e.course?.title || "Project").split(' ')[0],
                    pct: parseFloat(e.progress) || 0
                }))
            }
        });
    } catch (error) {
        console.error("PERSONAL ANALYTICS ERROR:", error);
        next(error);
    }
};
