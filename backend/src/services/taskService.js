const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a task
exports.createTask = async (title, description, dueDate, priority, assignedToId, createdById) => {
    const intern = await prisma.user.findFirst({
        where: { id: parseInt(assignedToId), role: 'STUDENT' }
    });
    if (!intern) {
        throw new Error('Intern not found');
    }

    return await prisma.task.create({
        data: {
            title,
            description,
            dueDate: new Date(dueDate),
            priority,
            assignedToId: parseInt(assignedToId),
            createdById: parseInt(createdById)
        }
    });
};

// Get tasks
exports.getTasks = async (userId, role) => {
    const uid = parseInt(userId);
    if (role === 'STUDENT') {
        return await prisma.task.findMany({
            where: { assignedToId: uid },
            include: {
                createdBy: { select: { name: true } },
                submissions: { select: { status: true, score: true, feedback: true, submittedAt: true } }
            },
            orderBy: { dueDate: 'asc' }
        });
    } else {
        // Admins/Instructors see tasks they created or all tasks
        return await prisma.task.findMany({
            include: {
                assignedTo: { select: { name: true, email: true, department: true } },
                createdBy: { select: { name: true } },
                submissions: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
};

// Submit a task
exports.submitTask = async (taskId, submitterId, content) => {
    const task = await prisma.task.findUnique({ where: { id: parseInt(taskId) } });
    if (!task) {
        throw new Error('Task not found');
    }

    if (task.assignedToId !== parseInt(submitterId)) {
        throw new Error('This task is not assigned to you');
    }

    // Upsert submission
    const existing = await prisma.taskSubmission.findFirst({
        where: {
            taskId: task.id,
            submitterId: parseInt(submitterId)
        }
    });

    if (existing) {
        return await prisma.taskSubmission.update({
            where: { id: existing.id },
            data: {
                content,
                status: 'Pending', // reset review
                submittedAt: new Date()
            }
        });
    }

    // Set task status to Review
    await prisma.task.update({
        where: { id: task.id },
        data: { status: 'Review' }
    });

    return await prisma.taskSubmission.create({
        data: {
            taskId: task.id,
            submitterId: parseInt(submitterId),
            content,
            status: 'Pending'
        }
    });
};

// Review submission
exports.reviewSubmission = async (submissionId, reviewerId, score, feedback) => {
    const subId = parseInt(submissionId);
    const submission = await prisma.taskSubmission.findUnique({
        where: { id: subId },
        include: { task: true }
    });

    if (!submission) {
        throw new Error('Submission not found');
    }

    const updated = await prisma.taskSubmission.update({
        where: { id: subId },
        data: {
            score: parseFloat(score),
            feedback,
            status: 'Reviewed'
        }
    });

    // Mark task as Completed
    await prisma.task.update({
        where: { id: submission.taskId },
        data: { status: 'Completed' }
    });

    return updated;
};
