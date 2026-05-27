import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    academicRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicRecord",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    session: {
      type: String,
      enum: ["MORNING", "AFTERNOON"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LEAVE", "LATE"],
      required: true,
    },

    // =========================================
    // PUNCH-IN LOCATION
    // =========================================
    punchInLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      address: {
        type: String,
        default: null,
      },

      // GPS accuracy in meters
      accuracy: {
        type: Number,
        default: null,
      },

      // Punch-in timestamp
      punchedAt: {
        type: Date,
        default: null,
      },
    },

    // =========================================
    // PUNCH-OUT
    // =========================================
    /* =========================================
   PUNCH-OUT LOCATION
========================================= */
    punchOutLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      accuracy: {
        type: Number,
        default: null,
      },

      punchedOutAt: {
        type: Date,
        default: null,
      },
    },

    // =========================================
    // WORKING HOURS
    // =========================================
    workingHours: {
      type: Number,
      default: 0,
    },

    // =========================================
    // OPTIONAL SECURITY / AUDIT
    // =========================================
    deviceInfo: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

/*
  =========================================
  Prevent duplicate attendance
  Same staff/student
  Same date
  Same session
  =========================================
*/
attendanceSchema.index(
  {
    academicRecordId: 1,
    date: 1,
    session: 1,
  },
  {
    unique: true,
  }
);

export default attendanceSchema;