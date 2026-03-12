import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      trim: true
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"]
    },

    dateOfBirth: Date,

    fatherName: String,
    motherName: String,
    parentPhone: String,
    parentEmail: String,
    address: String,

    // 🔐 ADD THIS
    passwordHash: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ALUMNI", "TC"],
      default: "ACTIVE"
    }

  },
  { timestamps: true }
);

export default studentSchema;
