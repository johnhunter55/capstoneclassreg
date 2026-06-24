import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const { TokenExpiredError } = jwt;
const router = express.Router();

const protect = async (req, res, next) => {
  const token = req.cookies.token; // Grab token from cookies container

  if (!token) {
    return res.status(401).json({ error: "Not authorized, please login." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach user ID to request object
    next();
  } catch (error) {
    return res.status(401).json({ error: "Session expired or invalid token." });
  }
};

// ==========================================
// 1. ROUTE: POST /api/auth/signup
// ==========================================
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use." });

    const existingName = await User.findOne({ username });
    if (existingName)
      return res.status(400).json({ error: "Username already in use." });

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

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // FIXED: Set cookie container
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
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

    if (!user)
      return res.status(400).json({ error: "Invalid username or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid username or password." });

    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // FIXED: Send token via httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful!",
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
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ==========================================
// 3. FIXED: ROUTE: PUT /api/auth/update (Now standalone!)
// ==========================================
router.put("/update", protect, async (req, res) => {
  // FIXED: Added protect middleware
  try {
    const userId = req.userId; // FIXED: Pulled safely directly from verified token token data
    const { username, name, email, phone, address } = req.body;

    const existingUsername = await User.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUsername)
      return res.status(400).json({ error: "Username is already in use." });

    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail)
      return res.status(400).json({ error: "Email is already in use." });

    const isProfileComplete = !!(
      name &&
      phone &&
      address?.street &&
      address?.city &&
      address?.state &&
      address?.zipCode
    );

    const updateData = {
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
      fullP: isProfileComplete,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found." });

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        fullP: updatedUser.fullP,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error. Failed to update profile." });
  }
});

export default router;
