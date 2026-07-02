import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      trim: true,
      alias: "Course ID",
    },
    courseTitle: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      alias: "Course Title",
    },
    courseDescription: {
      type: String,
      trim: true,
      alias: "Course Description",
    },
    classroomNumber: {
      type: String,
      trim: true,
      alias: "Classroom Number",
    },
    capacity: {
      type: Number,
      default: 30,
      alias: "Capacity",
    },
    creditHours: {
      type: Number,
      alias: "Credit Hours",
    },
    tuitionCost: {
      type: String,
      alias: "Tuition Cost",
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References your User model if you track registrations
      },
    ],
  },
  {
    timestamps: true,
    // This transform will be applied whenever you convert a document to a plain object or JSON
    toObject: {
      transform: function (doc, ret) {
        // Map from schema key to desired output key
        const keyMap = {
          courseId: "Course ID",
          courseTitle: "Course Title",
          courseDescription: "Course Description",
          classroomNumber: "Classroom Number",
          capacity: "Capacity",
          creditHours: "Credit Hours",
          tuitionCost: "Tuition Cost",
        };

        for (const key in keyMap) {
          if (ret[key] !== undefined) {
            ret[keyMap[key]] = ret[key];
            delete ret[key];
          }
        }
        return ret;
      },
    },
    toJSON: {
      transform: function (doc, ret) {
        // Map from schema key to desired output key
        const keyMap = {
          courseId: "Course ID",
          courseTitle: "Course Title",
          courseDescription: "Course Description",
          classroomNumber: "Classroom Number",
          capacity: "Capacity",
          creditHours: "Credit Hours",
          tuitionCost: "Tuition Cost",
        };

        for (const key in keyMap) {
          if (ret[key] !== undefined) {
            ret[keyMap[key]] = ret[key];
            delete ret[key];
          }
        }
        return ret;
      },
    },
  },
);

// Mongoose automatically looks for the plural lowercase version of the model name.
// Specifying "courses" explicitly ensures it targets your exact existing collection.
const Course = mongoose.model("Course", courseSchema, "courses");
export default Course;
