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

// 🔴 THIS LINE IS CRITICAL
module.exports = router;
