const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// CHECK-IN
router.post("/check-in", auth, async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// CHECK-OUT
router.post("/check-out", auth, async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET TODAY'S ATTENDANCE
router.get("/today", auth, async (req, res) => {
  try {
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

    res.json(record || null);
  } catch (error) {
    console.error("Get today attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ATTENDANCE HISTORY
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 30;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const records = await prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { date: "desc" },
      take: limit,
    });

    res.json(records);
  } catch (error) {
    console.error("Get attendance history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ATTENDANCE CALENDAR
router.get("/calendar", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    res.json(records);
  } catch (error) {
    console.error("Get attendance calendar error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ATTENDANCE STATS
router.get("/stats", auth, async (req, res) => {
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

    res.json({
      daysWorked,
      hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
      attendanceRate: Math.round(attendanceRate),
    });
  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;