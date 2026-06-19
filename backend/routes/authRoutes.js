import express from "express";
import User from "../models/User.js"; // Adjust this path if your model is in a different folder

const router = express.Router();

// Route: POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

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
      name,
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

// We will add the login route here later!

export default router;
