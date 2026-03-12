import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import School from "../models/master/School.js";
import SchoolStats from "../models/master/SchoolStats.js";
import { getTenantDB } from "../config/dbTenant.js";
import { registerTenantModels } from "../models/tenant/registerTenantModels.js";

/* =====================================================
   CREATE SCHOOL
===================================================== */
export const createSchool = async (req, res) => {
  try {
    const { name, code, location, email, password } = req.body;

    if (!name || !code || !email || !password) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const dbName = `school_${code.toLowerCase()}`;

    const existingSchool = await School.findOne({ code });
    if (existingSchool) {
      return res.status(400).json({ message: "School code already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const school = await School.create({
      name,
      code,
      dbName,
      location,
      email,
      status: "ACTIVE"
    });

    const tenantDB = await getTenantDB(dbName);
    const { User } = registerTenantModels(tenantDB);

    await User.create({
      name: `${name} Admin`,
      email,
      passwordHash: hashedPassword,
      role: "ADMIN"
    });

    await SchoolStats.create({
      schoolId: school._id,
      totalStudents: 0,
      totalStaff: 0,
      totalFeesCollected: 0
    });

    res.status(201).json({
      message: "School created successfully",
      school
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   GET ALL SCHOOLS WITH STATS
===================================================== */
export const getSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });

    const result = await Promise.all(
      schools.map(async (school) => {
        const stats = await SchoolStats.findOne({ schoolId: school._id });

        return {
          ...school._doc,
          totalStudents: stats?.totalStudents || 0,
          totalStaff: stats?.totalStaff || 0,
          totalFeesCollected: stats?.totalFeesCollected || 0
        };
      })
    );

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   UPDATE SCHOOL
===================================================== */
export const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, email, password, status } = req.body;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    school.name = name || school.name;
    school.location = location || school.location;
    school.email = email || school.email;
    school.status = status || school.status;

    await school.save();

    if (email || password) {
      const tenantDB = await getTenantDB(school.dbName);
      const { User } = registerTenantModels(tenantDB);

      const adminUser = await User.findOne({ role: "ADMIN" });

      if (adminUser) {
        if (email) adminUser.email = email;

        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          adminUser.passwordHash = hashedPassword;
        }

        await adminUser.save();
      }
    }

    res.json({ message: "School updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   TOGGLE SCHOOL STATUS
===================================================== */
export const toggleSchoolStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    school.status = school.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await school.save();

    res.json({
      message: "School status updated",
      status: school.status
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   DELETE SCHOOL + TENANT DB
===================================================== */
export const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const dbName = school.dbName;

    // Delete tenant database
    await mongoose.connection.useDb(dbName).dropDatabase();

    // Delete stats
    await SchoolStats.deleteOne({ schoolId: school._id });

    // Delete school from master
    await School.findByIdAndDelete(id);

    res.json({ message: "School and tenant database deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
