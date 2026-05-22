import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import marksRoutes from "./routes/marksRoutes.js";

import geocodeRoutes from "./routes/geocodeRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/tenant", tenantRoutes);

app.use("/api/geocode", geocodeRoutes);


app.use("/api/academic", academicRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);


export default app;
