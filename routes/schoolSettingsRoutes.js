import express from "express";

import { tenantResolver } from "../middleware/tenantResolver.js";

import {
  saveSchoolLocation,
  getSchoolLocation,
} from "../controllers/schoolSettingsController.js";

const router = express.Router();

/* =========================================
   SAVE / UPDATE SCHOOL LOCATION
========================================= */
router.post(
  "/location",
  tenantResolver,
  saveSchoolLocation
);

/* =========================================
   GET SCHOOL LOCATION
========================================= */
router.get(
  "/location",
  tenantResolver,
  getSchoolLocation
);

export default router;