import express from "express";

import { tenantResolver } from "../middleware/tenantResolver.js";

import {
  markAttendance,
  getStudentAttendance,
  bulkMarkAttendance,
  getAttendanceClasses,
  getClassAttendance,
  getMonthlyAttendanceSummary,
  staffPunchIn,
  punchOut,
  monthlyReport,
  attendanceHistory,
  getAllStaffAttendanceHistory,
} from "../controllers/attendanceController.js";

const router = express.Router();

/* =====================================================
   TEST ROUTE
===================================================== */
router.get("/test", (req, res) => {
  res.json({
    message: "Attendance route working",
  });
});

/* =====================================================
   STAFF PUNCH-IN
===================================================== */
router.post(
  "/punch-in",
  tenantResolver,
  staffPunchIn
);

/* =====================================================
   STAFF PUNCH-OUT
===================================================== */
router.post(
  "/punch-out",
  tenantResolver,
  punchOut
);


/* =====================================================
   ALL STAFF ATTENDANCE HISTORY
===================================================== */
router.get(
  "/all-history",
  tenantResolver,
  getAllStaffAttendanceHistory
);

/* =====================================================
   MONTHLY REPORT
===================================================== */
router.get(
  "/monthly-report",
  tenantResolver,
  monthlyReport
);

/* =====================================================
   ATTENDANCE HISTORY
===================================================== */
router.get(
  "/history/:academicRecordId",
  tenantResolver,
  attendanceHistory
);

/* =====================================================
   BULK ATTENDANCE
===================================================== */
router.post(
  "/bulk",
  tenantResolver,
  bulkMarkAttendance
);




router.get(
  "/classes",
  tenantResolver,
  getAttendanceClasses
);

/* =====================================================
   STUDENT ATTENDANCE REPORT
===================================================== */
router.get(
  "/student-report",
  tenantResolver,
  getStudentAttendance
);

/* =====================================================
   CLASS ATTENDANCE
===================================================== */
router.get(
  "/class",
  tenantResolver,
  getClassAttendance
);

/* =====================================================
   MONTHLY SUMMARY
===================================================== */
router.get(
  "/monthly-summary",
  tenantResolver,
  getMonthlyAttendanceSummary
);

/* =====================================================
   SINGLE ATTENDANCE
===================================================== */
router.post(
  "/",
  tenantResolver,
  markAttendance
);

export default router;