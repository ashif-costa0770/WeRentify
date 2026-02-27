import Plan from "../models/plan.model.js";
import { errorResponse, successResponse } from "../utils/response.js";
import stripe from "../config/stripe.js";

/**
 * @desc    Create new plan
 * @route   POST /api/plans
 * @access  Admin
 */
export const createPlan = async (req, res) => {
  try {
    const {
      name,
      price,
      currency,
      platformFeePercent,
      features,
      popular,
      isActive,
    } = req.body;

    const priceInSmallestUnit = Math.round(price * 100); // convert to smallest unit

    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return errorResponse(res, 400, "Plan already exists");
    }

    // 1️⃣ Create Product in Stripe
    const product = await stripe.products.create({
      name,
    });

    // 2️⃣ Create Price in Stripe (amount in smallest unit)
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: priceInSmallestUnit,
      currency,
      recurring: { interval: "month" },
    });

    // 3️⃣ Save Plan in DB
    const plan = await Plan.create({
      name,
      price,
      currency,
      stripePriceId: stripePrice.id,
      stripeProductId: product.id,
      platformFeePercent,
      features,
      popular,
      isActive,
    });

    return successResponse(res, 201, "Plan created successfully", plan);
  } catch (error) {
    console.error("Error in createPlan:", error.message);
    return errorResponse(res, 500, "Failed to create plan", error.message);
  }
};

//! Get all plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

    return successResponse(res, 200, "Plans fetched successfully", plans);
  } catch (error) {
    console.error("Error in getAllPlans:", error.message);
    return errorResponse(res, 500, "Failed to fetch plans", error.message);
  }
};

//! Update plan
export const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const {
      name,
      price,
      currency,
      platformFeePercent,
      features,
      popular,
      isActive,
    } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return errorResponse(res, 404, "Plan not found");
    }

    // If price is changing → create new Stripe price
    if (price !== undefined && price !== plan.price) {
      const priceInSmallestUnit = Math.round(price * 100);

      const stripePrice = await stripe.prices.create({
        product: plan.stripeProductId,
        unit_amount: priceInSmallestUnit,
        currency: currency || plan.currency,
        recurring: { interval: "month" },
      });

      plan.stripePriceId = stripePrice.id;
      plan.price = price;
    }

    if (name !== undefined) plan.name = name;
    if (currency !== undefined) plan.currency = currency;
    if (platformFeePercent !== undefined)
      plan.platformFeePercent = platformFeePercent;
    if (features !== undefined) plan.features = features;
    if (popular !== undefined) plan.popular = popular;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();

    return successResponse(res, 200, "Plan updated successfully", plan);
  } catch (error) {
    console.error("Error in updatePlan:", error.message);
    return errorResponse(res, 500, "Failed to update plan", error.message);
  }
};

//! Deactivate plan (Don't delete the plan, just deactivate it. Because some users might have already subscribed to it)
export const deactivatePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return errorResponse(res, 404, "Plan not found");
    }

    plan.isActive = false;
    await plan.save();

    return successResponse(res, 200, "Plan deactivated successfully", plan);
  } catch (error) {
    console.error("Error in deactivatePlan:", error.message);
    return errorResponse(res, 500, "Failed to deactivate plan", error.message);
  }
};
