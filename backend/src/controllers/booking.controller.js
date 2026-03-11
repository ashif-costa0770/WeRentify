import Booking from "../models/booking.model.js";
import Listing from "../models/listing/listing.model.js";
import Service from "../models/service/service.model.js";
import User from "../models/users/user.model.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { sendConfirmationEmail } from "../utils/mailer.js";
import { formatDate, formatDateTime } from "../utils/formatDateTime.js";

const ACTIVE_SLOT_STATUSES = ["pending", "accepted", "confirmed"];

const getIdString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const canAccessBooking = (user, booking) => {
  if (!user || !booking) return false;
  const userId = String(user._id);
  const isCustomer = getIdString(booking.customer) === userId;
  const isProvider = getIdString(booking.provider) === userId;
  const isAdmin = user.role === "admin";
  return isCustomer || isProvider || isAdmin;
};

const resolveResource = async (resourceModel, resourceId) => {
  if (resourceModel === "Listing") {
    const listing = await Listing.findById(resourceId)
      .select("_id owner dailyRate isAvailable status itemName")
      .populate("owner", "email firstname lastname")
      .lean();
    if (!listing) return null;

    return {
      model: "Listing",
      providerId: listing.owner?._id || listing.owner,
      provider: listing.owner,
      resourceName: listing.itemName,
      unitPrice: Number(listing.dailyRate) || 0,
      isBookable: listing.isAvailable !== false && String(listing.status || "active") === "active",
    };
  }

  if (resourceModel === "Service") {
    const service = await Service.findById(resourceId)
      .select("_id owner hourlyRate status businessName")
      .populate("owner", "email firstname lastname")
      .lean();
    if (!service) return null;

    return {
      model: "Service",
      providerId: service.owner?._id || service.owner,
      provider: service.owner,
      resourceName: service.businessName,
      unitPrice: Number(service.hourlyRate) || 0,
      isBookable: String(service.status || "active") === "active",
    };
  }

  return null;
};

//! Create booking
export const createBooking = async (req, res) => {
  try {
    const payload = req.body;

    const resourceInfo = await resolveResource(
      payload.resourceModel,
      payload.resource,
    );
    if (!resourceInfo) {
      return errorResponse(res, 404, `${payload.resourceModel} not found`);
    }
    if (!resourceInfo.isBookable) {
      return errorResponse(res, 400, "Selected resource is not available for booking");
    }

    if (String(resourceInfo.provider) === String(req.user._id)) {
      return errorResponse(res, 400, "You cannot create a booking for your own resource");
    }

    if (payload.resourceModel === "Service") {
      const bookingDate = new Date(payload.bookingDate);
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existing = await Booking.findOne({
        resourceModel: "Service",
        resource: payload.resource,
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        timeSlot: String(payload.timeSlot || "").trim(),
        status: { $in: ACTIVE_SLOT_STATUSES },
      })
        .select("_id")
        .lean();

      if (existing) {
        return errorResponse(res, 409, "Selected time slot is already booked");
      }
    }

    const unitPrice = payload.unitPrice ?? resourceInfo.unitPrice ?? 0;
    const quantity = payload.quantity ?? 1;
    const base = Number(unitPrice) * Number(quantity);
    const platformFee = Number(payload.platformFee ?? 0);
    const taxAmount = Number(payload.taxAmount ?? 0);
    const discountAmount = Number(payload.discountAmount ?? 0);
    const computedTotal = Math.max(base + platformFee + taxAmount - discountAmount, 0);

    const booking = await Booking.create({
      ...payload,
      customer: req.user._id,
      provider: resourceInfo.providerId,
      unitPrice,
      totalPrice: payload.totalPrice ?? computedTotal,
    });

    // Send emails in a best-effort way; failures shouldn't break booking creation
    try {
      // Ensure we have fresh provider info with email in case resolveResource had only an id
      const provider =
        resourceInfo.provider && resourceInfo.provider.email
          ? resourceInfo.provider
          : await User.findById(resourceInfo.providerId)
              .select("email firstname lastname")
              .lean();

      if (provider?.email) {
        await sendConfirmationEmail({
          to: provider.email,
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
                    Hello <strong>${provider.firstname || ""} ${provider.lastname || ""}</strong>,
                  </p>
        
                  <p>You received a new booking for 
                    <strong>${resourceInfo.resourceName || "your listing"}</strong>.
                  </p>
        
                  <h3 style="margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px;">
                    Booking Details
                  </h3>
        
                  <table width="100%" style="font-size:14px;color:#444;">
                    ${
                      booking.startDate || booking.bookingDate
                        ? `<tr>
                            <td style="padding:6px 0;"><strong>Date</strong></td>
                            <td>${formatDate(booking.startDate || booking.bookingDate)}</td>
                          </tr>`
                        : ""
                    }
        
                    ${
                      booking.timeSlot
                        ? `<tr>
                            <td style="padding:6px 0;"><strong>Time</strong></td>
                            <td>${booking.timeSlot}</td>
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
                    <strong>${resourceInfo.resourceName || "the selected resource"}</strong> 
                    has been successfully confirmed.
                  </p>
        
                  <h3 style="margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px;">
                    Booking Details
                  </h3>
        
                  <table width="100%" style="font-size:14px;color:#444;">
                    
                    ${
                      booking.startDate || booking.bookingDate
                        ? `<tr>
                            <td style="padding:6px 0;"><strong>Date</strong></td>
                            <td>${formatDate(booking.startDate || booking.bookingDate)}</td>
                          </tr>`
                        : ""
                    }
        
                    ${
                      booking.timeSlot
                        ? `<tr>
                            <td style="padding:6px 0;"><strong>Time</strong></td>
                            <td>${booking.timeSlot}</td>
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
    } catch (emailError) {
      console.error("Failed to send booking confirmation emails:", emailError);
    }

    return successResponse(res, 201, "Booking created successfully", booking);
  } catch (error) {
    return errorResponse(res, 500, "Failed to create booking", error.message);
  }
};

//! Get booked slots for a service by date
export const getBookedServiceSlotsByDate = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return errorResponse(res, 400, "date query is required");
    }

    const bookingDate = new Date(String(date));
    if (Number.isNaN(bookingDate.getTime())) {
      return errorResponse(res, 400, "Invalid date format");
    }

    const service = await Service.findById(serviceId).select("_id").lean();
    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      resourceModel: "Service",
      resource: serviceId,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ACTIVE_SLOT_STATUSES },
    })
      .select("timeSlot")
      .lean();

    const bookedSlots = [
      ...new Set(
        bookings
          .map((item) => String(item?.timeSlot || "").trim())
          .filter(Boolean),
      ),
    ];

    return successResponse(res, 200, "Booked service slots fetched successfully", {
      serviceId,
      date,
      bookedSlots,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch booked service slots", error.message);
  }
};

//! Get my bookings (as customer)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("provider", "firstname lastname")
      .populate({ path: "resource", select: "itemName businessName" })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, "My bookings fetched successfully", bookings);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch my bookings", error.message);
  }
};

//! Get bookings where user is provider
export const getBookingsForMyResources = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate("customer", "firstname lastname email avatar")
      .populate("provider", "firstname lastname email avatar")
      .populate("resource")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, "Resource bookings fetched successfully", bookings);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch resource bookings", error.message);
  }
};

//! Get booking details
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("customer", "firstname lastname email avatar")
      .populate("provider", "firstname lastname email avatar")
      .populate("resource")
      .lean();
    if (!booking) {
      return errorResponse(res, 404, "Booking not found");
    }

    if (!canAccessBooking(req.user, booking)) {
      return errorResponse(res, 403, "Not authorized to access this booking");
    }

    return successResponse(res, 200, "Booking fetched successfully", booking);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch booking", error.message);
  }
};

//! Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return errorResponse(res, 404, "Booking not found");
    }

    if (!canAccessBooking(req.user, booking)) {
      return errorResponse(res, 403, "Not authorized to update booking status");
    }

    booking.status = req.body.status;
    if (req.body.cancellationReason !== undefined) {
      booking.cancellationReason = req.body.cancellationReason;
    }
    if (req.body.cancelledBy !== undefined) {
      booking.cancelledBy = req.body.cancelledBy;
    }

    await booking.save();

    return successResponse(res, 200, "Booking status updated successfully", booking);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update booking status", error.message);
  }
};

//! Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return errorResponse(res, 404, "Booking not found");
    }

    const isCustomer = String(booking.customer) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isCustomer && !isAdmin) {
      return errorResponse(res, 403, "Not authorized to delete this booking");
    }

    await Booking.findByIdAndDelete(id);
    return successResponse(res, 200, "Booking deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete booking", error.message);
  }
};
