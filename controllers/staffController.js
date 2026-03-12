import bcrypt from "bcryptjs";
import School from "../models/master/School.js";
import SchoolStats from "../models/master/SchoolStats.js";

export const createStaff = async (req, res) => {
  try {
    const { Staff } = req.tenantModels;
    
    // 1. Authorization Check
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied. Only Admins can add staff." });
    }

    const { 
        name, employeeId, email, phone, role, 
        subject, designation, salary, gender, 
        joiningDate, password 
    } = req.body;

    // 2. Comprehensive Validation
    if (!name || !employeeId || !email || !role || !password) {
      return res.status(400).json({ message: "Required fields: Name, ID, Email, Role, and Password" });
    }

    // 3. Check for existing Employee ID OR Email
    const existing = await Staff.findOne({ 
        $or: [{ employeeId }, { email: email.toLowerCase() }] 
    });
    
    if (existing) {
        const field = existing.employeeId === employeeId ? "Employee ID" : "Email";
        return res.status(400).json({ message: `${field} already registered in the system` });
    }

    // 4. Fetch School ID for Multi-tenancy & Stats
    const schoolCode = req.headers["x-school-code"];
    const school = await School.findOne({ code: schoolCode });
    if (!school) return res.status(404).json({ message: "School context not found" });

    // 5. Password Hashing
    const hashed = await bcrypt.hash(password, 10);

    // 6. Create Staff Record
    const staff = await Staff.create({
      name,
      employeeId,
      email: email.toLowerCase(),
      phone,
      role,
      subject: (role === "TEACHER" || role === "STAFF") ? subject : null, // Only store subject for relevant roles
      designation,
      salary,
      gender,
      joiningDate: joiningDate || Date.now(),
      passwordHash: hashed,
      status: "ACTIVE",
      tenantId: school._id // Linking the staff to the specific school
    });

    // 7. Update School Stats
    await SchoolStats.findOneAndUpdate(
      { schoolId: school._id },
      { $inc: { totalStaff: 1 } },
      { upsert: true }
    );

    res.status(201).json({ message: "Staff member created successfully", staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    const { Staff } = req.tenantModels;
    // We sort by creation date and exclude the password hash for security
    const staff = await Staff.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { Staff } = req.tenantModels;
    const { password, ...otherFields } = req.body;
    
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Handle role logic: If role changed to something other than Teacher/Staff, remove subject
    if (otherFields.role && otherFields.role !== "TEACHER" && otherFields.role !== "STAFF") {
        otherFields.subject = null;
    }

    // Apply updates
    Object.assign(staff, otherFields);

    // If password is provided, re-hash it
    if (password && password.trim() !== "") {
      staff.passwordHash = await bcrypt.hash(password, 10);
    }

    await staff.save();
    res.json({ message: "Staff profile updated successfully", staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { Staff } = req.tenantModels;
    const deleted = await Staff.findByIdAndDelete(req.params.id);

    if (deleted) {
      const schoolCode = req.headers["x-school-code"];
      const school = await School.findOne({ code: schoolCode });
      
      await SchoolStats.findOneAndUpdate(
        { schoolId: school._id },
        { $inc: { totalStaff: -1 } }
      );
    }
    res.json({ message: "Staff record permanently removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleStaff = async (req, res) => {
  try {
    const { Staff } = req.tenantModels;
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.status = staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await staff.save();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStaffProfile = async (req, res) => {
  const { Staff } = req.tenantModels;

  const staff = await Staff.findById(req.user.id).select("-passwordHash");

  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }

  res.json(staff);
};
