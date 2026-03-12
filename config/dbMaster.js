import mongoose from "mongoose";

export const connectMasterDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_MASTER_URI);
    console.log("✅ Master DB connected");
  } catch (error) {
    console.error("❌ Master DB connection failed:", error.message);
    process.exit(1);
  }
};
