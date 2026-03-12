import School from "../models/master/School.js";

export const getSchoolProfile = async (req, res) => {
  try {
    const schoolCode = req.headers["x-school-code"];
    const school = await School.findOne({ code: schoolCode });
    if (!school) return res.status(404).json({ message: "School not found" });

    res.json({ name: school.name, code: school.code, status: school.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const { Student, Staff } = req.tenantModels;
    const activeStudents = await Student.countDocuments({ status: "ACTIVE" });
    const activeStaff = await Staff.countDocuments({ status: "ACTIVE" });

    res.json({ students: activeStudents, staff: activeStaff });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};