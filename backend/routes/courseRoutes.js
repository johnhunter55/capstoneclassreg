import express from "express";
import passport from "passport";
import Course from "../models/Courses.js";

const router = express.Router();
const protect = passport.authenticate("jwt", { session: false });

router.get("/", protect, async (req, res, next) => {
  try {
    // Finds all documents in your "courses" collection
    const courses = await Course.find({});

    res.status(200).json(courses);
  } catch (error) {
    // Passes any database errors straight to your global handler in server.js
    next(error);
  }
});

export default router;
t;
