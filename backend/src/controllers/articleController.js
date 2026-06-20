const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all articles
exports.getArticles = async (req, res, next) => {
    try {
        const articles = await prisma.article.findMany({
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: articles });
    } catch (error) {
        next(error);
    }
};

// Create a new article (Admin only)
exports.createArticle = async (req, res, next) => {
    try {
        const { title, category } = req.body;
        const article = await prisma.article.create({
            data: {
                title,
                category,
                authorId: req.user.userId
            }
        });
        res.status(201).json({ success: true, data: article });
    } catch (error) {
        next(error);
    }
};

// Toggle helpfullness or verify
exports.verifyArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const current = await prisma.article.findUnique({ where: { id: parseInt(id) } });
        const updated = await prisma.article.update({
            where: { id: parseInt(id) },
            data: { verified: !current.verified }
        });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// Delete article
exports.deleteArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.article.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ success: true, message: 'Article purged' });
    } catch (error) {
        next(error);
    }
};
