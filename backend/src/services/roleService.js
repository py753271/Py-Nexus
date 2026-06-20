const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getRoles = async () => {
    return await prisma.role.findMany({
        include: {
            permissions: {
                select: { id: true, name: true, description: true }
            },
            _count: {
                select: { users: true }
            }
        }
    });
};

exports.createRole = async (name, description, permissionIds) => {
    const cleanName = name.toUpperCase().trim();
    const existing = await prisma.role.findUnique({ where: { name: cleanName } });
    if (existing) {
        throw new Error('Role already exists');
    }

    const connectPerms = Array.isArray(permissionIds)
        ? permissionIds.map(id => ({ id: parseInt(id) }))
        : [];

    return await prisma.role.create({
        data: {
            name: cleanName,
            description,
            permissions: {
                connect: connectPerms
            }
        },
        include: {
            permissions: true
        }
    });
};

exports.updateRole = async (id, description, permissionIds) => {
    const roleId = parseInt(id);
    const existing = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existing) {
        throw new Error('Role not found');
    }

    const connectPerms = Array.isArray(permissionIds)
        ? permissionIds.map(id => ({ id: parseInt(id) }))
        : [];

    return await prisma.role.update({
        where: { id: roleId },
        data: {
            description: description !== undefined ? description : undefined,
            permissions: {
                set: connectPerms
            }
        },
        include: {
            permissions: true
        }
    });
};

exports.assignUserRole = async (userId, roleId) => {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
        throw new Error('User not found');
    }

    const role = await prisma.role.findUnique({ where: { id: parseInt(roleId) } });
    if (!role) {
        throw new Error('Role not found');
    }

    let enumRole = user.role;
    if (["ADMIN", "INSTRUCTOR", "STUDENT"].includes(role.name)) {
        enumRole = role.name;
    }

    return await prisma.user.update({
        where: { id: user.id },
        data: {
            roleId: role.id,
            role: enumRole
        },
        select: { id: true, name: true, email: true, role: true, roleId: true }
    });
};

exports.getPermissions = async () => {
    return await prisma.permission.findMany({
        orderBy: { name: 'asc' }
    });
};
