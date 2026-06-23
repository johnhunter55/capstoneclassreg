import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const { TokenExpiredError } = jwt;
const router = express.Router();

// ==========================================
// 1. ROUTE: POST /api/auth/signup
// ==========================================
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    let isUserAdmin = false;
    if (adminCode === process.env.ADMIN_SECRET) {
      isUserAdmin = true;
    } else if (adminCode && adminCode.trim() !== "") {
      return res.status(401).json({ error: "Invalid admin code." });
    }

    const newUser = new User({
      username,
      email,
      password,
      isAdmin: isUserAdmin,
    });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ==========================================
// 2. ROUTE: POST /api/auth/login
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    console.log("--- LOGIN DEBUG ---");
    console.log("Frontend sent username:", username);
    console.log("Database found user?:", user ? "YES" : "NO");

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password matched?:", isMatch);
    console.log("-------------------");

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // Fixed typo: changed "Id" to "1d" (1 day)
    );

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

// ==========================================
// 3. FIXED: ROUTE: PUT /api/auth/update (Now standalone!)
// ==========================================
router.put("/update", async (req, res) => {
  try {
    const { userId, username, name, email, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        name,
        email,
        phoneNumber: phone,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: "USA",
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("Database update error:", error);
    res.status(500).json({ error: "Server error. Failed to update profile." });
  }
});

export default router;
