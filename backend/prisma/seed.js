require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 1️⃣ Create or update admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@dayflow.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "admin@dayflow.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2️⃣ Create or update employee linked to user
  await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      employeeCode: "EMP-ADMIN-001",
      fullName: "Admin User",
      jobTitle: "Administrator",
      department: "HR",
      salary: 50000.0,
      joinDate: new Date("2024-01-01"),
    },
  });
  
  console.log("✅ Admin user and employee seeded successfully");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
