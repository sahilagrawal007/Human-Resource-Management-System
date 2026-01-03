require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
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

  console.log("✅ Admin user seeded with hashed password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
