import mongoose from "mongoose";

const academicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    academicYear: { type: String, required: true }, // 2024-2025

    className: { type: String, required: true },
    section: String,
    rollNo: String,

    status: {
      type: String,
      enum: ["ACTIVE", "PASSED", "FAILED", "TC"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

export default academicRecordSchema;
