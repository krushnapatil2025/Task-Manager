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

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));


// Connect to MongoDB
connectDB();


//Middleware
app.use(express.json());

//Routes
app.use("/api/auth",authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/report", reportRoutes);

//server upload folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});