import stripe from "../config/stripe.js";
import Plan from "../models/plan.model.js";
import User from "../models/users/user.model.js";
import { errorResponse, successResponse } from "../utils/response.js";

//! Create plan checkout session
export const createPlanCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return errorResponse(res, 400, "Invalid plan");
    }
    if (!plan.stripePriceId) {
      return errorResponse(res, 400, "Plan is not configured for Stripe checkout");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId: req.user._id.toString(),
        planId: plan._id.toString(),
        planName: plan.name,
      },
    });

    return successResponse(res, 200, "Plans checkout session created", { url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Error in createPlanCheckoutSession:", error.message);
    return errorResponse(res, 500, "Failed to create plans checkout session", error.message);
  }
};

//! Verify session
export const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return errorResponse(res, 400, "Payment not completed");
    }

    const { userId, planId } = session.metadata;

    await User.findByIdAndUpdate(userId, {
      plan: planId,
    });

    return successResponse(res, 200, "Session verified successfully", { plan: planId });
  } catch (error) {
    console.error("Stripe Verification Error:", error);

    return errorResponse(res, 500, "Session verification failed", error.message);
  }
};
