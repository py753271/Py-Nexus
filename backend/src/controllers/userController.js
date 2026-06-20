const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

// Create a new user (Admin only)
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT'
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error("ADMIN USER CREATION ERROR:", error);
        next(error);
    }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};

// Get own profile (Self)
exports.getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, name: true, email: true, role: true, department: true, college: true, dob: true, year: true, linkedin: true, skills: true }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// Update Profile (Self)
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, password, department, college, dob, year, linkedin, skills } = req.body;
        
        // Only include fields that were actually sent (not undefined)
        // This prevents Prisma from setting existing values to null
        let updateData = {};
        if (name !== undefined && name !== '') updateData.name = name;
        if (department !== undefined) updateData.department = department;
        if (college !== undefined) updateData.college = college;
        if (dob !== undefined) updateData.dob = dob;
        if (year !== undefined) updateData.year = year;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (skills !== undefined) updateData.skills = skills;
        
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, department: true, college: true, dob: true, year: true, linkedin: true, skills: true }
        });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// Update specific user details (Admin only)
exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role, departmentId, roleId, mentorId } = req.body;

        let updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        
        if (departmentId !== undefined) {
            updateData.departmentId = departmentId ? parseInt(departmentId) : null;
        }
        
        if (roleId !== undefined) {
            updateData.roleId = roleId ? parseInt(roleId) : null;
            // Sync role enum if it matches one of the system roles
            const roleObj = await prisma.role.findUnique({ where: { id: parseInt(roleId) } });
            if (roleObj && ["ADMIN", "INSTRUCTOR", "STUDENT"].includes(roleObj.name)) {
                updateData.role = roleObj.name;
            }
        }
        
        if (mentorId !== undefined) {
            updateData.mentorId = mentorId ? parseInt(mentorId) : null;
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                departmentId: true,
                roleId: true,
                mentorId: true
            }
        });

        res.status(200).json({ success: true, message: 'User updated successfully', data: user });
    } catch (error) {
        next(error);
    }
};

