const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Get all departments
exports.getAllDepartments = asyncWrapper(async (req, res, next) => {
    const departments = await prisma.department.findMany({
        include: {
            _count: {
                select: { users: true }
            }
        },
        orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: departments });
});

// Create a department
exports.createDepartment = asyncWrapper(async (req, res, next) => {
    const { name, code } = req.body;
    if (!name || !code) {
        return res.status(400).json({ success: false, message: 'Department name and code are required' });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.department.findFirst({
        where: {
            OR: [
                { name },
                { code: cleanCode }
            ]
        }
    });

    if (existing) {
        return res.status(400).json({ success: false, message: 'Department name or code already exists' });
    }

    const org = await prisma.organization.findFirst();
    const newDept = await prisma.department.create({
        data: {
            name,
            code: cleanCode,
            organizationId: org ? org.id : null
        }
    });

    res.status(201).json({ success: true, data: newDept });
});

// Update a department
exports.updateDepartment = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { name, code } = req.body;

    const deptId = parseInt(id);
    const existing = await prisma.department.findUnique({ where: { id: deptId } });
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const updated = await prisma.department.update({
        where: { id: deptId },
        data: {
            name: name || undefined,
            code: code ? code.toUpperCase().trim() : undefined
        }
    });

    res.status(200).json({ success: true, data: updated });
});

// Delete a department
exports.deleteDepartment = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const deptId = parseInt(id);

    const existing = await prisma.department.findUnique({ where: { id: deptId } });
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await prisma.department.delete({ where: { id: deptId } });
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
});
