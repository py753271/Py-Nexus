const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);

  // 0. Clean up existing transaction/student records to guarantee clean execution
  console.log("Cleaning up telemetry transaction records...");
  await prisma.taskSubmission.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.enrollment.deleteMany({});

  // 1. Seed default Organization
  const org = await prisma.organization.upsert({
    where: { name: "Py Nexus Corp" },
    update: {},
    create: {
      name: "Py Nexus Corp",
      description: "Enterprise Internship & Learning Systems Headquarters"
    }
  });
  console.log("Seeded Organization:", org.name);

  // 2. Seed default Departments
  const deptAI = await prisma.department.upsert({
    where: { code: "AI" },
    update: { organizationId: org.id },
    create: {
      name: "Artificial Intelligence",
      code: "AI",
      organizationId: org.id
    }
  });

  const deptSE = await prisma.department.upsert({
    where: { code: "SE" },
    update: { organizationId: org.id },
    create: {
      name: "Software Engineering",
      code: "SE",
      organizationId: org.id
    }
  });
  console.log("Seeded Departments:", deptAI.name, ",", deptSE.name);

  // 3. Seed Permissions
  const permissionsList = [
    { name: "users:read", description: "View user lists and details" },
    { name: "users:write", description: "Create, edit, and delete users" },
    { name: "depts:read", description: "View department structures" },
    { name: "depts:write", description: "Modify departments" },
    { name: "mentors:read", description: "View mentor mapping registry" },
    { name: "mentors:write", description: "Assign mentors to interns" },
    { name: "orgs:read", description: "View organization specs" },
    { name: "orgs:write", description: "Modify organization specs" }
  ];

  const dbPermissions = {};
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm
    });
    dbPermissions[perm.name] = p;
  }
  console.log("Seeded Permissions count:", Object.keys(dbPermissions).length);

  // 4. Seed Roles and map Permissions
  // Admin Role gets all permissions
  const roleAdmin = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {
      permissions: {
        set: Object.values(dbPermissions).map(p => ({ id: p.id }))
      }
    },
    create: {
      name: "ADMIN",
      description: "System Administrator with root privileges",
      permissions: {
        connect: Object.values(dbPermissions).map(p => ({ id: p.id }))
      }
    }
  });

  // Instructor Role gets read and mentor assignment permissions
  const instructorPerms = ["users:read", "depts:read", "mentors:read", "mentors:write"];
  const roleInstructor = await prisma.role.upsert({
    where: { name: "INSTRUCTOR" },
    update: {
      permissions: {
        set: instructorPerms.map(name => ({ id: dbPermissions[name].id }))
      }
    },
    create: {
      name: "INSTRUCTOR",
      description: "Mentor / Instructor role",
      permissions: {
        connect: instructorPerms.map(name => ({ id: dbPermissions[name].id }))
      }
    }
  });

  // Student Role gets read permissions
  const studentPerms = ["depts:read", "mentors:read"];
  const roleStudent = await prisma.role.upsert({
    where: { name: "STUDENT" },
    update: {
      permissions: {
        set: studentPerms.map(name => ({ id: dbPermissions[name].id }))
      }
    },
    create: {
      name: "STUDENT",
      description: "Intern / Student role",
      permissions: {
        connect: studentPerms.map(name => ({ id: dbPermissions[name].id }))
      }
    }
  });
  console.log("Seeded Roles:", roleAdmin.name, ",", roleInstructor.name, ",", roleStudent.name);

  // 5. Seed Category List
  const categoryNames = ["Web Development", "Data Science", "Design"];
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  const categories = await prisma.category.findMany();
  const categoryByName = Object.fromEntries(categories.map((category) => [category.name, category]));

  // 6. Seed Users and link to Roles/Depts
  const users = [
    {
      email: "superadmin@py_nexus.dev",
      name: "Super Admin Console",
      password: await bcrypt.hash("superadmin123", salt),
      role: UserRole.ADMIN,
      roleId: roleAdmin.id,
      departmentId: deptAI.id,
      organizationId: org.id
    },
    {
      email: "admin@py_nexus.dev",
      name: "Admin User",
      password: await bcrypt.hash("admin123", salt),
      role: UserRole.ADMIN,
      roleId: roleAdmin.id,
      departmentId: deptAI.id,
      organizationId: org.id
    },
    {
      email: "mentor@py_nexus.dev",
      name: "Senior Mentor",
      password: await bcrypt.hash("mentor123", salt),
      role: UserRole.INSTRUCTOR,
      roleId: roleInstructor.id,
      departmentId: deptAI.id,
      organizationId: org.id
    },
    {
      email: "instructor@py_nexus.dev",
      name: "Nina Instructor",
      password: await bcrypt.hash("teach123", salt),
      role: UserRole.INSTRUCTOR,
      roleId: roleInstructor.id,
      departmentId: deptAI.id,
      organizationId: org.id
    },
    {
      email: "intern@py_nexus.dev",
      name: "Sample Intern",
      password: await bcrypt.hash("intern123", salt),
      role: UserRole.STUDENT,
      roleId: roleStudent.id,
      departmentId: deptSE.id,
      organizationId: org.id
    },
    {
      email: "alex@student.dev",
      name: "Alex Johnson",
      password: await bcrypt.hash("student123", salt),
      role: UserRole.STUDENT,
      roleId: roleStudent.id,
      departmentId: deptSE.id,
      organizationId: org.id
    },
    {
      email: "maria@student.dev",
      name: "Maria Chen",
      password: await bcrypt.hash("student123", salt),
      role: UserRole.STUDENT,
      roleId: roleStudent.id,
      departmentId: deptSE.id,
      organizationId: org.id
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        roleId: user.roleId,
        departmentId: user.departmentId,
        organizationId: user.organizationId
      },
      create: user
    });
  }
  console.log("Seeded Users with RBAC linkages");

  // 7. Map Alex, Maria, and Intern to Senior Mentor
  const seniorMentor = await prisma.user.findUnique({ where: { email: "mentor@py_nexus.dev" } });
  await prisma.user.updateMany({
    where: { email: { in: ["alex@student.dev", "maria@student.dev", "intern@py_nexus.dev"] } },
    data: { mentorId: seniorMentor.id }
  });
  console.log("Mapped Student Interns to default Senior Mentor");

  // 7.5. Seed Sample Internship Program and Batch
  const program = await prisma.internshipProgram.upsert({
    where: { name: "Software Development Internship" },
    update: {},
    create: {
      name: "Software Development Internship",
      description: "A 6-month intensive full-stack development internship curriculum.",
      duration: 6
    }
  });

  const today = new Date();
  const endDate = new Date();
  endDate.setMonth(today.getMonth() + 6);

  const batch = await prisma.internshipBatch.upsert({
    where: { name: "SD-2026-BatchA" },
    update: { programId: program.id },
    create: {
      name: "SD-2026-BatchA",
      startDate: today,
      endDate: endDate,
      programId: program.id
    }
  });
  console.log("Seeded Sample Internship Program and Batch:", program.name, ",", batch.name);

  // Enroll Alex and Maria in the program and batch
  await prisma.user.updateMany({
    where: { email: { in: ["alex@student.dev", "maria@student.dev"] } },
    data: {
      programId: program.id,
      batchId: batch.id,
      internshipStage: "Active"
    }
  });
  console.log("Enrolled seeded interns into Software Development batch");

  // 8. Seed Course definitions
  const courseDefinitions = [
    {
      title: "Full Stack Web Development Bootcamp",
      description: "Learn HTML, CSS, JavaScript, Node.js, and PostgreSQL by building production-style apps.",
      categoryName: "Web Development",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      lessons: [
        { title: "HTML and Semantic Layouts", videoUrl: "https://example.com/videos/html-layouts", order: 1 },
        { title: "Styling with Modern CSS", videoUrl: "https://example.com/videos/modern-css", order: 2 },
        { title: "Backend APIs with Node.js", videoUrl: "https://example.com/videos/node-apis", order: 3 }
      ]
    },
    {
      title: "Practical Data Science with Python",
      description: "Explore data cleaning, visualization, and basic machine learning workflows using Python.",
      categoryName: "Data Science",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      lessons: [
        { title: "Exploratory Data Analysis", videoUrl: "https://example.com/videos/eda", order: 1 },
        { title: "Data Visualization Basics", videoUrl: "https://example.com/videos/data-viz", order: 2 },
        { title: "Intro to Regression Models", videoUrl: "https://example.com/videos/regression", order: 3 }
      ]
    },
    {
      title: "UI Design Fundamentals",
      description: "Build a strong foundation in typography, hierarchy, color systems, and interface design.",
      categoryName: "Design",
      thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
      lessons: [
        { title: "Design Principles and Layout", videoUrl: "https://example.com/videos/design-principles", order: 1 },
        { title: "Color and Accessibility", videoUrl: "https://example.com/videos/color-accessibility", order: 2 },
        { title: "Designing Responsive Interfaces", videoUrl: "https://example.com/videos/responsive-interfaces", order: 3 }
      ]
    }
  ];

  for (const courseDef of courseDefinitions) {
    const existing = await prisma.course.findFirst({
      where: { title: courseDef.title }
    });

    const course = existing
      ? await prisma.course.update({
        where: { id: existing.id },
        data: {
          description: courseDef.description,
          thumbnail: courseDef.thumbnail,
          categoryId: categoryByName[courseDef.categoryName].id
        }
      })
      : await prisma.course.create({
        data: {
          title: courseDef.title,
          description: courseDef.description,
          thumbnail: courseDef.thumbnail,
          categoryId: categoryByName[courseDef.categoryName].id
        }
      });

    for (const lesson of courseDef.lessons) {
      await prisma.lesson.upsert({
        where: {
          courseId_order: {
            courseId: course.id,
            order: lesson.order
          }
        },
        update: {
          title: lesson.title,
          videoUrl: lesson.videoUrl
        },
        create: {
          courseId: course.id,
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          order: lesson.order
        }
      });
    }
  }
  console.log("Seeded Course & Lessons definitions");

  const alex = await prisma.user.findUnique({ where: { email: "alex@student.dev" } });
  const maria = await prisma.user.findUnique({ where: { email: "maria@student.dev" } });
  const webCourse = await prisma.course.findFirst({ where: { title: "Full Stack Web Development Bootcamp" } });
  const dataCourse = await prisma.course.findFirst({ where: { title: "Practical Data Science with Python" } });
  const designCourse = await prisma.course.findFirst({ where: { title: "UI Design Fundamentals" } });

  const enrollments = [
    { userId: alex.id, courseId: webCourse.id, progress: "42.50" },
    { userId: alex.id, courseId: dataCourse.id, progress: "18.00" },
    { userId: maria.id, courseId: designCourse.id, progress: "76.25" }
  ];

  for (const enrollment of enrollments) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: enrollment.userId,
          courseId: enrollment.courseId
        }
      },
      update: {
        progress: enrollment.progress
      },
      create: enrollment
    });
  }
  console.log("Seeded Enrollments");

  // 10. Seed Sample Tasks and Submissions
  console.log("Seeding Sample Tasks and Submissions...");
  const internUser = await prisma.user.findUnique({ where: { email: "intern@py_nexus.dev" } });
  const alexUser = await prisma.user.findUnique({ where: { email: "alex@student.dev" } });
  const mariaUser = await prisma.user.findUnique({ where: { email: "maria@student.dev" } });

  // Task 1: DB Indexing for Alex (Completed)
  const task1 = await prisma.task.create({
    data: {
      title: "Implement PostgreSQL Database Indexes",
      description: "Analyze query performance and add Prisma index annotations to users, enrollments, and attendance tables.",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      priority: "High",
      status: "Completed",
      assignedToId: alexUser.id,
      createdById: seniorMentor.id
    }
  });

  await prisma.taskSubmission.create({
    data: {
      taskId: task1.id,
      submitterId: alexUser.id,
      content: "https://github.com/alex-dev/py-nexus/pull/12",
      status: "Reviewed",
      score: 9.0,
      feedback: "Excellent index mappings. Query lookup times dropped by 70%. Approved."
    }
  });

  // Task 2: Geolocation Attendance for Intern (Pending Review)
  const task2 = await prisma.task.create({
    data: {
      title: "Develop Geolocation Attendance Card",
      description: "Build a responsive check-in/out telemetry card utilizing navigator.geolocation APIs on the Dashboard.",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "High",
      status: "Review",
      assignedToId: internUser.id,
      createdById: seniorMentor.id
    }
  });

  await prisma.taskSubmission.create({
    data: {
      taskId: task2.id,
      submitterId: internUser.id,
      content: "https://github.com/intern-user/skillnova/tree/attendance-card",
      status: "Pending"
    }
  });

  // Task 3: API Healthcheck for Maria (Assigned)
  await prisma.task.create({
    data: {
      title: "Create Express API Healthcheck Router",
      description: "Expose a public GET /api/health endpoint returning database status connection telemetry.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: "Low",
      status: "Assigned",
      assignedToId: mariaUser.id,
      createdById: seniorMentor.id
    }
  });

  console.log("Seeded Tasks and Submissions successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
