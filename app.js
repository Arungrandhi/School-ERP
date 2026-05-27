import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import marksRoutes from "./routes/marksRoutes.js";

import geocodeRoutes from "./routes/geocodeRoutes.js";
import schoolSettingsRoutes from "./routes/schoolSettingsRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://school-college-erp.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/tenant", tenantRoutes);

app.use("/api/geocode", geocodeRoutes);
app.use("/api/school-settings",schoolSettingsRoutes);

app.use("/api/academic", academicRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);


export default app;
