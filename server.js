import dotenv from "dotenv";
import dns from "dns";
import app from "./app.js";
import { connectMasterDB } from "./config/dbMaster.js";

dotenv.config();

// ✅ Fix MongoDB Atlas DNS timeout issue
dns.setDefaultResultOrder("ipv4first");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMasterDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server startup error:", error);
  }
};

startServer();
