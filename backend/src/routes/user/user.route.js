import express from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.js";
import {
  updateProfileSchema,
  sendOtpForPasswordSchema,
  verifyPasswordOtpSchema,
  changePasswordSchema,
  updatePlanSchema,
  updateModeSchema,
} from "../../validations/user.validation.js";
import {
  changePassword,
  updateProfile,
  updateMyPlan,
  switchToHost,
  updateMyMode,
  sendPasswordChangeOtp,
  verifyPasswordChangeOtp,
  resendPasswordChangeOtp,
  deleteUserAccount,
} from "../../controllers/user/user.controller.js";
import {
  handleMulterError,
  uploadAvatar,
} from "../../middlewares/upload.middleware.js";


const router = express.Router();


router.put("/profile", protect, uploadAvatar, handleMulterError,  validate(updateProfileSchema), updateProfile);
router.patch("/plan", protect, validate(updatePlanSchema), updateMyPlan);

router.post("/switch-to-host", protect, switchToHost);
router.patch("/mode", protect, validate(updateModeSchema), updateMyMode);

//! Change Passwrod
router.post("/send-otp",protect, validate(sendOtpForPasswordSchema), sendPasswordChangeOtp);
router.post("/resend-otp", protect, validate(sendOtpForPasswordSchema), resendPasswordChangeOtp);
router.post("/verify-otp", protect, validate(verifyPasswordOtpSchema), verifyPasswordChangeOtp);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

//!delete user account
router.delete("/delete-account", protect, deleteUserAccount);



export default router;
