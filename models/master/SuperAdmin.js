import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, default: "SUPER_ADMIN" },
  },
  { timestamps: true }
);

export default mongoose.model("SuperAdmin", superAdminSchema);
