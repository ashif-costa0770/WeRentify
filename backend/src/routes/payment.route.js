import express from "express";
import { createCheckoutSession, createPaymentIntent, verifySession } from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);
router.post("/create-checkout-session", protect, createCheckoutSession);
router.get("/verify-session/:sessionId",protect,  verifySession);

// router.post(
//   "/stripe-webhook",
//   protect,
//   express.raw({ type: "application/json" }),
//   stripeWebhook
// );

export default router;