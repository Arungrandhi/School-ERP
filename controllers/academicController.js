export const promoteStudent = async (req, res) => {
  try {
    const { studentId, newClass, newSection, academicYear } = req.body;

    const { Student, AcademicRecord } = req.tenantModels;

    if (!studentId || !newClass || !academicYear) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 1️⃣ Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Check if already promoted for this academic year
    const existingYear = await AcademicRecord.findOne({
      studentId,
      academicYear
    });

    if (existingYear) {
      return res.status(400).json({
        message: "Student already has academic record for this year"
      });
    }

    // 3️⃣ Close previous active record
    const previous = await AcademicRecord.findOne({
      studentId,
      status: "ACTIVE"
    });

    if (!previous) {
      return res.status(400).json({
        message: "No active academic record found"
      });
    }

    previous.status = "PASSED";
    await previous.save();

    // 4️⃣ Create new academic record
    const newRecord = await AcademicRecord.create({
      studentId,
      className: newClass,
      section: newSection || previous.section,
      academicYear,
      status: "ACTIVE"
    });

    res.json({
      success: true,
      message: "Student promoted successfully",
      previousRecord: previous,
      newRecord
    });

  } catch (error) {
    console.error("Promotion Error:", error);
    res.status(500).json({ message: error.message });
  }
};



/* ======================================================
   GET STUDENTS BY CLASS + SECTION + ACADEMIC YEAR
====================================================== */
export const getStudentsByClass = async (req, res) => {
  try {
    const { Student, AcademicRecord } = req.tenantModels;
    const { className, section, academicYear } = req.query;

    // FIX: Only className and academicYear are strictly required now
    if (!className || !academicYear) {
      return res.status(400).json({
        message: "className and academicYear are required"
      });
    }

    // Build the query object dynamically
    const queryObj = {
      className,
      academicYear,
      status: "ACTIVE"
    };

    // Only add section to the search if it's actually provided
    if (section && section.trim() !== "") {
      queryObj.section = section;
    }

    // 1️⃣ Find ACTIVE academic records
    const records = await AcademicRecord.find(queryObj).lean();

    if (records.length === 0) {
      return res.json([]);
    }

    // 2️⃣ Get student IDs
    const studentIds = records.map(r => r.studentId);

    // 3️⃣ Fetch active students
    const students = await Student.find({
      _id: { $in: studentIds },
      status: "ACTIVE"
    }).lean();

    // 4️⃣ Merge student + academic record
    const formatted = students.map(student => {
      const record = records.find(
        r => r.studentId.toString() === student._id.toString()
      );

      return {
        academicRecordId: record._id,
        studentId: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNo: student.admissionNo,
        className: record.className,
        section: record.section,
        academicYear: record.academicYear
      };
    });

    res.json(formatted);

  } catch (error) {
    console.error("Get Students By Class Error:", error);
    res.status(500).json({ message: error.message });
  }
};