import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    // Replace 'student_db' with your preferred database name
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_db",
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
