// routes/admin.routes.js

import express from "express";
import {
  activateUser,
  adminLogin,
  adminLogout,
  deactivateUser,
  deleteUserByAdmin,
  getAdminDashboardStats,
  getAdminProfile,
  getAllUsers,
  getUserDetailsByAdmin,
} from "../controllers/admin.conroller.js";
import validate from "../middlewares/validate.js";
import { adminLoginSchema } from "../validations/admin.validation.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Login
router.post("/login", validate(adminLoginSchema), adminLogin);

// Get admin profile
router.get("/me", verifyAdmin, getAdminProfile);

// Admin logout
router.post("/logout", verifyAdmin, adminLogout);

//Admin dashboard-stats
router.get("/dashboard-stats", verifyAdmin, getAdminDashboardStats);

//get all users
router.get("/users", verifyAdmin, getAllUsers);

//deactivate user
router.patch("/users/:userId/deactivate", verifyAdmin, deactivateUser);

//activate user
router.patch("/users/:userId/activate", verifyAdmin, activateUser);

//delete user
router.delete("/users/:userId", verifyAdmin, deleteUserByAdmin);

//get user details
router.get("/users/:userId", verifyAdmin, getUserDetailsByAdmin);

export default router;