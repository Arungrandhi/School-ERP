import express from "express";
import {
  createSchool,
  getSchools,
  updateSchool,
  toggleSchoolStatus,
  deleteSchool
} from "../controllers/schoolController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* 🔐 Protect all school routes (Super Admin only) */
router.use(protect);

/* ===============================
   CREATE SCHOOL
================================ */
router.post("/", createSchool);

/* ===============================
   GET ALL SCHOOLS WITH STATS
================================ */
router.get("/", getSchools);

/* ===============================
   UPDATE SCHOOL
================================ */
router.put("/:id", updateSchool);

/* ===============================
   TOGGLE ACTIVE / INACTIVE
================================ */
router.patch("/:id/toggle", toggleSchoolStatus);

/* ===============================
   DELETE SCHOOL + TENANT DB
================================ */
router.delete("/:id", deleteSchool);

export default router;
