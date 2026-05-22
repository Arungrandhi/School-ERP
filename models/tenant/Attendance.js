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

    session: {
      type: String,
      enum: ["MORNING", "AFTERNOON"],
      required: true
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LEAVE"],
      required: true
    },

    // ✅ PUNCH-IN LOCATION (captured when staff marks attendance)
    punchInLocation: {
      latitude: {
        type: Number,
        default: null
      },
      longitude: {
        type: Number,
        default: null
      },
      address: {
        type: String,
        default: null
      },
      // Accuracy in meters from browser GPS
      accuracy: {
        type: Number,
        default: null
      },
      // Timestamp of when punch-in occurred
      punchedAt: {
        type: Date,
        default: null
      }
    }
  },
  { timestamps: true }
);

/*
  ✅ Prevent duplicate attendance
  Same student / staff
  Same date
  Same session
*/
attendanceSchema.index(
  { academicRecordId: 1, date: 1, session: 1 },
  { unique: true }
);

export default attendanceSchema;