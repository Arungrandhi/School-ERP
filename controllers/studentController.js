import bcrypt from "bcryptjs";
import School from "../models/master/School.js";
import SchoolStats from "../models/master/SchoolStats.js";


export const createStudent = async (req, res) => {
  try {
    const { Student, AcademicRecord } = req.tenantModels;

    const {
      firstName,
      lastName,
      admissionNo,
      password,
      className,
      section,
      academicYear
    } = req.body;

    if (!firstName || !admissionNo || !password || !className || !academicYear) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await Student.findOne({ admissionNo });
    if (exists) {
      return res.status(400).json({ message: "Admission number already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const student = await Student.create({
      firstName,
      lastName,
      admissionNo,
      passwordHash: hashed,
      status: "ACTIVE"
    });

    await AcademicRecord.create({
      studentId: student._id,
      className,
      section,
      academicYear,
      status: "ACTIVE"
    });

    // ✅ Update Master Stats
    const schoolCode = req.schoolCode?.toUpperCase();
    const school = await School.findOne({ code: schoolCode });

    if (school) {
      await SchoolStats.findOneAndUpdate(
        { schoolId: school._id },
        { $inc: { totalStudents: 1 } }
      );
    }

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student
    });

  } catch (err) {
    console.error("Create Student Error:", err);
    res.status(500).json({ message: err.message });
  }
};



export const getStudents = async (req, res) => {
  try {
    const { Student, AcademicRecord } = req.tenantModels;

    // Check if models exist
    if (!Student || !AcademicRecord) {
        return res.status(500).json({ message: "Models not initialized correctly" });
    }

    const students = await Student.find().sort({ createdAt: -1 }).lean();
    const records = await AcademicRecord.find({ status: "ACTIVE" }).lean();

    const recordMap = {};
    records.forEach(r => {
      if (r.studentId) {
        recordMap[r.studentId.toString()] = r;
      }
    });

    const formatted = students.map(s => ({
      _id: s._id,
      firstName: s.firstName || "N/A",
      lastName: s.lastName || "",
      admissionNo: s.admissionNo,
      status: s.status,
      currentClass: recordMap[s._id.toString()]?.className || "N/A",
      currentSection: recordMap[s._id.toString()]?.section || "N/A",
      currentYear: recordMap[s._id.toString()]?.academicYear || "N/A"
    }));

    res.json(formatted);

  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


export const updateStudent = async (req, res) => {
  try {
    const { Student } = req.tenantModels;

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        admissionNo: req.body.admissionNo
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      success: true,
      message: "Student updated successfully",
      student: updated
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const deleteStudent = async (req, res) => {
  try {
    const { Student, AcademicRecord } = req.tenantModels;

    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }

    await AcademicRecord.deleteMany({ studentId: deleted._id });

    const schoolCode = req.schoolCode?.toUpperCase();
    const school = await School.findOne({ code: schoolCode });

    if (school) {
      await SchoolStats.findOneAndUpdate(
        { schoolId: school._id },
        { $inc: { totalStudents: -1 } }
      );
    }

    res.json({
      success: true,
      message: "Student deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
  

export const toggleStudent = async (req, res) => {
  try {
    const { Student } = req.tenantModels;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.status = student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await student.save();

    res.json(student);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getStudentProfile = async (req, res) => {
  try {
    const { Student, AcademicRecord } = req.tenantModels;

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const activeRecord = await AcademicRecord.findOne({
      studentId: student._id,
      status: "ACTIVE"
    });

    res.json({
      ...student.toObject(),
      currentClass: activeRecord?.className || null,
      currentSection: activeRecord?.section || null,
      currentYear: activeRecord?.academicYear || null
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
