// 1. Imports using ES Module syntax
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import { applyPassportStrategy } from "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// (Leave these commented out until you actually build them)
// import studentRoutes from "./routes/studentRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";

// 2. Initialize App
const app = express();

// 3. Database Connection
connectDB();

// 4. Global Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
applyPassportStrategy(passport);

// 5. Routes
app.use("/api/auth", authRoutes); // <-- UNCOMMENTED THIS

// (Leave these commented out until you actually build them)
// app.use("/api/students", studentRoutes);
// app.use("/api/admin", adminRoutes);

// 6. Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 7. Server Listener
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
