const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// APPLY FOR LEAVE (EMPLOYEE)
router.post("/apply", auth, async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// VIEW PENDING LEAVES (ADMIN)
router.get("/pending", auth, adminOnly, async (req, res) => {
  const leaves = await prisma.leave.findMany({
    where: { status: "PENDING" },
    include: { 
      employee: {
        include: {
          user: {
            select: { email: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(leaves);
});

// GET ALL LEAVES (ADMIN) - with filters
router.get("/all", auth, adminOnly, async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    
    if (status && status !== "ALL") {
      where.status = status;
    }
    
    if (type && type !== "ALL") {
      where.type = type;
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        employee: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Get counts
    const pending = await prisma.leave.count({ where: { status: "PENDING" } });
    const approved = await prisma.leave.count({ where: { status: "APPROVED" } });
    const rejected = await prisma.leave.count({ where: { status: "REJECTED" } });

    res.json({
      leaves,
      counts: { pending, approved, rejected, all: leaves.length },
    });
  } catch (error) {
    console.error("Get all leaves error:", error);
    res.status(500).json({ message: "Server error" });
  }
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

// GET MY LEAVES (EMPLOYEE)
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const leaves = await prisma.leave.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(leaves);
  } catch (error) {
    console.error("Get my leaves error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET LEAVE BALANCE
router.get("/balance", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Count approved leaves by type
    const paidLeaves = await prisma.leave.count({
      where: {
        employeeId: employee.id,
        type: "PAID",
        status: "APPROVED",
        startDate: { gte: startOfYear, lte: endOfYear },
      },
    });

    const sickLeaves = await prisma.leave.count({
      where: {
        employeeId: employee.id,
        type: "SICK",
        status: "APPROVED",
        startDate: { gte: startOfYear, lte: endOfYear },
      },
    });

    const unpaidLeaves = await prisma.leave.count({
      where: {
        employeeId: employee.id,
        type: "UNPAID",
        status: "APPROVED",
        startDate: { gte: startOfYear, lte: endOfYear },
      },
    });

    res.json({
      paid: { used: paidLeaves, total: 15, remaining: 15 - paidLeaves },
      sick: { used: sickLeaves, total: 10, remaining: 10 - sickLeaves },
      unpaid: { used: unpaidLeaves, total: 5, remaining: 5 - unpaidLeaves },
    });
  } catch (error) {
    console.error("Get leave balance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
