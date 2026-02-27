// routes/admin.routes.js

import express from "express";
import {
  adminLogin,
  getAdminProfile,
} from "../controllers/admin.conroller.js";
import validate from "../middlewares/validate.js";
import { adminLoginSchema } from "../validations/admin.validation.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Login
router.post("/login", validate(adminLoginSchema), adminLogin);

// Get own profile
router.get("/", verifyAdmin, getAdminProfile);

export default router;