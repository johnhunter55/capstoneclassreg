import express from "express";
import passport from "passport";
import User from "../models/User.js";

const router = express.Router();

const protect = passport.authenticate("jwt", { session: false });

// 2. Custom Middleware: Blocks anyone whose isAdmin flag is false
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next(); // User is an admin, proceed to the route handler!
  }
  return res
    .status(403)
    .json({ error: "Access denied. Admin privileges required." });
};

router.use(protect, adminOnly);

// ROUTE 1: GET /api/admin/users
// DESCRIPTION: Get a master list of all users in the system
// ============================================================
router.get("/users", async (req, res, next) => {
  try {
    // Fetch all users, selecting everything except their password hashes for safety
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

///ROUTE 2: GET /api/admin/users/:id
// DESCRIPTION: Get deep details of a specific user (including schedule)
// ============================================================
router.get("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password")
      .populate("schedule");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// ============================================================
// ROUTE 3: PUT /api/admin/users/:id
// DESCRIPTION: Administratively override/correct a user's profile info
// ============================================================
router.put("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, name, email, phone, address } = req.body;

    // Fetch the user document first to make safe, conditional updates
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check for unique conflicts if username or email is being modified
    if (username && username !== user.username) {
      const conflict = await User.findOne({ username });
      if (conflict)
        return res.status(400).json({ error: "Username already in use." });
      user.username = username;
    }

    if (email && email !== user.email) {
      const conflict = await User.findOne({ email });
      if (conflict)
        return res.status(400).json({ error: "Email already in use." });
      user.email = email;
    }

    // Safely update remaining details if provided
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phoneNumber = phone;

    if (address) {
      user.address = {
        street: address.street || user.address?.street,
        city: address.city || user.address?.city,
        state: address.state || user.address?.state,
        zipCode: address.zipCode || user.address?.zipCode,
        country: address.country || user.address?.country || "USA",
      };
    }

    // Re-evaluate profile completeness flag based on updates
    user.fullP = !!(
      user.name &&
      user.phoneNumber &&
      user.address?.street &&
      user.address?.city &&
      user.address?.state &&
      user.address?.zipCode
    );

    const updatedUser = await user.save();

    // Create a safe response object removing sensitive information
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "User profile updated administratively.",
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
});
// ROUTE 4: PATCH /api/admin/users/:id/role
// DESCRIPTION: Grant or revoke admin privileges for a user
// ============================================================
router.patch("/users/:id/role", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body; // Expects a boolean true/false

    if (typeof isAdmin !== "boolean") {
      return res
        .status(400)
        .json({ error: "isAdmin field must be a boolean value." });
    }

    // Prevent an admin from accidentally revoking their own access
    if (id === req.user._id.toString() && isAdmin === false) {
      return res
        .status(400)
        .json({ error: "You cannot revoke your own admin rights." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.status(200).json({
      message: `User administrative privileges successfully ${isAdmin ? "granted" : "revoked"}.`,
      userId: user._id,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    next(error);
  }
});
