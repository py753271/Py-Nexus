const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Get all roles
exports.getAllRoles = asyncWrapper(async (req, res, next) => {
    const roles = await prisma.role.findMany({
        include: {
            permissions: {
                select: { id: true, name: true, description: true }
            },
            _count: {
                select: { users: true }
            }
        }
    });
    res.status(200).json({ success: true, data: roles });
});

// Create role
exports.createRole = asyncWrapper(async (req, res, next) => {
    const { name, description, permissionIds } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const cleanName = name.toUpperCase().trim();
    const existing = await prisma.role.findUnique({ where: { name: cleanName } });
    if (existing) {
        return res.status(400).json({ success: false, message: 'Role already exists' });
    }

    const connectPerms = Array.isArray(permissionIds) 
        ? permissionIds.map(id => ({ id: parseInt(id) })) 
        : [];

    const newRole = await prisma.role.create({
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

    res.status(201).json({ success: true, data: newRole });
});

// Update role permissions/details
exports.updateRole = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { description, permissionIds } = req.body;

    const roleId = parseInt(id);
    const existing = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const connectPerms = Array.isArray(permissionIds)
        ? permissionIds.map(id => ({ id: parseInt(id) }))
        : [];

    const updated = await prisma.role.update({
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

    res.status(200).json({ success: true, data: updated });
});

// Assign role to user
exports.assignUserRole = asyncWrapper(async (req, res, next) => {
    const { userId, roleId } = req.body;
    if (!userId || !roleId) {
        return res.status(400).json({ success: false, message: 'User ID and Role ID are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const role = await prisma.role.findUnique({ where: { id: parseInt(roleId) } });
    if (!role) {
        return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Map UserRole enum accordingly if applicable
    let enumRole = user.role;
    if (["ADMIN", "INSTRUCTOR", "STUDENT"].includes(role.name)) {
        enumRole = role.name;
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            roleId: role.id,
            role: enumRole
        },
        select: { id: true, name: true, email: true, role: true, roleId: true }
    });

    res.status(200).json({ success: true, message: 'Role assigned successfully', data: updatedUser });
});

// Get all system permissions
exports.getAllPermissions = asyncWrapper(async (req, res, next) => {
    const permissions = await prisma.permission.findMany({
        orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: permissions });
});
