import userSchema from "./User.js";
import studentSchema from "./Student.js";
import staffSchema from "./Staff.js";
import feeSchema from "./Fee.js";
import attendanceSchema from "./Attendance.js";
import marksSchema from "./Marks.js";
import academicRecordSchema from "./AcademicRecord.js";
// Suggested additions for a complete ERP:
// import classSchema from "./Class.js"; 
// import sectionSchema from "./Section.js";

/**
 * Registers and returns models for a specific tenant connection.
 * This ensures that models are scoped to the correct database.
 */
export const registerTenantModels = (connection) => {
  return {
    // Authentication & Users
    User: connection.models.User || connection.model("User", userSchema),
    
    // HR & Staff (This now uses your updated Staff schema with roles/subjects)
    Staff: connection.models.Staff || connection.model("Staff", staffSchema),
    
    // Academic Management
    Student: connection.models.Student || connection.model("Student", studentSchema),
    AcademicRecord: connection.models.AcademicRecord || connection.model("AcademicRecord", academicRecordSchema),
    
    // Operations
    Attendance: connection.models.Attendance || connection.model("Attendance", attendanceSchema),
    Marks: connection.models.Marks || connection.model("Marks", marksSchema),
    
    // Finance
    Fee: connection.models.Fee || connection.model("Fee", feeSchema),

    /* Future proofing: Uncomment these as you create the schemas */
    // Class: connection.models.Class || connection.model("Class", classSchema),
    // Section: connection.models.Section || connection.model("Section", sectionSchema),
  };
};