const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// APPLY FOR LEAVE (EMPLOYEE)
router.post("/apply", auth, async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  const userId = req.user.userId;

  if (!type || !startDate || !endDate || !reason) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const leave = await prisma.leave.create({
    data: {
      employeeId: employee.id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  });

  res.json({ message: "Leave applied successfully", leave });
});

// VIEW PENDING LEAVES (ADMIN)
router.get("/pending", auth, adminOnly, async (req, res) => {
  const leaves = await prisma.leave.findMany({
    where: { status: "PENDING" },
    include: { employee: true },
  });

  res.json(leaves);
});

// APPROVE / REJECT LEAVE (ADMIN)
router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  const { status, adminNote } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const updated = await prisma.leave.update({
    where: { id: req.params.id },
    data: {
      status,
      adminNote,
    },
  });

  res.json({ message: "Leave updated", updated });
});

module.exports = router;
