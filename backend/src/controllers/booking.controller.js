import Booking from "../models/booking.model.js";
import Listing from "../models/listing/listing.model.js";
import Service from "../models/service/service.model.js";
import { errorResponse, successResponse } from "../utils/response.js";

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
      .select("_id owner dailyRate isAvailable status")
      .lean();
    if (!listing) return null;

    return {
      model: "Listing",
      provider: listing.owner,
      unitPrice: Number(listing.dailyRate) || 0,
      isBookable: listing.isAvailable !== false && String(listing.status || "active") === "active",
    };
  }

  if (resourceModel === "Service") {
    const service = await Service.findById(resourceId)
      .select("_id owner hourlyRate status")
      .lean();
    if (!service) return null;

    return {
      model: "Service",
      provider: service.owner,
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

    const resourceInfo = await resolveResource(payload.resourceModel, payload.resource);
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
      provider: resourceInfo.provider,
      unitPrice,
      totalPrice: payload.totalPrice ?? computedTotal,
    });

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
