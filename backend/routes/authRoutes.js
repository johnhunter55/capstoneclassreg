import express from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import User from "../models/User.js"; // Adjust this path if your model is in a different folder
import bcrypt from "bcrypt";

const router = express.Router();

// Route: POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body; // <-- Added username
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // 2. Check the admin code
    let isUserAdmin = false;

    // Make sure ADMIN_SECRET is in your .env file!
    if (adminCode === process.env.ADMIN_SECRET) {
      isUserAdmin = true;
    } else if (adminCode && adminCode.trim() !== "") {
      return res.status(401).json({ error: "Invalid admin code." });
    }

    // 3. Create the new user
    const newUser = new User({
      username, // <-- Added username
      email,
      password,
      isAdmin: isUserAdmin,
    });

    // (Your User model's "pre-save" hook will automatically hash the password here!)
    await newUser.save();

    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// Route: POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if the user exists
    const user = await User.findOne({ username });

    // 🔍 DEBUG LOG #1
    console.log("--- LOGIN DEBUG ---");
    console.log("Frontend sent username:", username);
    console.log("Database found user?:", user ? "YES" : "NO");

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    // 🔍 DEBUG LOG #2
    console.log("Password matched?:", isMatch);
    console.log("-------------------");

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    // generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "Id" },
    );

    // Success! Send back the user data
    res.status(200).json({
      message: "Login successful!",
      token: `Bearer ${token}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
