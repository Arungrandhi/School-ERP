import express from "express";
import { tenantResolver } from "../middleware/tenantResolver.js";
import { protect, isRole } from "../middleware/authMiddleware.js"; // Added isRole

// Import segregated controllers
import * as UserController from "../controllers/userController.js";
import * as StudentController from "../controllers/studentController.js";
import * as StaffController from "../controllers/staffController.js";
import * as FeeController from "../controllers/feeController.js";
import * as TenantSchoolController from "../controllers/tenantSchoolController.js";

const router = express.Router();

/* 
  Global Middleware for all Tenant Routes 
  1. tenantResolver MUST come first to identify which database to use.
  2. protect ensures the user is logged in.
*/
router.use(tenantResolver); 
router.use(protect);

/* ================= STAFF ROUTES ================= */

// 1. Own Profile (Must be ABOVE /:id routes)
// Accessible by any logged-in staff member
router.get("/staff-profile", protect, tenantResolver, StaffController.getStaffProfile);


// 2. Staff Management (Restricted Roles)
// ADMIN and PRINCIPAL can add staff
router.post(
  "/staff", 
  isRole(["ADMIN", "PRINCIPAL"]), 
  StaffController.createStaff
);

// ADMIN, PRINCIPAL, and ACCOUNTANT can view staff list
router.get(
  "/staff", 
  isRole(["ADMIN", "PRINCIPAL", "ACCOUNTANT"]), 
  StaffController.getStaff
);

// ADMIN and PRINCIPAL can update details
router.put(
  "/staff/:id", 
  isRole(["ADMIN", "PRINCIPAL"]), 
  StaffController.updateStaff
);

// ONLY ADMIN can permanently delete staff
router.delete(
  "/staff/:id", 
  isRole(["ADMIN"]), 
  StaffController.deleteStaff
);

// ADMIN and PRINCIPAL can disable/enable accounts
router.patch(
  "/staff/:id/toggle", 
  isRole(["ADMIN", "PRINCIPAL"]), 
  StaffController.toggleStaff
);


/* ================= STUDENT ROUTES ================= */

// Move profile above :id
router.get("/student-profile", StudentController.getStudentProfile);

router.post("/students", isRole(["ADMIN", "PRINCIPAL", "RECEPTIONIST"]), StudentController.createStudent);
router.get("/students", isRole(["ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTANT"]), StudentController.getStudents);
router.put("/students/:id", isRole(["ADMIN", "PRINCIPAL"]), StudentController.updateStudent);
router.delete("/students/:id", isRole(["ADMIN"]), StudentController.deleteStudent);
router.patch("/students/:id/toggle", isRole(["ADMIN", "PRINCIPAL"]), StudentController.toggleStudent);
router.post("/students", tenantResolver, StudentController.createStudent);



/* ================= FEE ROUTES ================= */

router.post("/fees", isRole(["ADMIN", "ACCOUNTANT"]), FeeController.createFee);
router.get("/fees", isRole(["ADMIN", "ACCOUNTANT", "PRINCIPAL"]), FeeController.getFees);
router.patch("/fees/:id/pay", isRole(["ADMIN", "ACCOUNTANT"]), FeeController.collectPayment);


/* ================= SCHOOL CONFIG ================= */

router.get("/school-profile", TenantSchoolController.getSchoolProfile);
router.get("/dashboard-stats", isRole(["ADMIN", "PRINCIPAL", "ACCOUNTANT"]), TenantSchoolController.getDashboardStats);

/* ================= USER ROUTES ================= */
router.post("/users", isRole(["ADMIN"]), UserController.createUser);

export default router;