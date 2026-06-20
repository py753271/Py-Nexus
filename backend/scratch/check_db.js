const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    include: {
        _count: {
            select: { reports: true, threads: true }
        }
    }
  });
  console.log("Users and their counts:");
  users.forEach(u => {
    console.log(`User: ${u.name} (ID: ${u.id}, Email: ${u.email})`);
    console.log(`- Reports: ${u._count.reports}`);
    console.log(`- Threads: ${u._count.threads}`);
  });
  process.exit(0);
}

check();
