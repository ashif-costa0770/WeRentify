import express from "express";
import validate from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createBooking,
  deleteBooking,
  getBookingById,
  getBookedServiceSlotsByDate,
  getBookingsForMyResources,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/booking.controller.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "../validations/booking.validation.js";

const router = express.Router();

router.post("/", protect, validate(createBookingSchema), createBooking);
router.get("/my", protect, getMyBookings);
router.get("/resource", protect, getBookingsForMyResources);
router.get("/service/:serviceId/slots", protect, getBookedServiceSlotsByDate);
router.get("/:id", protect, getBookingById);
router.patch("/:id/status", protect, validate(updateBookingStatusSchema), updateBookingStatus);
router.delete("/:id", protect, deleteBooking);

export default router;
