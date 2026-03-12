import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    academicRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicRecord",
      required: true,
      index: true
    },

    date: {
      type: Date,
      required: true
    },

    // ✅ NEW FIELD
    session: {
      type: String,
      enum: ["MORNING", "AFTERNOON"],
      required: true
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LEAVE"],
      required: true
    }
  },
  { timestamps: true }
);

/*
  ✅ Prevent duplicate attendance
  Same student
  Same date
  Same session
*/
attendanceSchema.index(
  { academicRecordId: 1, date: 1, session: 1 },
  { unique: true }
);

export default attendanceSchema;