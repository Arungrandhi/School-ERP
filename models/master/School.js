import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: String,
    code: { type: String, unique: true, uppercase: true },
    dbName: { type: String, unique: true },
    location: String,
    email: String,
    status: { type: String, default: "ACTIVE" },
    plan: { type: String, default: "FREE" },
  },
  { timestamps: true }
);

export default mongoose.model("School", schoolSchema);
