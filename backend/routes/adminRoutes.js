import express from "express";
import passport from "passport";
import User from "../models/User.js";
import Course from "../models/Courses.js";

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
    const { username, name, email, phone, address, schedule } = req.body;

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
    if (schedule !== undefined) {
      user.schedule = schedule;
    }
    await user.save();

    // Re-fetch the user with the schedule populated to send back to the client
    const userResponse = await User.findById(id)
      .select("-password")
      .populate("schedule");

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
<<<<<<< Updated upstream

// ============================================================
// ROUTE 5: DELETE /api/admin/users/:userId/schedule/:courseId
// DESCRIPTION: Administratively remove a course from a user's schedule
// ============================================================
router.delete("/users/:userId/schedule/:courseId", async (req, res, next) => {
  try {
    const { userId, courseId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Use Mongoose .pull() to remove the courseId from the schedule array
    user.schedule.pull(courseId);
    await user.save();

    // We need to send back the updated user with a populated schedule
    const updatedUser = await User.findById(userId).populate("schedule");

    res.status(200).json({
      message: "Course dropped successfully from user's schedule.",
      user: updatedUser,
    });
=======
//  Route 5 DELETE /api/admin/users/:id (Permanently delete user)
router.delete("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own admin account." });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: "User not found." });

    res
      .status(200)
      .json({ message: `User '${deletedUser.username}' permanently removed.` });
>>>>>>> Stashed changes
  } catch (error) {
    next(error);
  }
});

<<<<<<< Updated upstream
export default router;
=======
// 📚 COURSE & CURRICULUM MANAGEMENT ROUTES
// ROUTE 6: POST /api/admin/courses
// DESCRIPTION: Create a brand new course in the catalog
router.post("/Courses", async (req, res, next) => {
  try {
    // Assuming your Course schema looks for title, description, code, etc.
    const { title, description, code, creditHours } = req.body;

    if (!title || !code) {
      return res
        .status(400)
        .json({ error: "Course title and course code are required." });
    }

    // Check for unique course code conflicts
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res
        .status(400)
        .json({ error: "A course with this code already exists." });
    }

    const newCourse = new Course({
      title,
      description,
      code: code.toUpperCase(),
      creditHours: creditHours || 3, // Fallback value if your model uses credits
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "New course created successfully!", course: newCourse });
  } catch (error) {
    next(error);
  }
});

// ROUTE 7: PUT /api/admin/courses/:id
// DESCRIPTION: Modify details of an existing course

router.put("/courses/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, code, credits } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    // If changing the unique code, check for conflicts
    if (code && code.toUpperCase() !== course.code) {
      const conflict = await Course.findOne({ code: code.toUpperCase() });
      if (conflict)
        return res
          .status(400)
          .json({ error: "Another course is already using this code." });
      course.code = code.toUpperCase();
    }

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (credits !== undefined) course.credits = credits;

    await course.save();
    res.status(200).json({ message: "Course updated successfully.", course });
  } catch (error) {
    next(error);
  }
});
>>>>>>> Stashed changes
