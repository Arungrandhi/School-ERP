export const createFee = async (req, res) => {
  try {
    const { Fee, Student } = req.tenantModels;
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const { studentId, totalAmount } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const existingFee = await Fee.findOne({ studentId });
    if (existingFee) return res.status(400).json({ message: "Fee already assigned" });

    const fee = await Fee.create({
      studentId, totalAmount, paidAmount: 0,
      status: "PENDING", paymentHistory: []
    });

    res.status(201).json({ message: "Fee assigned successfully", fee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFees = async (req, res) => {
  try {

    const { Fee, AcademicRecord } = req.tenantModels;

    const fees = await Fee.find()
      .populate("studentId", "firstName lastName admissionNo")
      .sort({ createdAt: -1 });

    const formatted = [];

    for (const f of fees) {

      const record = await AcademicRecord.findOne({
        studentId: f.studentId?._id,
        status: "ACTIVE"
      });

      formatted.push({
        _id: f._id,
        totalAmount: f.totalAmount,
        paidAmount: f.paidAmount,
        status: f.status,

        student: {
          firstName: f.studentId?.firstName,
          lastName: f.studentId?.lastName,
          admissionNo: f.studentId?.admissionNo
        },

        className: record?.className || "-",
        section: record?.section || "-",
        academicYear: record?.academicYear || "-"
      });
    }

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fees" });
  }
};

export const collectPayment = async (req, res) => {
  try {
    const { Fee } = req.tenantModels;
    const { amount, mode } = req.body;

    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });

    fee.paidAmount += Number(amount);
    fee.paymentHistory.push({ amount: Number(amount), mode, date: new Date() });

    if (fee.paidAmount >= fee.totalAmount) fee.status = "PAID";
    else if (fee.paidAmount > 0) fee.status = "PARTIAL";

    await fee.save();
    res.json({ message: "Payment successful", fee });
  } catch (err) {
    res.status(500).json({ message: "Payment failed" });
  }
};