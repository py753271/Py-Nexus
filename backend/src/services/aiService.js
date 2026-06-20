const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const callGeminiAPI = (prompt) => {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return reject(new Error("GEMINI_API_KEY is not configured."));
        }

        const data = JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    const responseText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (responseText) {
                        resolve(responseText);
                    } else {
                        reject(new Error("Failed to parse Gemini API response."));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
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
