import express from "express";
import {
  loginWithPhone,
  getMe,
  logout,
} from "../../controllers/user/auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", loginWithPhone);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
