import express from "express";
import { tenantResolver } from "../middleware/tenantResolver.js";
import {
  markAttendance,
  getStudentAttendance,
  bulkMarkAttendance,
  getClassAttendance,
  getMonthlyAttendanceSummary,
  staffPunchIn                    // ✅ NEW
} from "../controllers/attendanceController.js";

const router = express.Router();

/* =====================================================
   ✅ NEW: STAFF PUNCH-IN WITH LOCATION
   POST /api/attendance/punch-in
   Body: { academicRecordId, session, punchInLocation: { latitude, longitude, address, accuracy } }
===================================================== */
router.post("/punch-in", tenantResolver, staffPunchIn);

/* =====================================================
   BULK MARK ATTENDANCE (Whole Class - Session Wise)
   POST /api/attendance/bulk
   Body now accepts optional: punchInLocation
===================================================== */
router.post("/bulk", tenantResolver, bulkMarkAttendance);

/* =====================================================
   GET STUDENT ATTENDANCE REPORT
   GET /api/attendance/student-report
   Query: academicRecordId, startDate, endDate
===================================================== */
router.get("/student-report", tenantResolver, getStudentAttendance);

/* =====================================================
   GET CLASS ATTENDANCE
   GET /api/attendance/class
   Query: date, session
===================================================== */
router.get("/class", tenantResolver, getClassAttendance);

/* =====================================================
   GET MONTHLY SUMMARY
   GET /api/attendance/monthly-summary
===================================================== */
router.get("/monthly-summary", tenantResolver, getMonthlyAttendanceSummary);

/* =====================================================
   MARK SINGLE STUDENT ATTENDANCE
   POST /api/attendance
   Body now accepts optional: punchInLocation
===================================================== */
router.post("/", tenantResolver, markAttendance);

export default router;