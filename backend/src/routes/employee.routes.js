const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// GET EMPLOYEE PROFILE
router.get("/profile", auth, async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE EMPLOYEE PROFILE
router.patch("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, address } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    res.json({ message: "Profile updated successfully", employee: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET EMPLOYEE DASHBOARD STATS
router.get("/dashboard/stats", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Days worked this month
    const daysWorked = await prisma.attendance.count({
      where: {
        employeeId: employee.id,
        date: { gte: startOfMonth },
        status: "PRESENT",
      },
    });

    // Hours this week
    const weekRecords = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: startOfWeek, lte: endOfWeek },
        checkIn: { not: null },
        checkOut: { not: null },
      },
    });

    let hoursThisWeek = 0;
    weekRecords.forEach((record) => {
      if (record.checkIn && record.checkOut) {
        const hours = (record.checkOut - record.checkIn) / (1000 * 60 * 60);
        hoursThisWeek += hours;
      }
    });

    // Attendance rate (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const totalDays = 30;
    const presentDays = await prisma.attendance.count({
      where: {
        employeeId: employee.id,
        date: { gte: thirtyDaysAgo },
        status: "PRESENT",
      },
    });
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Leave balance
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

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
      daysWorked,
      hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
      attendanceRate: Math.round(attendanceRate),
      leaveBalance: {
        paid: { used: paidLeaves, total: 15, remaining: 15 - paidLeaves },
        sick: { used: sickLeaves, total: 10, remaining: 10 - sickLeaves },
        unpaid: { used: unpaidLeaves, total: 5, remaining: 5 - unpaidLeaves },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET EMPLOYEE SUMMARY
router.get("/summary", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        attendance: {
          take: 5,
          orderBy: { date: "desc" },
        },
        leaves: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

