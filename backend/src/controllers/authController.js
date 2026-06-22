const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { asyncWrapper } = require('../middlewares/errorHandlers');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const generateToken = (userId, role) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is missing.');
    }
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

exports.register = asyncWrapper(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || 'STUDENT'
        }
    });

    const token = generateToken(user.id, user.role);
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        success: true,
        data: { 
            id: user.id, name: user.name, email: user.email, role: user.role,
            department: user.department, college: user.college, dob: user.dob, year: user.year, linkedin: user.linkedin, skills: user.skills
        },
        token
    });
});

exports.login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    console.log("[Auth Login Attempt] email:", email, "password:", password);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isTwoFactorActive) {
        return res.status(200).json({
            success: true,
            requires2FA: true,
            userId: user.id,
            message: 'Secondary authentication required'
        });
    }

    const token = generateToken(user.id, user.role);
    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success: true,
        requires2FA: false,
        data: { 
            id: user.id, name: user.name, email: user.email, role: user.role,
            department: user.department, college: user.college, dob: user.dob, year: user.year, linkedin: user.linkedin, skills: user.skills
        },
        token
    });
});

exports.verify2FALogin = asyncWrapper(async (req, res) => {
    const { userId, token } = req.body;

    if (!userId || !token) {
        return res.status(400).json({ success: false, message: 'User ID and OTP token are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user || !user.isTwoFactorActive) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA session' });
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token
    });

    if (!verified) {
        return res.status(401).json({ success: false, message: 'Invalid authenticator code' });
    }

    const jwtToken = generateToken(user.id, user.role);
    res.cookie('token', jwtToken, cookieOptions);

    res.status(200).json({
        success: true,
        data: { 
            id: user.id, name: user.name, email: user.email, role: user.role,
            department: user.department, college: user.college, dob: user.dob, year: user.year, linkedin: user.linkedin, skills: user.skills
        },
        token: jwtToken
    });
});

exports.getMe = asyncWrapper(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { 
            id: true, name: true, email: true, role: true, createdAt: true,
            department: true, college: true, dob: true, year: true, linkedin: true, skills: true
        }
    });

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

exports.logout = asyncWrapper(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: 'User logged out successfully' });
});

exports.generate2FA = asyncWrapper(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const secret = speakeasy.generateSecret({ name: `Py Nexus (${user.email})` });

    await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret.base32 }
    });

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) return res.status(500).json({ success: false, message: 'Error generating QR code' });
        res.status(200).json({ success: true, qrCode: data_url, secret: secret.base32 });
    });
});

exports.verify2FASetup = asyncWrapper(async (req, res) => {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ success: false, message: '2FA setup not initialized' });
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        await prisma.user.update({
            where: { id: user.id },
            data: { isTwoFactorActive: true }
        });
        res.status(200).json({ success: true, message: 'Two-factor authentication successfully enabled' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
});

exports.disable2FA = asyncWrapper(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await prisma.user.update({
        where: { id: user.id },
        data: { isTwoFactorActive: false, twoFactorSecret: null }
    });

    res.status(200).json({ success: true, message: 'Two-factor authentication disabled' });
});
