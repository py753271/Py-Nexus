const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Generate certificate
exports.issueCertificate = async (userId, courseId) => {
    const uid = parseInt(userId);
    const cid = parseInt(courseId);

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: cid } });
    if (!course) {
        throw new Error('Course not found');
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
        where: { userId: uid, courseId: cid }
    });
    if (!enrollment) {
        throw new Error('User not enrolled in this course');
    }

    // Must be 100% complete
    const progress = parseFloat(enrollment.progress) || 0;
    if (progress < 100) {
        throw new Error('Course progress must be 100% to receive a certificate');
    }

    // Check if already issued
    const existing = await prisma.certificate.findFirst({
        where: { userId: uid, courseId: cid }
    });
    if (existing) {
        return existing;
    }

    // Generate certificate hash (SHA256 based on user and course details)
    const rawData = `${uid}-${cid}-${Date.now()}`;
    const hash = crypto.createHash('sha256').update(rawData).digest('hex').substring(0, 16);

    return await prisma.certificate.create({
        data: {
            userId: uid,
            courseId: cid,
            certificateHash: hash,
            downloadUrl: `/certificates/verify/${hash}`
        },
        include: {
            course: { select: { title: true } },
            user: { select: { name: true, email: true } }
        }
    });
};

// Verify certificate by hash
exports.verifyCertificate = async (hash) => {
    const cert = await prisma.certificate.findUnique({
        where: { certificateHash: hash },
        include: {
            user: { select: { name: true, email: true, department: true } },
            course: { select: { title: true } }
        }
    });

    if (!cert) {
        throw new Error('Certificate invalid or expired');
    }

    return cert;
};
