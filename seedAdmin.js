import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import SuperAdmin from "./models/master/SuperAdmin.js";
import { connectMasterDB } from "./config/dbMaster.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectMasterDB();

    await SuperAdmin.deleteMany({});

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await SuperAdmin.create({
      name: "Main Admin",
      email: "admin@gmail.com",
      passwordHash: hashedPassword,
    });

    console.log("✅ Super Admin seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
