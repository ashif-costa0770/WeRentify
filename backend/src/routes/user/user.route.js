import express from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.js";
import {
  updateProfileSchema,
  sendOtpForPasswordSchema,
  verifyPasswordOtpSchema,
  changePasswordSchema,
} from "../../validations/user.validation.js";
import {
  changePassword,
  updateProfile,
  sendPasswordChangeOtp,
  verifyPasswordChangeOtp,
} from "../../controllers/user/user.controller.js";
import {
  handleMulterError,
  uploadAvatar,
} from "../../middlewares/upload.middleware.js";

const router = express.Router();


router.put("/profile", protect, uploadAvatar, handleMulterError,  validate(updateProfileSchema), updateProfile);

//! Change Passwrod
router.post("/send-otp", protect, validate(sendOtpForPasswordSchema), sendPasswordChangeOtp);
router.post("/resend-otp", protect, validate(sendOtpForPasswordSchema), sendPasswordChangeOtp);
router.post("/verify-otp", protect, validate(verifyPasswordOtpSchema), verifyPasswordChangeOtp);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
