const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// GET DASHBOARD STATS
router.get("/dashboard/stats", auth, adminOnly, async (req, res) => {
  try {
    const totalEmployees = await prisma.employee.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentToday = await prisma.attendance.count({
      where: {
        date: { gte: today, lt: tomorrow },
        status: "PRESENT",
      },
    });

    const onLeave = await prisma.leave.count({
      where: {
        status: "APPROVED",
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });

    const pendingRequests = await prisma.leave.count({
      where: { status: "PENDING" },
    });

    // Calculate growth (mock for now)
    const previousMonthEmployees = totalEmployees - 8; // Mock
    const growth = previousMonthEmployees > 0 
      ? ((totalEmployees - previousMonthEmployees) / previousMonthEmployees * 100).toFixed(1)
      : 0;

    res.json({
      totalEmployees,
      presentToday,
      onLeave,
      pendingRequests,
      growth: `+${growth}%`,
      attendanceRate: totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(0) : 0,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET WEEKLY ATTENDANCE DATA
router.get("/dashboard/weekly-attendance", auth, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const weekData = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const present = await prisma.attendance.count({
        where: {
          date: { gte: date, lt: nextDate },
          status: "PRESENT",
        },
      });

      const absent = await prisma.attendance.count({
        where: {
          date: { gte: date, lt: nextDate },
          status: "ABSENT",
        },
      });

      weekData.push({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri"][i],
        present,
        absent,
      });
    }

    res.json(weekData);
  } catch (error) {
    console.error("Weekly attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET EMPLOYEES BY DEPARTMENT
router.get("/dashboard/departments", auth, adminOnly, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      select: { department: true },
    });

    const departmentCount = {};
    employees.forEach((emp) => {
      departmentCount[emp.department] = (departmentCount[emp.department] || 0) + 1;
    });

    const total = employees.length;
    const departments = Object.entries(departmentCount).map(([name, count]) => ({
      name,
      count,
      percentage: ((count / total) * 100).toFixed(0),
    }));

    res.json(departments);
  } catch (error) {
    console.error("Departments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL EMPLOYEES
router.get("/employees", auth, adminOnly, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(employees);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE EMPLOYEE
router.post("/employees", auth, adminOnly, async (req, res) => {
  try {
    const { email, password, fullName, phone, jobTitle, department, salary, joinDate } = req.body;

    if (!email || !password || !fullName || !jobTitle || !department) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
    });

    // Generate employee code
    const employeeCount = await prisma.employee.count();
    const employeeCode = `EMP-${String(employeeCount + 1).padStart(4, "0")}`;

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode,
        fullName,
        phone: phone || null,
        jobTitle,
        department,
        salary: salary ? parseFloat(salary) : 0,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    res.json({ message: "Employee created successfully", employee });
  } catch (error) {
    console.error("Create employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET DAILY ATTENDANCE
router.get("/attendance/daily", auth, adminOnly, async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: { gte: date, lt: nextDate },
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        employee: {
          fullName: "asc",
        },
      },
    });

    // Get summary
    const present = attendance.filter((a) => a.status === "PRESENT").length;
    const halfDay = attendance.filter((a) => a.status === "HALF_DAY").length;
    const absent = attendance.filter((a) => a.status === "ABSENT").length;

    res.json({
      date,
      attendance,
      summary: { present, halfDay, absent },
    });
  } catch (error) {
    console.error("Daily attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET RECENT ACTIVITY
router.get("/activity", auth, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent check-ins
    const recentCheckIns = await prisma.attendance.findMany({
      where: {
        checkIn: { not: null },
      },
      include: {
        employee: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        checkIn: "desc",
      },
      take: limit,
    });

    // Get recent leave requests
    const recentLeaves = await prisma.leave.findMany({
      include: {
        employee: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Combine and format
    const activities = [
      ...recentCheckIns.map((a) => ({
        type: "checkin",
        employee: a.employee.fullName,
        time: a.checkIn,
        message: "Checked in",
      })),
      ...recentLeaves.map((l) => ({
        type: "leave",
        employee: l.employee.fullName,
        time: l.createdAt,
        message: `Requested ${l.type.toLowerCase()} leave`,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, limit);

    res.json(activities);
  } catch (error) {
    console.error("Activity error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

