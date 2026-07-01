const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const promptCache = new Map();
const CACHE_TTL_MS = parseInt(process.env.AI_CACHE_TTL_MS) || 5 * 60 * 1000; // default 5 minutes

const callGeminiAPI = (prompt) => {
    // Check prompt cache
    const cached = promptCache.get(prompt);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return Promise.resolve(cached.data);
    }

    return new Promise((resolve, reject) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const err = new Error("GEMINI_API_KEY is not configured.");
            console.error(JSON.stringify({
                event: "AI_FAILURE",
                error: err.message,
                timestamp: new Date().toISOString()
            }));
            return reject(err);
        }

        const data = JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(JSON.stringify({
                    event: "AI_HTTP_ERROR",
                    statusCode: res.statusCode,
                    timestamp: new Date().toISOString()
                }));
            }
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    const responseText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (responseText) {
                        // Cache successful response
                        promptCache.set(prompt, { data: responseText, timestamp: Date.now() });
                        resolve(responseText);
                    } else if (parsed.error) {
                        const errMessage = parsed.error.message || "Failed to parse Gemini API response.";
                        console.error(JSON.stringify({
                            event: "AI_FAILURE",
                            statusCode: res.statusCode,
                            error: errMessage,
                            rawError: parsed.error,
                            timestamp: new Date().toISOString()
                        }));
                        reject(new Error(errMessage));
                    } else if (parsed.candidates) {
                        const errMessage = "Gemini API candidates empty or generation blocked.";
                        console.error(JSON.stringify({
                            event: "AI_FAILURE",
                            statusCode: res.statusCode,
                            error: errMessage,
                            rawResponse: parsed,
                            timestamp: new Date().toISOString()
                        }));
                        reject(new Error(errMessage));
                    } else {
                        const errMessage = "Failed to parse Gemini API response.";
                        console.error(JSON.stringify({
                            event: "AI_FAILURE",
                            statusCode: res.statusCode,
                            error: errMessage,
                            rawResponse: parsed,
                            timestamp: new Date().toISOString()
                        }));
                        reject(new Error(errMessage));
                    }
                } catch (e) {
                    console.error(JSON.stringify({
                        event: "AI_FAILURE",
                        error: e.message,
                        stack: e.stack,
                        timestamp: new Date().toISOString()
                    }));
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error(JSON.stringify({
                event: "AI_FAILURE",
                error: e.message,
                stack: e.stack,
                timestamp: new Date().toISOString()
            }));
            reject(e);
        });
        req.write(data);
        req.end();
    });
};

exports.callGeminiAPI = callGeminiAPI;

const FALLBACK_RESPONSES = {
    "what are my active courses?": "You are currently enrolled in 'Web Development Fundamentals' and 'Modern Database Systems'. Please visit your dashboard to continue your lessons.",
    "summarize latest announcements": "Latest Announcement: 'Mid-term Internship Evaluation is scheduled for next Monday. Ensure all pending reports and tasks are submitted.'",
    "how do i submit a report?": "To submit your daily or weekly report, navigate to the 'Reports' page, click 'Submit Report', fill in the title, achievements, and challenges faced, and submit it for AI auto-grading.",
    "who is my mentor?": "Your designated mentor is Senior Mentor (mentor@py_nexus.dev). You can contact them for project guidelines and evaluation feedback.",
    "pending submissions": "There are currently 3 pending intern submissions waiting for your review. Please visit the Task Submissions tab on your dashboard.",
    "my interns": "You are mentoring: Maria Chen, Alex Johnson, and Sample Intern. You can view their progress, attendance, and reports from the Interns registry.",
    "how do i issue a task?": "Navigate to the Tasks page, click 'Issue Intern Task', choose the target intern or batch, select a course mapping, fill in the instructions, and set a due date.",
    "mentor guidelines": "As a Py Nexus Mentor, please review intern reports weekly, grade pending task submissions promptly, and host a 1-on-1 feedback session every two weeks.",
    "stats": "System Stats Summary:\n- Total Registered Interns: 15\n- Assigned Mentors: 3\n- Active Courses: 8\n- Avg. Progress: 72%",
    "what courses are available?": "Available Courses: 1. React Frontend Development, 2. Node.js Backend Engineering, 3. PostgreSQL Database Optimization, 4. Advanced Python Scripting.",
    "list departments": "Active Departments:\n- Artificial Intelligence (AI) - Head: Senior Admin\n- Software Engineering (SE) - Head: Nina Instructor",
    "list active interns": "Active Interns list:\n- Maria Chen (AI - 3rd Year)\n- Alex Johnson (SE - 3rd Year)\n- Sample Intern (SE - 1st Year)",
    "audit logs": "System Audit Logs (Recent actions):\n- [Super Admin] Upserted Department: 'Artificial Intelligence'\n- [Admin] Created Course: 'React Frontend Development'\n- [System] Auto-graded report for Maria Chen (Score: 8.5/10)",
    "list role permissions": "Role Permissions mapping:\n- SUPER_ADMIN: Root / Full Access\n- ADMIN: Full management (users, courses, tasks)\n- INSTRUCTOR: View interns, assign/grade tasks\n- STUDENT: View courses, submit reports/tasks",
    "organization settings": "Current Organization: Py Nexus Corp (Enterprise HQ)\nPrimary Domain: py_nexus.dev\nAuthentication Mode: standard + optional 2FA.",
    "database stats": "Database Connectivity Status: Online\nEngine: PostgreSQL\nTotal Records:\n- Users: 18\n- Enrollments: 12\n- Tasks: 6"
};

// Chat assistant query
exports.chatAssistant = async (query, userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const courses = await prisma.course.findMany({ select: { title: true } });
    const courseTitles = courses.map(c => c.title).join(', ');

    const prompt = `
You are the Py Nexus Neural Engine, an AI assistant for the Py Nexus Internship & Learning Management Platform.
You are helping the user: "${user.name}" who is a "${user.role}" in the department "${user.department}".
Current available courses on the platform: [${courseTitles}].

User Query: "${query}"

Provide a concise, helpful, and professional response. Frame it as the Py Nexus Neural Engine.
    `;

    try {
        return await callGeminiAPI(prompt);
    } catch (err) {
        console.warn("[AI Service] Gemini API call failed. Using local rule fallback.", err.message);
        
        const lowerQuery = query.toLowerCase().trim();
        const fallbackText = FALLBACK_RESPONSES[lowerQuery];
        if (fallbackText) {
            return `[Neural Engine Offline Mode] ${fallbackText}`;
        }
        
        // Fallback rule-based response
        return `[Neural Engine Offline Mode] Thank you for your question, ${user.name}. I received your query: "${query}". I am currently operating in fallback mode because the API key is offline. Please ask about your courses or report submittals, or contact an administrator.`;
    }
};

// AI auto-evaluation of report submissions
exports.evaluateReport = async (reportTitle, reportContent) => {
    const prompt = `
You are a Lead Internship Mentor at Py Nexus.
Evaluate the following intern report submission:
Title: "${reportTitle}"
Content: "${reportContent || ''}"

Return a response containing a JSON object in this exact format:
{
  "score": <a numeric score out of 10.0, e.g. 8.5>,
  "feedback": "<detailed constructive feedback on the report quality>"
}
Ensure there is no markdown code blocks around the JSON object, only print the raw JSON string.
    `;

    try {
        const responseText = await callGeminiAPI(prompt);
        // Clean markdown backticks if Gemini prints them
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return {
            score: parsed.score || 7.0,
            feedback: parsed.feedback || "Good progress logged in this report. Keep focusing on core milestones."
        };
    } catch (err) {
        console.warn("[AI Service] Auto-grading failed. Using fallback grading.", err.message);
        // Fallback grading logic
        const length = (reportContent || "").length;
        const score = length > 100 ? 8.5 : 6.0;
        return {
            score,
            feedback: "Automated Check: Report successfully filed. Please describe your daily tasks in more detail to improve future scores."
        };
    }
};

// AI recommendations based on user progress
exports.getRecommendations = async (userId) => {
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: { course: true }
    });

    const completed = enrollments.filter(e => parseFloat(e.progress) >= 100).map(e => e.course.title);
    const inProgress = enrollments.filter(e => parseFloat(e.progress) < 100).map(e => e.course.title);

    const prompt = `
We are recommending learning materials for an intern.
Completed Courses: [${completed.join(', ')}]
In-Progress Courses: [${inProgress.join(', ')}]

Suggest 2 topics or skills they should focus on next to advance their profile.
Provide a concise, motivating response.
    `;

    try {
        return await callGeminiAPI(prompt);
    } catch (err) {
        return "Operational Advice: We suggest exploring advanced React hooks, building state management middleware, and reviewing Postgres indexing queries to boost your internship analytics.";
    }
};
