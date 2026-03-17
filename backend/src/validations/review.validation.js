import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId format",
  });

const targetModelEnum = z.enum(["Listing", "Service"], {
  errorMap: () => ({ message: "Target model must be Listing or Service" }),
});

export const createReviewSchema = z.object({
  bookingId: objectIdSchema,  
  rating: z
    .number({
      required_error: "Rating is required",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),

  comment: z
    .string()
    .max(1000, "Comment cannot exceed 1000 characters")
    .trim()
    .optional(),

  isVisible: z.boolean().optional().default(true),
});

export const updateReviewSchema = z.object({
  rating: z
    .number({
      invalid_type_error: "Rating must be a number",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5")
    .optional(),

  comment: z
    .string()
    .trim()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),

  isVisible: z.boolean().optional(),

  reply: z
    .string()
    .trim()
    .max(1000, "Reply cannot exceed 1000 characters")
    .optional(),
});
