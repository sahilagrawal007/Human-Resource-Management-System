const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// CHECK-IN
router.post("/check-in", auth, async (req, res) => {
  const userId = req.user.userId;

  const employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date: today,
      },
    },
  });

  if (existing) {
    return res.status(400).json({ message: "Already checked in today" });
  }

  const record = await prisma.attendance.create({
    data: {
      employeeId: employee.id,
      date: today,
      checkIn: new Date(),
      status: "PRESENT",
    },
  });

  res.json({ message: "Checked in", record });
});

// CHECK-OUT
router.post("/check-out", auth, async (req, res) => {
  const userId = req.user.userId;

  const employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date: today,
      },
    },
  });

  if (!record || record.checkOut) {
    return res.status(400).json({ message: "No active check-in found" });
  }

  const updated = await prisma.attendance.update({
    where: { id: record.id },
    data: { checkOut: new Date() },
  });

  res.json({ message: "Checked out", updated });
});


module.exports = router;