import { getTenantDB } from "../config/dbTenant.js";
import { registerTenantModels } from "../models/tenant/registerTenantModels.js";

export const tenantResolver = async (req, res, next) => {
  try {
    // 1. Extract and Sanitize Header
    const schoolCode = req.headers["x-school-code"]?.trim();

    if (!schoolCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Identification Failure: 'x-school-code' header is required to route request." 
      });
    }

    // 2. Security: Validate School Code format (prevent NoSQL/Path injection)
    // Only allow alphanumeric, dashes, and underscores
    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(schoolCode);
    if (!isValidFormat) {
      return res.status(400).json({ success: false, message: "Invalid School Code format." });
    }

    const normalizedCode = schoolCode.toLowerCase();
    const dbName = `school_${normalizedCode}`;

    // 3. Get Database Connection
    // getTenantDB should ideally return a cached connection from a Map
    const tenantDB = await getTenantDB(dbName);

    if (!tenantDB) {
      return res.status(404).json({ success: false, message: "School instance not found." });
    }

    // 4. Attach Models (Optimized)
    // We attach them to req.tenantModels so controllers can use: 
    // const { Staff } = req.tenantModels;
    req.tenantModels = registerTenantModels(tenantDB);

    // 5. Attach School Info for audit logs or controllers
    req.schoolCode = normalizedCode;
    
    next();
  } catch (error) {
    // Detailed logging for developers, generic message for users
    console.error(`[TenantResolver Error] for ${req.headers["x-school-code"]}:`, error.message);
    
    res.status(500).json({ 
      success: false, 
      message: "An internal error occurred while connecting to the school database." 
    });
  }
};