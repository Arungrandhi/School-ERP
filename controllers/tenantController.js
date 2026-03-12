// import bcrypt from "bcryptjs";
// import School from "../models/master/School.js";
// import SchoolStats from "../models/master/SchoolStats.js";


// /* ==========================================
//    CREATE USER (ADMIN / PRINCIPAL / TEACHER)
// ========================================== */
// export const createUser = async (req, res) => {
//   try {
//     const { User } = req.tenantModels;

//     // 🔐 Only ADMIN can create users
//     if (req.user.role !== "ADMIN") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const { name, email, password, role } = req.body;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // 🔐 Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       passwordHash: hashedPassword,
//       role
//     });

//     res.status(201).json({
//       message: "User created successfully",
//       user
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// /* ==========================================
//    CREATE STUDENT
// ========================================== */
// export const createStudent = async (req, res) => {
//   try {
//     const { Student } = req.tenantModels;

//     if (!["ADMIN", "PRINCIPAL"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const { name, admissionNo, className, section, password } = req.body;

//     if (!name || !admissionNo || !password) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     const existing = await Student.findOne({ admissionNo });
//     if (existing) {
//       return res.status(400).json({ message: "Admission number already exists" });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const student = await Student.create({
//       name,
//       admissionNo,
//       className,
//       section,
//       passwordHash: hashed,
//       status: "ACTIVE"
//     });

//     const schoolCode = req.headers["x-school-code"];
//     const school = await School.findOne({ code: schoolCode });

//     await SchoolStats.findOneAndUpdate(
//       { schoolId: school._id },
//       { $inc: { totalStudents: 1 } },
//       { upsert: true }
//     );

//     res.status(201).json({
//       message: "Student created successfully",
//       student
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// export const toggleStudent = async (req, res) => {
//   const { Student } = req.tenantModels;

//   const student = await Student.findById(req.params.id);

//   if (!student) {
//     return res.status(404).json({ message: "Student not found" });
//   }

//   student.status =
//     student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

//   await student.save();

//   res.json(student);
// };



// /* ==========================================
//    CREATE STAFF
// ========================================== */
// export const createStaff = async (req, res) => {
//   try {
//     const { Staff } = req.tenantModels;

//     if (req.user.role !== "ADMIN") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const { name, employeeId, designation, salary, password } = req.body;

//     if (!name || !employeeId || !password) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     const existing = await Staff.findOne({ employeeId });
//     if (existing) {
//       return res.status(400).json({ message: "Employee ID already exists" });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const staff = await Staff.create({
//       name,
//       employeeId,
//       designation,
//       salary,
//       passwordHash: hashed,
//       status: "ACTIVE"
//     });

//     const schoolCode = req.headers["x-school-code"];
//     const school = await School.findOne({ code: schoolCode });

//     await SchoolStats.findOneAndUpdate(
//       { schoolId: school._id },
//       { $inc: { totalStaff: 1 } },
//       { upsert: true }
//     );

//     res.status(201).json({
//       message: "Staff created successfully",
//       staff
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const toggleStaff = async (req, res) => {
//   const { Staff } = req.tenantModels;

//   const staff = await Staff.findById(req.params.id);

//   if (!staff) {
//     return res.status(404).json({ message: "Staff not found" });
//   }

//   staff.status =
//     staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

//   await staff.save();

//   res.json(staff);
// };



// /* ==========================================
//    CREATE FEE
// ========================================== */
// export const createFee = async (req, res) => {
//   try {
//     const { Fee, Student } = req.tenantModels;

//     if (req.user.role !== "ADMIN") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const { studentId, totalAmount } = req.body;

//     if (!studentId || !totalAmount) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const existingFee = await Fee.findOne({ studentId });
//     if (existingFee) {
//       return res.status(400).json({ message: "Fee already assigned" });
//     }

//     const fee = await Fee.create({
//       studentId,
//       totalAmount,
//       paidAmount: 0,
//       status: "PENDING",
//       paymentHistory: []
//     });

//     res.status(201).json({
//       message: "Fee assigned successfully",
//       fee
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getFees = async (req, res) => {
//   try {
//     const { Fee } = req.tenantModels;

//     const fees = await Fee.find()
//       .populate("studentId")
//       .sort({ createdAt: -1 });

//     const formatted = fees.map(f => ({
//       ...f.toObject(),
//       student: f.studentId
//     }));

//     res.json(formatted);

//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch fees" });
//   }
// };

// export const collectPayment = async (req, res) => {
//   try {
//     const { Fee } = req.tenantModels;

//     const { amount, mode } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: "Invalid payment amount" });
//     }

//     const fee = await Fee.findById(req.params.id);

//     if (!fee) {
//       return res.status(404).json({ message: "Fee record not found" });
//     }

//     fee.paidAmount += Number(amount);

//     fee.paymentHistory.push({
//       amount: Number(amount),
//       mode,
//       date: new Date()
//     });

//     // 🔥 AUTO STATUS UPDATE
//     if (fee.paidAmount >= fee.totalAmount) {
//       fee.status = "PAID";
//     } else if (fee.paidAmount > 0) {
//       fee.status = "PARTIAL";
//     } else {
//       fee.status = "PENDING";
//     }

//     await fee.save();

//     res.json({
//       message: "Payment successful",
//       fee
//     });

//   } catch (err) {
//     res.status(500).json({ message: "Payment failed" });
//   }
// };



// export const getStudents = async (req, res) => {
//   const { Student } = req.tenantModels;
//   const students = await Student.find().sort({ createdAt: -1 });
//   res.json(students);
// };


// export const updateStudent = async (req, res) => {
//   try {
//     const { Student } = req.tenantModels;
//     const { id } = req.params;
//     const { password, ...otherFields } = req.body;

//     const student = await Student.findById(id);

//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Update normal fields
//     Object.assign(student, otherFields);

//     // 🔐 If new password provided
//     if (password && password.trim() !== "") {
//       const hashed = await bcrypt.hash(password, 10);
//       student.passwordHash = hashed;
//     }

//     await student.save();

//     res.json({ message: "Student updated", student });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };




// export const deleteStudent = async (req, res) => {
//   const { Student } = req.tenantModels;

//   const deleted = await Student.findByIdAndDelete(req.params.id);

//   if (deleted) {
//     const schoolCode = req.headers["x-school-code"];
//     const school = await School.findOne({ code: schoolCode });

//     await SchoolStats.findOneAndUpdate(
//       { schoolId: school._id },
//       { $inc: { totalStudents: -1 } }
//     );
//   }

//   res.json({ message: "Student deleted" });
// };


// export const updateStaff = async (req, res) => {
//   try {
//     const { Staff } = req.tenantModels;
//     const { id } = req.params;
//     const { password, ...otherFields } = req.body;

//     const staff = await Staff.findById(id);

//     if (!staff) {
//       return res.status(404).json({ message: "Staff not found" });
//     }

//     Object.assign(staff, otherFields);

//     // 🔐 If new password provided
//     if (password && password.trim() !== "") {
//       const hashed = await bcrypt.hash(password, 10);
//       staff.passwordHash = hashed;
//     }

//     await staff.save();

//     res.json({ message: "Staff updated", staff });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// export const getStaff = async (req, res) => {
//   const { Staff } = req.tenantModels;
//   const staff = await Staff.find().sort({ createdAt: -1 });
//   res.json(staff);
// };

// export const deleteStaff = async (req, res) => {
//   const { Staff } = req.tenantModels;

//   const deleted = await Staff.findByIdAndDelete(req.params.id);

//   if (deleted) {
//     const schoolCode = req.headers["x-school-code"];
//     const school = await School.findOne({ code: schoolCode });

//     await SchoolStats.findOneAndUpdate(
//       { schoolId: school._id },
//       { $inc: { totalStaff: -1 } }
//     );
//   }

//   res.json({ message: "Staff deleted" });
// };



// export const getSchoolProfile = async (req, res) => {
//   try {
//     const schoolCode = req.headers["x-school-code"];

//     const school = await School.findOne({ code: schoolCode });

//     if (!school) {
//       return res.status(404).json({ message: "School not found" });
//     }

//     res.json({
//       name: school.name,
//       code: school.code,
//       status: school.status
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getStudentProfile = async (req, res) => {
//   const { Student } = req.tenantModels;

//   const student = await Student.findById(req.user.id).select("-passwordHash");

//   res.json(student);
// };

// export const getStaffProfile = async (req, res) => {
//   const { Staff } = req.tenantModels;

//   const staff = await Staff.findById(req.user.id).select("-passwordHash");

//   res.json(staff);
// };


// export const getDashboardStats = async (req, res) => {
//   try {
//     const { Student, Staff } = req.tenantModels;

//     const activeStudents = await Student.countDocuments({ status: "ACTIVE" });
//     const activeStaff = await Staff.countDocuments({ status: "ACTIVE" });

//     res.json({
//       students: activeStudents,
//       staff: activeStaff
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch dashboard stats" });
//   }
// };

