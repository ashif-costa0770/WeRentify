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
  getAllListingsByAdmin,
  getAllServicesByAdmin,
  getListingDetailsByAdmin,
  getServiceDetailsByAdmin,
  getAllPostsByAdmin,
  getPostDetailsByAdmin,
  getAllPlansByAdmin,
  createPlanByAdmin,
  getPlanDetailsByAdmin,
  updatePlanByAdmin,
  deleteListingByAdmin,
  deleteServiceByAdmin,
  deletePostByAdmin,
  deactivatePlanByAdmin,
  activatePlanByAdmin,
  getUserDetailsByAdmin,
  toggleListingStatusByAdmin,
  toggleServiceStatusByAdmin,
  getAdminBookings,
  updateBookingStatusByAdmin,
  getBookingDetailsByAdmin,
} from "../controllers/admin.controller.js";
import validate from "../middlewares/validate.js";
import { adminLoginSchema } from "../validations/admin.validation.js";
import { createPlanSchema, updatePlanSchema } from "../validations/plan.validation.js";
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

//get all listings
router.get("/listings", verifyAdmin, getAllListingsByAdmin);
router.get("/listings/:listingId", verifyAdmin, getListingDetailsByAdmin);
router.delete("/listings/:listingId", verifyAdmin, deleteListingByAdmin);

//get all services
router.get("/services", verifyAdmin, getAllServicesByAdmin);
router.get("/services/:serviceId", verifyAdmin, getServiceDetailsByAdmin);
router.delete("/services/:serviceId", verifyAdmin, deleteServiceByAdmin);

//get all posts
router.get("/posts", verifyAdmin, getAllPostsByAdmin);
router.get("/posts/:postId", verifyAdmin, getPostDetailsByAdmin);
router.delete("/posts/:postId", verifyAdmin, deletePostByAdmin);

//bookings
router.get("/bookings", verifyAdmin, getAdminBookings);
router.get("/bookings/:bookingId", verifyAdmin, getBookingDetailsByAdmin);
router.patch("/bookings/:bookingId/status", verifyAdmin, updateBookingStatusByAdmin);

//get all plans
router.get("/plans", verifyAdmin, getAllPlansByAdmin);
router.post("/plans", verifyAdmin, validate(createPlanSchema), createPlanByAdmin);
router.get("/plans/:planId", verifyAdmin, getPlanDetailsByAdmin);
router.put("/plans/:planId", verifyAdmin, validate(updatePlanSchema), updatePlanByAdmin);
router.patch("/plans/:planId/deactivate", verifyAdmin, deactivatePlanByAdmin);
router.patch("/plans/:planId/activate", verifyAdmin, activatePlanByAdmin);

//deactivate user
router.patch("/users/:userId/deactivate", verifyAdmin, deactivateUser);

//activate user
router.patch("/users/:userId/activate", verifyAdmin, activateUser);

//delete user
router.delete("/users/:userId", verifyAdmin, deleteUserByAdmin);

//get user details
router.get("/users/:userId", verifyAdmin, getUserDetailsByAdmin);

//toggle listing status
router.patch("/listings/:listingId/toggle-status", verifyAdmin, toggleListingStatusByAdmin);

//toggle service status
router.patch("/services/:serviceId/toggle-status", verifyAdmin, toggleServiceStatusByAdmin);

export default router;