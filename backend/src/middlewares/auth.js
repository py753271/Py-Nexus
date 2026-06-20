const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is missing.');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, role }
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        const userRole = (req.user?.role || "").toUpperCase();
        const allowedRoles = roles.map(r => r.toUpperCase());

        if (!req.user || !allowedRoles.includes(userRole)) {
            console.warn(`[Auth] Access Denied. User Role: ${req.user?.role}, Required Roles: ${roles}`);
            return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
        }
        console.log(`[Auth] Access Granted. User Role: ${req.user.role}`);
        next();
    };
};

const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Access denied. Unauthorized.' });
            }
            // Admin role bypassed for all permissions
            if (req.user.role === 'ADMIN') {
                return next();
            }

            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                include: {
                    roleRef: {
                        include: {
                            permissions: true
                        }
                    }
                }
            });

            if (!user || !user.roleRef) {
                return res.status(403).json({ success: false, message: 'Access denied. Role not configured.' });
            }

            const hasPerm = user.roleRef.permissions.some(p => p.name === permission);
            if (!hasPerm) {
                console.warn(`[Auth] Permission Denied. User: ${user.email}, Required Permission: ${permission}`);
                return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    verifyToken,
    requireRole,
    requirePermission
};
