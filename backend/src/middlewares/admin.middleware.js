import { verifyToken } from "../utils/token.js";
import Admin from "../models/admin/admin.model.js";
import { errorResponse } from "../utils/response.js";

export const verifyAdmin = async (req, res, next) => {
  const token =
    req.cookies.adminToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return errorResponse(res, 401, "No token provided");
  }

  let decoded;
  try {
    decoded = verifyToken(token, {
      secret: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
    });
  } catch {
    return errorResponse(res, 401, "Invalid or expired admin token");
  }

  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    return errorResponse(res, 401, "Invalid admin, admin not found");
  }
  req.admin = admin;
  next();
};
