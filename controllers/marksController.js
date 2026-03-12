/* =====================================================
   ADD SINGLE MARK
===================================================== */
export const addMarks = async (req, res) => {
  try {
    const {
      academicRecordId,
      examType,
      subject,
      maxMarks,
      obtainedMarks
    } = req.body;

    const { Marks } = req.tenantModels;

    if (
      !academicRecordId ||
      !examType ||
      !subject ||
      maxMarks == null ||
      obtainedMarks == null
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (obtainedMarks > maxMarks) {
      return res.status(400).json({
        message: "Obtained marks cannot exceed max marks"
      });
    }

    const marks = await Marks.create({
      academicRecordId,
      examType,
      subject,
      maxMarks,
      obtainedMarks
    });

    res.status(201).json(marks);

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Marks already entered for this subject & exam"
      });
    }

    res.status(500).json({ error: error.message });
  }
};


/* =====================================================
   BULK ADD MARKS (Whole Class)
===================================================== */
export const bulkAddMarks = async (req, res) => {
  try {
    const { examType, subject, maxMarks, records } = req.body;
    const { Marks } = req.tenantModels;

    if (!examType || !subject || !maxMarks || !records) {
      return res.status(400).json({ message: "All fields required" });
    }

    const docs = records.map(r => ({
      academicRecordId: r.academicRecordId,
      examType,
      subject,
      maxMarks,
      obtainedMarks: r.obtainedMarks
    }));

    await Marks.insertMany(docs, { ordered: false });

    res.json({ message: "Marks saved successfully" });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Some marks already exist"
      });
    }

    res.status(500).json({ error: error.message });
  }
};


/* =====================================================
   GET MARKS BY ACADEMIC RECORD
===================================================== */
export const getStudentMarks = async (req, res) => {
  try {
    const { academicRecordId } = req.params;
    const { Marks } = req.tenantModels;

    const marks = await Marks.find({ academicRecordId });

    res.json(marks);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* =====================================================
   GET MARKS SUMMARY (Total + Percentage)
===================================================== */
export const getMarksSummary = async (req, res) => {
  try {
    const { academicRecordId, examType } = req.query;
    const { Marks } = req.tenantModels;

    const marks = await Marks.find({
      academicRecordId,
      examType
    });

    const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
    const totalObtained = marks.reduce((sum, m) => sum + m.obtainedMarks, 0);

    const percentage =
      totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

    res.json({
      totalMax,
      totalObtained,
      percentage
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* =====================================================
   UPDATE MARK
===================================================== */
export const updateMark = async (req, res) => {
  try {
    const { obtainedMarks } = req.body;
    const { Marks } = req.tenantModels;

    const mark = await Marks.findById(req.params.id);
    if (!mark) return res.status(404).json({ message: "Mark not found" });

    if (obtainedMarks > mark.maxMarks) {
      return res.status(400).json({
        message: "Obtained marks cannot exceed max marks"
      });
    }

    mark.obtainedMarks = obtainedMarks;
    await mark.save();

    res.json({ message: "Mark updated", mark });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* =====================================================
   DELETE MARK
===================================================== */
export const deleteMark = async (req, res) => {
  try {
    const { Marks } = req.tenantModels;

    await Marks.findByIdAndDelete(req.params.id);

    res.json({ message: "Mark deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
