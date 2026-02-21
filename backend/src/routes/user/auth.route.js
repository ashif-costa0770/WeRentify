import express from "express";
import passport from "passport";
import { generateToken } from "../../utils/token.js";
import {
  verifyEmail,
  verifyOtp,
  createUser,
  resendOtp ,
  getMe,
  logout,
  login,
  facebookAuth,
} from "../../controllers/user/auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.js";
import { loginSchema, registerSchema } from "../../validations/auth.validation.js";

const router = express.Router();
const frontendUrl = process.env.FRONTEND_URL || "https://localhost:3000";


router.post("/verify-email",verifyEmail);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp );
router.post("/register",validate(registerSchema), createUser);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

//google auth
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/google/callback",  passport.authenticate("google", {
    failureRedirect: `${frontendUrl}?auth=signin`,
    session: false,
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.cookie("token", token, { httpOnly: true });
    res.redirect(frontendUrl);
  }
);

//! Facebook auth
router.post("/facebook", facebookAuth);

export default router;
