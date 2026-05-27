import mongoose from "mongoose";

export const connectMasterDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_MASTER_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Master DB Connected");

  } catch (error) {
    console.error("❌ Master DB Connection Error:", error);
    process.exit(1);
  }
};
