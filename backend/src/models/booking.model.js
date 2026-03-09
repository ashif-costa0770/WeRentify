import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Keep for API compatibility; source-of-truth is resourceModel.
    bookingType: {
      type: String,
      enum: ["listing", "service"],
      required: true,
    },

    // Who booked
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Owner of listing/service
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Reference to listing or service
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "resourceModel",
      required: true,
      index: true,
    },

    resourceModel: {
      type: String,
      enum: ["Listing", "Service"],
      required: true,
      index: true,
    },

    // Rental fields (listings)
    startDate: Date,
    endDate: Date,

    // Appointment fields (services)
    bookingDate: Date,
    timeSlot: {
      type: String,
      trim: true,
    },

    // Quantity for items/services
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },

    // Address (mainly for onsite services or delivery)
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Price snapshot
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "USD",
      minlength: 3,
      maxlength: 3,
    },
    unitPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    platformFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Booking lifecycle
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "card"],
      default: "cod",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "authorized", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    paymentProvider: {
      type: String,
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },
    refundId: {
      type: String,
      trim: true,
    },
    paidAt: Date,
    refundedAt: Date,

    cancelledBy: {
      type: String,
      enum: ["customer", "provider", "admin", "system"],
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, status: 1, createdAt: -1 });
bookingSchema.index({ serviceType: 1 });
bookingSchema.index({ resourceModel: 1, resource: 1, status: 1, createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);