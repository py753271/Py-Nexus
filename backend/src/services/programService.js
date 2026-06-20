const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Programs CRUD
exports.getPrograms = async () => {
    return await prisma.internshipProgram.findMany({
        include: {
            batches: true,
            _count: { select: { users: true } }
        }
    });
};

exports.createProgram = async (name, description, duration) => {
    const existing = await prisma.internshipProgram.findUnique({ where: { name } });
    if (existing) {
        throw new Error('Program name already exists');
    }

    return await prisma.internshipProgram.create({
        data: { name, description, duration: parseInt(duration) }
    });
};

// Batches CRUD
exports.getBatches = async () => {
    return await prisma.internshipBatch.findMany({
        include: {
            program: { select: { name: true } },
            _count: { select: { users: true } }
        }
    });
};

exports.createBatch = async (name, startDate, endDate, programId) => {
    const existing = await prisma.internshipBatch.findUnique({ where: { name } });
    if (existing) {
        throw new Error('Batch name already exists');
    }

    return await prisma.internshipBatch.create({
        data: {
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            programId: parseInt(programId)
        }
    });
};

// Intern Lifecycle Assignment
exports.enrollIntern = async (internId, programId, batchId) => {
    const user = await prisma.user.findFirst({
        where: { id: parseInt(internId), role: 'STUDENT' }
    });
    if (!user) {
        throw new Error('Intern not found');
    }

    return await prisma.user.update({
        where: { id: user.id },
        data: {
            programId: programId ? parseInt(programId) : null,
            batchId: batchId ? parseInt(batchId) : null,
            internshipStage: "Selected" // Advance stage from Applied
        },
        select: { id: true, name: true, programId: true, batchId: true, internshipStage: true }
    });
};

exports.updateLifecycleStage = async (internId, stage) => {
    const allowedStages = ["Applied", "Selected", "Onboarding", "Training", "Active", "Completed", "Certified"];
    if (!allowedStages.includes(stage)) {
        throw new Error('Invalid lifecycle stage');
    }

    const user = await prisma.user.findFirst({
        where: { id: parseInt(internId), role: 'STUDENT' }
    });
    if (!user) {
        throw new Error('Intern not found');
    }

    return await prisma.user.update({
        where: { id: user.id },
        data: { internshipStage: stage },
        select: { id: true, name: true, internshipStage: true }
    });
};
