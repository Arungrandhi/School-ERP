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
      className:
        String(newClass)
          .replace("th", "")
          .replace("st", "")
          .replace("nd", "")
          .replace("rd", "")
          .trim(),
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
   GET STUDENTS BY CLASS
====================================================== */
export const getStudentsByClass =
  async (req, res) => {

    try {

      const {
        className,
        section,
      } = req.query;

      const {
        AcademicRecord,
        Student,
      } = req.tenantModels;

      if (!className || !section) {

        return res.status(400).json({
          message:
            "className and section are required",
        });
      }

      /* =========================================
         FETCH STUDENTS
      ========================================= */
      const students =
        await AcademicRecord.find({
          className,
          section,
          status: "ACTIVE",
        })

          .populate({
            path: "studentId",

            // IMPORTANT FOR MULTI TENANT
            model: Student,

            select:
              "firstName lastName admissionNo",
          })

          .sort({
            createdAt: 1,
          })

          .lean();

      /* =========================================
         REMOVE INVALID RECORDS
      ========================================= */
      const validStudents =
        students.filter(
          (s) => s.studentId
        );

      console.log(
        "CLASS STUDENTS:",
        validStudents
      );

      res.json(validStudents);

    } catch (error) {

      console.error(
        "GET STUDENTS ERROR:",
        error
      );

      res.status(500).json({
        message: error.message,
      });
    }
  };



  /* ======================================================
   GET ACTIVE ACADEMIC RECORD BY STUDENT
====================================================== */
export const getAcademicRecordByStudent =
  async (req, res) => {

    try {

      const { AcademicRecord } =
        req.tenantModels;

      const record =
        await AcademicRecord.findOne({
          studentId:
            req.params.studentId,

          status: "ACTIVE",
        });

      if (!record) {

        return res.status(404).json({
          message:
            "Academic record not found",
        });
      }

      res.json(record);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };