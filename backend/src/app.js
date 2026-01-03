const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");

const app = express();

app.use(cors());
app.use(express.json()); // REQUIRED

app.use("/auth", authRoutes);
app.use("/attendance", attendanceRoutes);

module.exports = app;
