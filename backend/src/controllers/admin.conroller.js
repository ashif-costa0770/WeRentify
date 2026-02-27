import Admin from "../models/admin.model.js";
import { generateToken } from "../utils/token.js";
import { successResponse, errorResponse } from "../utils/response.js";
import argon2 from "argon2";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return errorResponse(res, 401, "Invalid credentials, admin not found");
  }

  const isMatch = await argon2.verify(admin.password, password);

  if (!isMatch) {
    return errorResponse(res, 401, "Invalid credentials, wrong password");
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = generateToken(admin._id);
  
  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return successResponse(res, 200, "Admin logged in successfully", {
    _id: admin._id,
    role: admin.role
  });
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return errorResponse(res, 404, "Admin not found");
    }
    return successResponse(
      res,
      200,
      "Admin profile fetched successfully",
      admin,
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Server error fetching admin profile",
      error.message,
    );
  }
};
