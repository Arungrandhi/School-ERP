import mongoose from "mongoose";

const schoolStatsSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      unique: true
    },
    totalStudents: { type: Number, default: 0 },
    totalStaff: { type: Number, default: 0 },
    totalFeesCollected: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("SchoolStats", schoolStatsSchema);
