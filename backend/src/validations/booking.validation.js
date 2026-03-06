import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine(
  (value) => mongoose.Types.ObjectId.isValid(value),
  { message: "Invalid ObjectId format" },
);

const bookingTypeEnum = z.enum(["listing", "service"]);
const resourceModelEnum = z.enum(["Listing", "Service"]);
const statusEnum = z.enum([
  "pending",
  "accepted",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
]);
const paymentStatusEnum = z.enum([
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);
const paymentMethodEnum = z.enum(["cod", "card"]);

export const createBookingSchema = z
  .object({
    bookingType: bookingTypeEnum,
    resource: objectIdSchema,
    resourceModel: resourceModelEnum,

    // Listing scheduling
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),

    // Service scheduling
    bookingDate: z.coerce.date().optional(),
    timeSlot: z.string().trim().optional(),

    quantity: z.coerce.number().int().min(1).default(1),
    address: z.string().trim().max(500).optional(),

    currency: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(z.string().length(3))
      .default("USD"),
    unitPrice: z.coerce.number().min(0).optional(),
    platformFee: z.coerce.number().min(0).optional(),
    taxAmount: z.coerce.number().min(0).optional(),
    discountAmount: z.coerce.number().min(0).optional(),
    totalPrice: z.coerce.number().min(0).optional(),
    paymentMethod: paymentMethodEnum.default("cod"),
    paymentProvider: z.string().trim().optional(),

    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    const expectedBookingType =
      data.resourceModel === "Listing" ? "listing" : "service";

    if (data.bookingType !== expectedBookingType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bookingType"],
        message: "bookingType must match resourceModel",
      });
    }

    if (data.resourceModel === "Listing") {
      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "startDate is required for listing bookings",
        });
      }
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "endDate is required for listing bookings",
        });
      }
      if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "endDate must be greater than startDate",
        });
      }
    }

    if (data.resourceModel === "Service") {
      if (!data.bookingDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bookingDate"],
          message: "bookingDate is required for service bookings",
        });
      }
      if (!data.timeSlot || data.timeSlot.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["timeSlot"],
          message: "timeSlot is required for service bookings",
        });
      }
    }

    if (data.paymentMethod === "card" && !data.paymentProvider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentProvider"],
        message: "paymentProvider is required for card payments",
      });
    }
  });

export const bookingIdParamSchema = z.object({
  id: objectIdSchema,
});

export const updateBookingStatusSchema = z.object({
  status: statusEnum,
  cancellationReason: z.string().trim().max(1000).optional(),
  cancelledBy: z.enum(["customer", "provider", "admin", "system"]).optional(),
});

export const updateBookingPaymentSchema = z
  .object({
    paymentMethod: paymentMethodEnum.optional(),
    paymentStatus: paymentStatusEnum,
    paymentProvider: z.string().trim().optional(),
    paymentId: z.string().trim().optional(),
    refundId: z.string().trim().optional(),
    paidAt: z.coerce.date().optional(),
    refundedAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "card" && !data.paymentProvider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentProvider"],
        message: "paymentProvider is required for card payments",
      });
    }
  });
