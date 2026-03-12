import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    passwordHash: String,
    role: {
      type: String,
      enum: ["ADMIN", "PRINCIPAL", "TEACHER", "STAFF", "PARENT"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default userSchema;
