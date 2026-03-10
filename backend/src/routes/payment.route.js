import express from "express";
import {
  createPlanCheckoutSession,
  createServiceBookingCheckoutSession,
  createListingBookingCheckoutSession,
  verifyServiceBookingSession,
  verifyListingBookingSession,
  verifySession,
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-checkout-session", protect, createPlanCheckoutSession);
router.post("/service-booking/create-checkout-session", protect, createServiceBookingCheckoutSession);
router.post("/listing-booking/create-checkout-session", protect, createListingBookingCheckoutSession);
router.get("/verify-session/:sessionId", protect, verifySession);
router.get("/service-booking/verify-session/:sessionId", protect, verifyServiceBookingSession);
router.get("/listing-booking/verify-session/:sessionId", protect, verifyListingBookingSession);

export default router;