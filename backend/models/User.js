import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true, // Prevents duplicate usernames
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Prevents duplicate emails
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false, // Defaults to false for normal users
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "USA" },
    },
    phoneNumber: {
      type: Number,
      minlength: 10,
      maxlength: 10,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  // If the password isn't modified, just exit the function (no next needed!)
  if (!this.isModified("password")) return;

  // Mongoose automatically catches errors in async functions, so no try/catch needed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
