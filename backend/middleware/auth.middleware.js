const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        error: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin) {
      return res.status(401).json({
        error: "Not authorized, admin not found",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      error: "Not authorized, invalid or expired token",
    });
  }
};

module.exports = { protect };
