// 1. Imports using ES Module syntax
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser"; // FIXED: Changed from require to import
import { applyPassportStrategy } from "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

// (Leave these commented out until you actually build them)
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// 2. Initialize App
const app = express();

// 3. Database Connection
connectDB();
app.use(cookieParser());

// 4. Global Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // <-- Change this to match your exact frontend URL/port
    credentials: true, // <-- Crucial for allowing cookies
  }),
);
app.use(passport.initialize());
applyPassportStrategy(passport);

// 5. Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
// (Leave these commented out until you actually build them)
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);

// 6. Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
// 7 Global error handling middleware (must take 4 parameters: err, req, res, next)
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler Triggered:", err.stack || err.message);

  // Catch Mongoose duplicate key errors (like trying to register an existing email)
  if (err.code === 11000) {
    return res
      .status(400)
      .json({
        error:
          "Unique validation constraint failed. Field value already exists.",
      });
  }

  // Catch general validation or casting errors (like passing an invalid MongoDB ObjectId)
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ error: "Resource item not found. Invalid ID format." });
  }

  // Standard fallback server error status code
  res.status(err.status || 500).json({
    error: err.message || "An unexpected database or server error occurred.",
  });
});

// 8. Server Listener
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
