const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all threads
exports.getThreads = async (req, res, next) => {
    try {
        const threads = await prisma.forumThread.findMany({
            include: {
                author: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: threads });
    } catch (error) {
        next(error);
    }
};

// Create a new thread
exports.createThread = async (req, res, next) => {
    try {
        const userId = parseInt(req.user.userId);
        const { title, category } = req.body;
        const thread = await prisma.forumThread.create({
            data: {
                title,
                category,
                authorId: userId
            },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
        res.status(201).json({ success: true, data: thread });
    } catch (error) {
        console.error("FORUM CREATION ERROR:", error);
        next(error);
    }
};

// Upvote a thread
exports.upvoteThread = async (req, res, next) => {
    try {
        const { id } = req.params;
        const thread = await prisma.forumThread.update({
            where: { id: parseInt(id) },
            data: {
                votes: { increment: 1 }
            },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
        res.status(200).json({ success: true, data: thread });
    } catch (error) {
        next(error);
    }
};
