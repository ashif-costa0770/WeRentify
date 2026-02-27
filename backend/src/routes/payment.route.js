import express from "express";
import { createPlanCheckoutSession, verifySession } from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-checkout-session", protect, createPlanCheckoutSession);
router.get("/verify-session/:sessionId",protect,  verifySession);

export default router;