const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDepartments = async () => {
    return await prisma.department.findMany({
        include: {
            _count: {
                select: { users: true }
            }
        },
        orderBy: { name: 'asc' }
    });
};

exports.createDepartment = async (name, code, organizationId) => {
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
        throw new Error('Department name or code already exists');
    }

    return await prisma.department.create({
        data: {
            name,
            code: cleanCode,
            organizationId
        }
    });
};

exports.updateDepartment = async (id, name, code) => {
    const deptId = parseInt(id);
    const existing = await prisma.department.findUnique({ where: { id: deptId } });
    if (!existing) {
        throw new Error('Department not found');
    }

    return await prisma.department.update({
        where: { id: deptId },
        data: {
            name: name || undefined,
            code: code ? code.toUpperCase().trim() : undefined
        }
    });
};

exports.deleteDepartment = async (id) => {
    const deptId = parseInt(id);
    const existing = await prisma.department.findUnique({ where: { id: deptId } });
    if (!existing) {
        throw new Error('Department not found');
    }

    return await prisma.department.delete({ where: { id: deptId } });
};
