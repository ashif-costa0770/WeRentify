import stripe from "../config/stripe.js";
import Booking from "../models/booking.model.js";
import Plan from "../models/plan.model.js";
import Service from "../models/service/service.model.js";
import User from "../models/users/user.model.js";
import { errorResponse, successResponse } from "../utils/response.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "accepted", "confirmed"];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

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

//! Create service booking checkout session (card)
export const createServiceBookingCheckoutSession = async (req, res) => {
  try {
    const { serviceId, bookingDate, timeSlot, address, notes } = req.body;

    if (!serviceId || !bookingDate || !timeSlot) {
      return errorResponse(res, 400, "serviceId, bookingDate and timeSlot are required");
    }

    const service = await Service.findById(serviceId)
      .select("_id owner businessName serviceType stripePriceId stripeProductId status hourlyRate serviceMode photos")
      .lean();
    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }
    if (!service.stripePriceId) {
      return errorResponse(res, 400, "Service is not configured for Stripe checkout");
    }
    if (String(service.owner) === String(req.user._id)) {
      return errorResponse(res, 400, "You cannot book your own service");
    }
    if (String(service.status || "").toLowerCase() !== "active") {
      return errorResponse(res, 400, "Service is not available for booking");
    }

    const normalizedTimeSlot = String(timeSlot).trim();
    const parsedBookingDate = new Date(String(bookingDate));
    if (!normalizedTimeSlot) {
      return errorResponse(res, 400, "timeSlot is required");
    }
    if (Number.isNaN(parsedBookingDate.getTime())) {
      return errorResponse(res, 400, "Invalid bookingDate");
    }

    if (String(service.serviceMode || "").toLowerCase() === "onsite" && !String(address || "").trim()) {
      return errorResponse(res, 400, "address is required for onsite services");
    }

    const startOfDay = new Date(parsedBookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedBookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Booking.findOne({
      resourceModel: "Service",
      resource: service._id,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot: normalizedTimeSlot,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    })
      .select("_id")
      .lean();

    if (existing) {
      return errorResponse(res, 409, "Selected time slot is already booked");
    }

    const customer = await User.findById(req.user._id)
      .select("_id email plan")
      .populate("plan", "platformFeePercent")
      .lean();
    if (!customer) {
      return errorResponse(res, 404, "User not found");
    }

    const unitPrice = Math.max(toNumber(service.hourlyRate), 0);
    const platformFeePercent = Math.max(toNumber(customer?.plan?.platformFeePercent), 0);
    const platformFee = Math.max((unitPrice * platformFeePercent) / 100, 0);
    const totalPrice = Math.max(unitPrice + platformFee, 0);

    const frontUrl = process.env.FRONTEND_URL;
    const serviceName = String(service.businessName || service.serviceType || "Service").trim();
    const imageUrl = String(service?.photos?.[0]?.url || "").trim();
    const productData = { name: serviceName };
    if (imageUrl) {
      productData.images = [imageUrl];
    }

    // Keep checkout clean: show only one line item with total price.
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.max(Math.round(totalPrice * 100), 0),
          product_data: productData,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${frontUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontUrl}/booking/cancel?serviceId=${service._id.toString()}`,
      customer_email: customer.email || undefined,
      metadata: {
        userId: String(customer._id),
        serviceId: String(service._id),
        serviceName,
        bookingDate: String(bookingDate),
        timeSlot: normalizedTimeSlot,
        address: String(address || "").trim().slice(0, 450),
        notes: String(notes || "").trim().slice(0, 450),
        stripePriceId: String(service.stripePriceId || ""),
        stripeProductId: String(service.stripeProductId || ""),
        unitPrice: String(unitPrice),
        platformFee: String(platformFee),
        totalPrice: String(totalPrice),
        currency: "USD",
        paymentMethod: "card",
      },
    });

    return successResponse(res, 200, "Service checkout session created", {
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error in createServiceBookingCheckoutSession:", error.message);
    return errorResponse(res, 500, "Failed to create service checkout session", error.message);
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

//! Verify service booking payment and create booking
export const verifyServiceBookingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return errorResponse(res, 400, "Payment not completed");
    }

    const metadata = session.metadata || {};
    const userId = String(metadata.userId || "");
    const serviceId = String(metadata.serviceId || "");
    const bookingDateRaw = String(metadata.bookingDate || "");
    const timeSlot = String(metadata.timeSlot || "").trim();
    const address = String(metadata.address || "").trim();
    const notes = String(metadata.notes || "").trim();

    if (!userId || !serviceId || !bookingDateRaw || !timeSlot) {
      return errorResponse(res, 400, "Session metadata is incomplete");
    }

    if (String(req.user._id) !== userId && req.user.role !== "admin") {
      return errorResponse(res, 403, "Not authorized to verify this payment session");
    }

    const alreadyExists = await Booking.findOne({ paymentId: session.id }).lean();
    if (alreadyExists) {
      return successResponse(res, 200, "Booking already verified", {
        booking: alreadyExists,
        alreadyExists: true,
      });
    }

    const service = await Service.findById(serviceId)
      .select("_id owner status hourlyRate serviceMode")
      .lean();
    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }
    if (String(service.status || "").toLowerCase() !== "active") {
      return errorResponse(res, 400, "Service is not available for booking");
    }
    if (String(service.owner) === userId) {
      return errorResponse(res, 400, "You cannot book your own service");
    }

    const bookingDate = new Date(bookingDateRaw);
    if (Number.isNaN(bookingDate.getTime())) {
      return errorResponse(res, 400, "Invalid bookingDate in payment session");
    }

    if (String(service.serviceMode || "").toLowerCase() === "onsite" && !address) {
      return errorResponse(res, 400, "Address is required for onsite services");
    }

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflict = await Booking.findOne({
      resourceModel: "Service",
      resource: service._id,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    })
      .select("_id")
      .lean();

    if (conflict) {
      return errorResponse(res, 409, "Selected time slot is already booked");
    }

    const unitPrice = Math.max(toNumber(metadata.unitPrice, service.hourlyRate), 0);
    const platformFee = Math.max(toNumber(metadata.platformFee), 0);
    const totalPrice = Math.max(toNumber(metadata.totalPrice, session.amount_total / 100), 0);
    const paymentCurrency = String(metadata.currency || session.currency || "usd").toUpperCase();

    const booking = await Booking.create({
      bookingType: "service",
      customer: userId,
      provider: service.owner,
      resource: service._id,
      resourceModel: "Service",
      bookingDate,
      timeSlot,
      quantity: 1,
      address: address || undefined,
      notes: notes || undefined,
      currency: paymentCurrency,
      unitPrice,
      platformFee,
      totalPrice,
      status: "confirmed",
      paymentMethod: "card",
      paymentStatus: "paid",
      paymentProvider: "stripe",
      paymentId: session.id,
      paidAt: new Date(),
    });

    return successResponse(res, 200, "Service booking verified successfully", {
      booking,
      alreadyExists: false,
    });
  } catch (error) {
    console.error("Error in verifyServiceBookingSession:", error.message);
    return errorResponse(res, 500, "Failed to verify service booking session", error.message);
  }
};
