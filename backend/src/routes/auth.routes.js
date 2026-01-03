const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// LOGIN
router.post("/login", async (req, res) => {
  console.log("LOGIN HIT", req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("LOGIN ERROR", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// REGISTER / SIGNUP
router.post("/register", async (req, res) => {
  console.log("REGISTER HIT", req.body);

  try {
    const { email, password, fullName, phone, jobTitle, department } = req.body;

    if (!email || !password || !fullName || !jobTitle || !department) {
      return res.status(400).json({ 
        message: "Email, password, full name, job title, and department are required" 
      });
    }

    // Check if user already exists
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
        role: "EMPLOYEE", // Default to employee
      },
    });

    // Generate employee code
    const employeeCount = await prisma.employee.count();
    const employeeCode = `EMP-${String(employeeCount + 1).padStart(4, "0")}`;

    // Create employee profile
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode,
        fullName,
        phone: phone || null,
        jobTitle,
        department,
        salary: 0, // Default salary, can be updated later
        joinDate: new Date(),
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      message: "Registration successful",
      token,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR", err);
    
    // More specific error messages
    if (err.code === 'P2002') {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    if (err.message?.includes('Unique constraint')) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    return res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// 🔴 THIS LINE IS CRITICAL
module.exports = router;
