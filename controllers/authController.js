import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import SuperAdmin from "../models/master/SuperAdmin.js";
import { getTenantDB } from "../config/dbTenant.js";
import School from "../models/master/School.js";   // ✅ ADD THIS
import { registerTenantModels } from "../models/tenant/registerTenantModels.js";

/* ===============================
   SUPER ADMIN LOGIN
================================ */
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 🔐 Secure password compare
    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: admin.role });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ===============================
   SCHOOL LOGIN
================================ */
export const schoolLogin = async (req, res) => {
  try {
    const { email, password, schoolCode } = req.body;

    if (!schoolCode) {
      return res.status(400).json({ message: "School code required" });
    }

    /* 🔥 1️⃣ Check School in Master DB */
    const school = await School.findOne({ code: schoolCode });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    /* 🔥 2️⃣ Check if School is ACTIVE */
    if (school.status !== "ACTIVE") {
      return res.status(403).json({
        message: "School is inactive. Please contact Super Admin."
      });
    }

    /* 🔥 3️⃣ Connect to Tenant DB */
    const tenantDB = await getTenantDB(
      `school_${schoolCode.toLowerCase()}`
    );

    const { User } = registerTenantModels(tenantDB);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* 🔐 4️⃣ Secure password compare */
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    /* 🔥 5️⃣ Generate JWT */
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        schoolCode
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role, schoolCode });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   STUDENT LOGIN
================================ */
export const studentLogin = async (req, res) => {
  try {
    const { admissionNo, password, schoolCode } = req.body;

    const school = await School.findOne({ code: schoolCode });
    if (!school) return res.status(404).json({ message: "School not found" });

    const tenantDB = await getTenantDB(
      `school_${schoolCode.toLowerCase()}`
    );

    const { Student } = registerTenantModels(tenantDB);

    // 🔥 FIX HERE
    const student = await Student.findOne({
      admissionNo: admissionNo.toString().trim()
    });

    if (!student) {
      return res.status(404).json({ message: "Invalid Admission Number" });
    }

    if (student.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account inactive" });
    }

    const isMatch = await bcrypt.compare(password, student.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: "STUDENT",
        schoolCode
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: "STUDENT", schoolCode });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




/* ===============================
   STAFF LOGIN
================================ */
export const staffLogin = async (req, res) => {
  try {
    const { employeeId, password, schoolCode } = req.body;

    const school = await School.findOne({ code: schoolCode });
    if (!school) return res.status(404).json({ message: "School not found" });

    const tenantDB = await getTenantDB(
      `school_${schoolCode.toLowerCase()}`
    );

    const { Staff } = registerTenantModels(tenantDB);

    // 🔥 FIX HERE
    const staff = await Staff.findOne({
      employeeId: employeeId.toString().trim()
    });

    if (!staff) {
      return res.status(404).json({ message: "Invalid Employee ID" });
    }

    if (staff.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account inactive" });
    }

    const isMatch = await bcrypt.compare(password, staff.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: staff._id,
        role: staff.role,
        schoolCode
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

   res.json({
  token,
  role: staff.role,
  schoolCode,
  academicRecordId: staff._id
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

