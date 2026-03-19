import stripe from "../config/stripe.js";
import Booking from "../models/booking.model.js";
import Plan from "../models/plan.model.js";
import Service from "../models/service/service.model.js";
import Listing from "../models/listing/listing.model.js";
import User from "../models/users/user.model.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { sendConfirmationEmail } from "../utils/mailer.js";
import { formatDate } from "../utils/formatDateTime.js";

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

//! Create listing booking checkout session (card)
export const createListingBookingCheckoutSession = async (req, res) => {
  try {
    const { listingId, startDate, endDate, address, notes } = req.body;

    if (!listingId || !startDate || !endDate) {
      return errorResponse(res, 400, "listingId, startDate and endDate are required");
    }

    const listing = await Listing.findById(listingId)
      .select("_id owner itemName dailyRate hourlyRate weeklyRate stripePriceId stripeProductId status isAvailable photos")
      .lean();
    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }
    if (!listing.stripePriceId) {
      return errorResponse(res, 400, "Listing is not configured for Stripe checkout");
    }
    if (String(listing.owner) === String(req.user._id)) {
      return errorResponse(res, 400, "You cannot book your own listing");
    }
    if (String(listing.status || "active").toLowerCase() !== "active" || listing.isAvailable === false) {
      return errorResponse(res, 400, "Listing is not available for booking");
    }

    const start = new Date(String(startDate));
    const end = new Date(String(endDate));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return errorResponse(res, 400, "Invalid startDate or endDate");
    }
    if (end <= start) {
      return errorResponse(res, 400, "endDate must be greater than startDate");
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const rawDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
    const rentalDays = Math.max(rawDays, 1);

    const dailyRate = Math.max(toNumber(listing.dailyRate), 0);
    const hourlyRate = Math.max(toNumber(listing.hourlyRate), 0);
    const weeklyRate = Math.max(toNumber(listing.weeklyRate), 0);

    const fallbackDayRate = dailyRate || (hourlyRate > 0 ? hourlyRate * 24 : 0);
    let baseAmount = 0;
    if (weeklyRate > 0 && rentalDays >= 7) {
      const weeks = Math.floor(rentalDays / 7);
      const extraDays = rentalDays - weeks * 7;
      baseAmount = weeks * weeklyRate + extraDays * fallbackDayRate;
    } else {
      baseAmount = rentalDays * fallbackDayRate;
    }

    const customer = await User.findById(req.user._id)
      .select("_id email plan")
      .populate("plan", "platformFeePercent")
      .lean();
    if (!customer) {
      return errorResponse(res, 404, "User not found");
    }

    const platformFeePercent = Math.max(toNumber(customer?.plan?.platformFeePercent), 0);
    const platformFee = Math.max((baseAmount * platformFeePercent) / 100, 0);
    const totalPrice = Math.max(baseAmount + platformFee, 0);

    const frontUrl = process.env.FRONTEND_URL;
    const listingName = String(listing.itemName || "Listing").trim();
    const imageUrl = String(listing?.photos?.[0]?.url || "").trim();
    const productData = { name: listingName };
    if (imageUrl) {
      productData.images = [imageUrl];
    }

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
      success_url: `${frontUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&type=listing`,
      cancel_url: `${frontUrl}/booking/cancel?listingId=${listing._id.toString()}`,
      customer_email: customer.email || undefined,
      metadata: {
        userId: String(customer._id),
        listingId: String(listing._id),
        listingName,
        startDate: String(startDate),
        endDate: String(endDate),
        rentalDays: String(rentalDays),
        address: String(address || "").trim().slice(0, 450),
        notes: String(notes || "").trim().slice(0, 450),
        stripePriceId: String(listing.stripePriceId || ""),
        stripeProductId: String(listing.stripeProductId || ""),
        baseAmount: String(baseAmount),
        platformFee: String(platformFee),
        totalPrice: String(totalPrice),
        currency: "USD",
        paymentMethod: "card",
      },
    });

    return successResponse(res, 200, "Listing checkout session created", {
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error in createListingBookingCheckoutSession:", error.message);
    return errorResponse(res, 500, "Failed to create listing checkout session", error.message);
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

    const metadata = session.metadata || {};
    const userId = String(metadata.userId || "");
    const planId = String(metadata.planId || "");

    if (!userId || !planId) {
      return errorResponse(res, 400, "Session metadata is incomplete");
    }

    if (String(req.user._id) !== userId && req.user.role !== "admin") {
      return errorResponse(res, 403, "Not authorized to verify this payment session");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { plan: planId, mode: "host" },
      { new: true, runValidators: true },
    ).populate("plan");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "Session verified successfully", {
      plan: planId,
      mode: user.mode,
    });
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

//! Verify listing booking payment and create booking
export const verifyListingBookingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return errorResponse(res, 400, "Payment not completed");
    }

    const metadata = session.metadata || {};
    const userId = String(metadata.userId || "");
    const listingId = String(metadata.listingId || "");
    const startDateRaw = String(metadata.startDate || "");
    const endDateRaw = String(metadata.endDate || "");
    const address = String(metadata.address || "").trim();
    const notes = String(metadata.notes || "").trim();

    if (!userId || !listingId || !startDateRaw || !endDateRaw) {
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

    const listing = await Listing.findById(listingId)
      .select("_id owner status isAvailable dailyRate hourlyRate weeklyRate itemName")
      .populate("owner", "email firstname lastname")
      .lean();
    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }
    if (String(listing.status || "active").toLowerCase() !== "active" || listing.isAvailable === false) {
      return errorResponse(res, 400, "Listing is not available for booking");
    }
    if (String(listing.owner) === userId) {
      return errorResponse(res, 400, "You cannot book your own listing");
    }

    const startDate = new Date(startDateRaw);
    const endDate = new Date(endDateRaw);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return errorResponse(res, 400, "Invalid date range in payment session");
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const rawDays = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
    const rentalDays = Math.max(rawDays, 1);

    const dailyRate = Math.max(toNumber(metadata.dailyRate, listing.dailyRate), 0);
    const hourlyRate = Math.max(toNumber(metadata.hourlyRate, listing.hourlyRate), 0);
    const weeklyRate = Math.max(toNumber(metadata.weeklyRate, listing.weeklyRate), 0);
    const fallbackDayRate = dailyRate || (hourlyRate > 0 ? hourlyRate * 24 : 0);

    let baseAmount = Math.max(toNumber(metadata.baseAmount), 0);
    if (!baseAmount) {
      if (weeklyRate > 0 && rentalDays >= 7) {
        const weeks = Math.floor(rentalDays / 7);
        const extraDays = rentalDays - weeks * 7;
        baseAmount = weeks * weeklyRate + extraDays * fallbackDayRate;
      } else {
        baseAmount = rentalDays * fallbackDayRate;
      }
    }

    const platformFee = Math.max(toNumber(metadata.platformFee), 0);
    const totalPrice = Math.max(toNumber(metadata.totalPrice, session.amount_total / 100), 0);
    const paymentCurrency = String(metadata.currency || session.currency || "usd").toUpperCase();

    const booking = await Booking.create({
      bookingType: "listing",
      customer: userId,
      provider: listing.owner,
      resource: listing._id,
      resourceModel: "Listing",
      startDate,
      endDate,
      quantity: 1,
      address: address || undefined,
      notes: notes || undefined,
      currency: paymentCurrency,
      unitPrice: baseAmount, // per-rental total before fees
      platformFee,
      totalPrice,
      status: "confirmed",
      paymentMethod: "card",
      paymentStatus: "paid",
      paymentProvider: "stripe",
      paymentId: session.id,
      paidAt: new Date(),
    });


    // Send confirmation email to provider
    if (listing.owner?.email) {
      await sendConfirmationEmail({
        to: listing.owner.email,
        subject: "New Booking Confirmation",
        html: `
        <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;">
            
            <tr>
              <td style="background:#0d6efd;color:#ffffff;padding:16px 24px;font-size:20px;font-weight:bold;">
                New Booking Received
              </td>
            </tr>
      
            <tr>
              <td style="padding:24px;color:#333;">
                <p style="margin-top:0;">
                  Hello <strong>${listing.owner.firstname || ""} ${listing.owner.lastname || ""}</strong>,
                </p>
      
                <p>You received a new booking for 
                  <strong>${listing.itemName || "your listing"}</strong>.
                </p>
      
                <h3 style="margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px;">
                  Booking Details
                </h3>
      
                <table width="100%" style="font-size:14px;color:#444;">
                  ${
                    booking.startDate
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Date</strong></td>
                          <td>${formatDate(booking.startDate)}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.endDate
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>End Date</strong></td>
                          <td>${formatDate(booking.endDate)}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.totalPrice
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Total Price</strong></td>
                          <td>$${booking.totalPrice}</td>
                        </tr>`
                      : ""
                  }
                </table>
      
                <h3 style="margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px;">
                  Payment Details
                </h3>
      
                <table width="100%" style="font-size:14px;color:#444;">
                  ${
                    booking.paymentMethod
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Payment Method</strong></td>
                          <td>${booking.paymentMethod}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.paymentStatus
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Status</strong></td>
                          <td>${booking.paymentStatus}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.paymentProvider
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Provider</strong></td>
                          <td>${booking.paymentProvider}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.paymentId
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Payment ID</strong></td>
                          <td>${booking.paymentId}</td>
                        </tr>`
                      : ""
                  }
                </table>
      
                <p style="margin-top:24px;">
                  Please log in to your dashboard to manage this booking.
                </p>
      
              </td>
            </tr>
      
            <tr>
              <td style="background:#f1f1f1;padding:12px;text-align:center;font-size:12px;color:#777;">
                © ${new Date().getFullYear()} WeRentify. All rights reserved.
              </td>
            </tr>
      
          </table>
        </div>
        `,
      });
    }

    // Send confirmation email to customer
    if (req.user?.email) {
      await sendConfirmationEmail({
        to: req.user.email,
        subject: "Booking Confirmation",
        html: `
        <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;">
            
            <tr>
              <td style="background:#198754;color:#ffffff;padding:16px 24px;font-size:20px;font-weight:bold;">
                Booking Confirmed
              </td>
            </tr>
      
            <tr>
              <td style="padding:24px;color:#333;">
                
                <p style="margin-top:0;">
                  Hello <strong>${req.user.firstname || ""} ${req.user.lastname || ""}</strong>,
                </p>
      
                <p>
                  Your booking for 
                  <strong>${listing.itemName ? listing.itemName : "the selected listing"}</strong> 
                  has been successfully confirmed.
                </p>
      
                <h3 style="margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px;">
                  Booking Details
                </h3>
      
                <table width="100%" style="font-size:14px;color:#444;">
                  
                  ${
                    booking.startDate
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Date</strong></td>
                          <td>${formatDate(booking.startDate)}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.endDate
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>End Date</strong></td>
                          <td>${formatDate(booking.endDate)}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.totalPrice
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Total Price</strong></td>
                          <td>$${booking.totalPrice}</td>
                        </tr>`
                      : ""
                  }
      
                </table>
      
                <h3 style="margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px;">
                  Payment Details
                </h3>
      
                <table width="100%" style="font-size:14px;color:#444;">
      
                  ${
                    booking.paymentMethod
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Payment Method</strong></td>
                          <td>${booking.paymentMethod}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.paymentStatus
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Status</strong></td>
                          <td>${booking.paymentStatus}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.paymentProvider
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Provider</strong></td>
                          <td>${booking.paymentProvider}</td>
                        </tr>`
                      : ""
                  }
      
                  ${
                    booking.paymentId
                      ? `<tr>
                          <td style="padding:6px 0;"><strong>Payment ID</strong></td>
                          <td>${booking.paymentId}</td>
                        </tr>`
                      : ""
                  }
      
                </table>
      
                <p style="margin-top:24px;">
                  Thank you for booking with us. We look forward to serving you!
                </p>
      
              </td>
            </tr>
      
            <tr>
              <td style="background:#f1f1f1;padding:12px;text-align:center;font-size:12px;color:#777;">
                © ${new Date().getFullYear()} WeRentify. All rights reserved.
              </td>
            </tr>
      
          </table>
        </div>
        `,
      });
    }


    return successResponse(res, 200, "Booking verified successfully", {
      booking,
      alreadyExists: false,
    });
  } catch (error) {
    console.error("Error in verifyListingBookingSession:", error.message);
    return errorResponse(res, 500, "Failed to verify listing booking session", error.message);
  }
};
