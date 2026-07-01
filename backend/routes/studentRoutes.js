import express from "express";
import passport from "passport";
import User from "../models/User.js";
import Course from "../models/Courses.js";

const router = express.Router();
const protect = passport.authenticate("jwt", { session: false });

// ROUTE 1: POST /api/students/schedule
// DESCRIPTION: Register for a course (With Capacity & Two-Way Sync)
// ============================================================
router.post("/schedule", protect, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id; // Securely provided by Passport from the cookie payload

    // 1. Verify that the class actually exists in MongoDB
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    // 2. Grab the student document
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // 3. CAPACITY ENFORCEMENT: Block registration if the course roster is full
    if (
      course.enrolledStudents &&
      course.enrolledStudents.length >= course.capacity
    ) {
      return res.status(400).json({
        error:
          "Registration failed. This course has reached its maximum seat capacity.",
      });
    }

    // 4. PREVENT DUPLICATES: Safely compare native ObjectIds via string casting
    const isAlreadyRegistered = student.schedule.some(
      (id) => id.toString() === courseId,
    );
    if (isAlreadyRegistered) {
      return res
        .status(400)
        .json({ error: "This course is already in your schedule." });
    }

    // 5. TWO-WAY SYNC: Dynamically add records to BOTH document collections simultaneously
    student.schedule.push(courseId);
    await student.save();

    course.enrolledStudents.push(userId);
    await course.save();

    res.status(200).json({
      message: `Successfully registered for ${course.courseTitle}!`,
      schedule: student.schedule,
    });
  } catch (error) {
    next(error); // Forwards any database glitches to global server error handler
  }
});

//ROUTE 2: GET /api/students/schedule
// DESCRIPTION: Fetch current student's full curriculum dashboard details
router.get("/schedule", protect, async (req, res, next) => {
  try {
    // .populate("schedule") swaps raw ObjectIds for the actual course titles and details
    const student = await User.findById(req.user._id).populate("schedule");

    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    res.status(200).json({
      username: student.username,
      schedule: student.schedule, // Now an array of complete course objects
    });
  } catch (error) {
    next(error);
  }
});

// ROUTE 3: DELETE /api/students/schedule/:courseId
// DESCRIPTION: Drop a course (With Two-Way Relationship Roster Cleanup)
// ============================================================
router.delete("/schedule/:courseId", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    // 1. Fetch the student profile
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // 2. Fetch the target course document
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    // 3. Verify if the course is actually on their schedule to begin with
    const hasCourse = student.schedule.some((id) => id.toString() === courseId);
    if (!hasCourse) {
      return res
        .status(400)
        .json({ error: "This course is not on your schedule." });
    }

    // 4. TWO-WAY CLEANUP: Atomically remove cross-references from BOTH arrays
    student.schedule.pull(courseId);
    await student.save();

    course.enrolledStudents.pull(userId);
    await course.save();

    // FIXED: Uniformly uses next(error) instead of a standalone 500 response block
    // to keep it centralized with your server's global error handler handler pattern.
    res.status(200).json({
      message: `Successfully dropped ${course.courseTitle}.`,
      schedule: student.schedule,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
