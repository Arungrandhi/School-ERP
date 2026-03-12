import express from "express";
import { tenantResolver } from "../middleware/tenantResolver.js";
import {
  markAttendance,
  getStudentAttendance,
  bulkMarkAttendance,
  getClassAttendance,
  getMonthlyAttendanceSummary
} from "../controllers/attendanceController.js";

const router = express.Router();

/* =====================================================
   BULK MARK ATTENDANCE (Whole Class - Session Wise)
   POST /api/attendance/bulk
===================================================== */
router.post("/bulk", tenantResolver, bulkMarkAttendance);

/* =====================================================
   GET STUDENT ATTENDANCE REPORT (Fix for History Modal)
   GET /api/attendance/student-report
   Expected Query Params: academicRecordId, startDate, endDate
===================================================== */
router.get("/student-report", tenantResolver, getStudentAttendance);

/* =====================================================
   GET CLASS ATTENDANCE (For Main Page Load)
   GET /api/attendance/class
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
===================================================== */
router.post("/", tenantResolver, markAttendance);

export default router;