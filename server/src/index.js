require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const teamRoutes = require("./routes/team.routes");
const taskRoutes = require("./routes/task.routes");
const notificationRoutes = require("./routes/notification.routes");
const issueRoutes = require("./routes/issue.routes");

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(mongoSanitize());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check (before auth-protected routes)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api", teamRoutes);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
