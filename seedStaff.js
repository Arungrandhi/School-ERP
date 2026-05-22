import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Staff from "./models/tenant/staff.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_BASE_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

const seedStaff = async () => {
  try {
    const existingStaff = await Staff.findOne({
      email: "staff@gmail.com",
    });

    if (existingStaff) {
      console.log("⚠️ Staff already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("staff123", 10);

    const staff = new Staff({
      name: "Staff User",
      employeeId: "EMP001",
      email: "staff@gmail.com",
      phone: "9876543210",
      role: "STAFF",
      designation: "Office Staff",
      gender: "Male",
      salary: 25000,
      passwordHash: hashedPassword,

      // Replace with actual tenantId from MongoDB
      tenantId: new mongoose.Types.ObjectId(
        "665f1b2a3c4d5e6f7a8b9c0d"
      ),
    });

    await staff.save();

    console.log("✅ Staff account created successfully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedStaff();