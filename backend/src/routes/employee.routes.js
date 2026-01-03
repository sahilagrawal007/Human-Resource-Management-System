const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// GET EMPLOYEE PROFILE
router.get("/profile", auth, async (req, res) => {
  const userId = req.user.userId;

  const employee = await prisma.employee.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  res.json(employee);
});

module.exports = router;

