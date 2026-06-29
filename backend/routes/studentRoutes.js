import express from "express";
import passport from "passport";
import User from "../models/User.js";
import Course from "../models/Courses.js";

const router = express.Router();
const protect = passport.authenticate("jwt", { session: false });

router.post("/schedule", protect, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id; // Securely provided by Passport from the cookie payload

    // 1. Verify that the class actually exists in MongoDB
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    } // 2. Grab the student document
    const student = await User.findById(userId);

    // 3. Prevent duplicate selections
    if (student.schedule.some((id) => id.toString() === courseId)) {
      return res
        .status(400)
        .json({ error: "This course is already in your schedule." });
    }

    // 4. Push the course ID into the schedule array and save
    student.schedule.push(courseId);
    await student.save();

  // ✅ CORRECTED
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // ... rest of your code ...

    // 1. Verify that the class actually exists in MongoDB
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    } // 2. Grab the student document
    const student = await User.findById(userId);

    // 3. Prevent duplicate selections
    if (student.schedule.includes(courseId)) {
      return res
        .status(400)
        .json({ error: "This course is already in your schedule." });
    }

    // 4. Push the course ID into the schedule array and save
    student.schedule.push(courseId);
    await student.save();

    res.status(200).json({
      message: `Successfully registered for ${course.title || "the course"}!`,
      schedule: student.schedule,
    });
  } catch (error) {
    next(error); // Forwards any database glitches to your global server error handler
  }
});
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
router.delete("/schedule/:courseId", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const student = await User.findById(userId);

    const hasCourse = student.schedule.some((id) => id.toString() === courseId);

    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Verify if the course is even on their schedule to begin with
    if (!hasCourse) {
      return res
        .status(400)
        .json({ error: "This course is not on your schedule." });
    }

    // Mongoose array helper .pull() safely removes the sub-document ID
    student.schedule.pull(courseId);
    await student.save();

    res.status(200).json({
      message: "Course dropped successfully.",
      schedule: student.schedule,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
