import express from "express";
import { superAdminLogin, schoolLogin, studentLogin, staffLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/superadmin/login", superAdminLogin);
router.post("/school/login", schoolLogin);
router.post("/student-login", studentLogin);
router.post("/staff-login", staffLogin);


export default router;
