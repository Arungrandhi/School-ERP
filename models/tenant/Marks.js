import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
  {
    academicRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicRecord",
      required: true
    },

    examType: {
      type: String,
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    maxMarks: {
      type: Number,
      required: true
    },

    obtainedMarks: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate marks entry
marksSchema.index(
  { academicRecordId: 1, examType: 1, subject: 1 },
  { unique: true }
);

export default marksSchema;
