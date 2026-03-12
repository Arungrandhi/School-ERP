import jwt from "jsonwebtoken";

/**
 * PROTECT: Verifies JWT and attaches user to request
 * Also ensures the user belongs to the requested school (tenant)
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request
    req.user = decoded;

    // CROSS-TENANT SECURITY CHECK:
    // Ensure the schoolCode in the token matches the schoolCode in the header.
    // This prevents a user from School A using their token to view School B's staff.
    const schoolHeader = req.headers["x-school-code"];
    if (schoolHeader && decoded.schoolCode !== schoolHeader) {
      return res.status(403).json({ message: "Access denied. Token does not match school context." });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }
    res.status(401).json({ message: "Invalid token." });
  }
};

/**
 * IS_ROLE: Restricts access to specific staff roles
 * Usage: isRole(["ADMIN", "PRINCIPAL"])
 */
export const isRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Convert single string role to array if necessary
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Permission denied. Required role: ${allowedRoles.join(" or ")}` 
      });
    }

    next();
  };
};