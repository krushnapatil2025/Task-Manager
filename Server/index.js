require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://task-manager-i21z.vercel.app',
  'https://task-manager-2e7s-4p7dyaalx-krushnapatil2025-gmailcoms-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation: " + origin));
    }
  },
  methods: ["GET", "PUT", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/report", reportRoutes);

// ✅ Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
