import mongoose from "mongoose";

/* =====================================================
   MASTER MODELS  → stored in school_master database
===================================================== */

// ---------- Super Admin ----------
const superAdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, default: "SUPER_ADMIN" },
  },
  { timestamps: true }
);

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);

// ---------- School ----------
const schoolSchema = new mongoose.Schema(
  {
    name: String,
    code: { type: String, unique: true, uppercase: true },
    dbName: { type: String, unique: true },
    location: String,        // ✅ NEW
    email: String,           // ✅ NEW (school contact email)
    status: { type: String, default: "ACTIVE" },
    plan: { type: String, default: "FREE" },
  },
  { timestamps: true }
);


export const School = mongoose.model("School", schoolSchema);

// ---------- School Stats ----------
const schoolStatsSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", unique: true },
    totalStudents: { type: Number, default: 0 },
    totalStaff: { type: Number, default: 0 },
    totalFeesCollected: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SchoolStats = mongoose.model("SchoolStats", schoolStatsSchema);

/* =====================================================
   TENANT SCHEMAS → stored in separate school databases
===================================================== */

// ---------- User ----------
export const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    passwordHash: String,
    role: {
      type: String,
      enum: ["ADMIN", "PRINCIPAL", "TEACHER", "STAFF", "PARENT"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ---------- Student ----------
export const studentSchema = new mongoose.Schema(
  {
    firstName: String, 
    lastName: String,
    admissionNo: { type: String, unique: true },
    passwordHash: String,
    status: { type: String, default: "ACTIVE" },
  },
  { timestamps: true }
);

// ---------- Staff ----------
export const staffSchema = new mongoose.Schema(
  {
    name: String,
    employeeId: { type: String, unique: true },
    designation: String,
    salary: Number,
  },
  { timestamps: true }
);

// ---------- Fee ----------
export const feeSchema = new mongoose.Schema(
  {
    studentId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    paidAmount: { type: Number, default: 0 },
    status: { type: String, default: "PENDING" },
  },
  { timestamps: true }
);



export const academicRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    className: String,
    section: String,
    academicYear: String,
    status: { type: String, default: "ACTIVE" },
  },
  { timestamps: true }
);

/* =====================================================
   REGISTER TENANT MODELS PER SCHOOL CONNECTION
===================================================== */

export const registerTenantModels = (connection) => {
  return {
    User: connection.models.User || connection.model("User", userSchema),
    Student: connection.models.Student || connection.model("Student", studentSchema),
    Staff: connection.models.Staff || connection.model("Staff", staffSchema),
    Fee: connection.models.Fee || connection.model("Fee", feeSchema),
    // ADD THIS LINE:
    AcademicRecord: connection.models.AcademicRecord || connection.model("AcademicRecord", academicRecordSchema),
  };
};
