import express from "express";
import { reverseGeocode } from "../controllers/geocodeController.js";

const router = express.Router();

/* =====================================================
   REVERSE GEOCODE PROXY
   GET /api/geocode/reverse?lat=17.3850&lon=78.4867
   Returns: { address: "...", raw: { ... } }
===================================================== */
router.get("/reverse", reverseGeocode);

export default router;
