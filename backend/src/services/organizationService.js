const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getOrganizationSpec = async () => {
    let org = await prisma.organization.findFirst({
        include: {
            departments: {
                select: { id: true, name: true, code: true }
            }
        }
    });

    if (!org) {
        org = await prisma.organization.create({
            data: {
                name: "Py Nexus Corp",
                description: "Enterprise Internship & Learning Systems Headquarters"
            },
            include: {
                departments: true
            }
        });
    }
    return org;
};

exports.updateOrganizationSpec = async (name, description) => {
    let org = await prisma.organization.findFirst();
    if (!org) {
        throw new Error('Organization not found');
    }

    return await prisma.organization.update({
        where: { id: org.id },
        data: { name, description }
    });
};
