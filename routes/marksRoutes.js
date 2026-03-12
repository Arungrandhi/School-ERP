import express from "express";
import { tenantResolver } from "../middleware/tenantResolver.js";
import {
  addMarks,
  bulkAddMarks,
  getStudentMarks,
  getMarksSummary,
  updateMark,
  deleteMark
} from "../controllers/marksController.js";

const router = express.Router();

/* Single mark */
router.post("/add", tenantResolver, addMarks);

/* Bulk marks */
router.post("/bulk", tenantResolver, bulkAddMarks);

/* Get student marks */
router.get("/:academicRecordId", tenantResolver, getStudentMarks);

/* Get summary */
router.get("/summary", tenantResolver, getMarksSummary);

/* Update */
router.put("/:id", tenantResolver, updateMark);

/* Delete */
router.delete("/:id", tenantResolver, deleteMark);

export default router;
