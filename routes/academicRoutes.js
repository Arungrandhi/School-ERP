import express from "express";
import { tenantResolver } from "../middleware/tenantResolver.js";
import { promoteStudent , getStudentsByClass, getAcademicRecordByStudent } from "../controllers/academicController.js";

const router = express.Router();

router.post("/promote", tenantResolver, promoteStudent);


router.get("/by-class", tenantResolver, getStudentsByClass);


router.get(
  "/student/:studentId",
  tenantResolver,
  getAcademicRecordByStudent
);

export default router;
