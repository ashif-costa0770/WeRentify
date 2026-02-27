import { z } from "zod";

/**
 * Create Plan Validation Schema
 */
export const createPlanSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),

  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .min(0, "Price must be 0 or greater"),

  currency: z.enum(["inr", "usd"]).default("usd"),

  platformFeePercent: z
    .number({
      required_error: "Platform fee percent is required",
      invalid_type_error: "Platform fee must be a number",
    })
    .min(0, "Platform fee must be 0 or greater"),

  features: z.array(z.string().trim()).min(1, "Features are required"),

  popular: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updatePlanSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  price: z.number().min(0, "Price must be 0 or greater").optional(),
  currency: z.enum(["inr", "usd"]).default("usd").optional(),
  platformFeePercent: z
    .number()
    .min(0, "Platform fee must be 0 or greater")
    .optional(),
  features: z
    .array(z.string().trim())
    .min(1, "Features are required")
    .optional(),
  popular: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
});
