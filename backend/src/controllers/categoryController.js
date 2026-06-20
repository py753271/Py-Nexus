const prisma = require('../config/db');
const { asyncWrapper } = require('../middlewares/errorHandlers');

exports.getAllCategories = asyncWrapper(async (req, res) => {
    const categories = await prisma.category.findMany();
    res.status(200).json({ success: true, data: categories });
});

exports.createCategory = asyncWrapper(async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ success: true, data: category });
});

exports.deleteCategory = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Category deleted' });
});
