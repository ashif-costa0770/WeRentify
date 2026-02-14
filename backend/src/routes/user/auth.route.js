import express from "express";
import {
  // loginWithPhone,
  verifyEmail,
  verifyOtp,
  createUser,
  resendOtp ,
  getMe,
  logout,
  login,
} from "../../controllers/user/auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.js";
import { loginSchema, registerSchema } from "../../validations/auth.validation.js";

const router = express.Router();


router.post("/verify-email",verifyEmail);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp );
router.post("/register",validate(registerSchema), createUser);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
