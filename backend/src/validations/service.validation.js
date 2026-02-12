import { z } from "zod";
import mongoose from "mongoose";

// Helper: ObjectId validation
const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid ObjectId format" }
);

export const createServiceSchema = z.object({
  // Step 1: Business Details
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters"),

  serviceType: z
    .string()
    .trim()
    .min(2, "Service type is required"),

  category: objectIdSchema,

  yearsInBusiness: z
    .coerce.number({ invalid_type_error: "Year in business must be a number" })
    .min(0, "Year in business cannot be negative"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),

  // Step 2: Contact Details
  location: z
    .string()
    .trim()
    .min(2, "Service location is required"),

  serviceRadius: z
    .coerce.number({ invalid_type_error: "Service area must be a number" })
    .min(0, "Service area cannot be negative"),

  phone: z
    .string()
    .trim()
    .min(8, "Phone number is required"),

    email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address"),

  website: z
    .url("Invalid website URL")
    .trim()
    .optional()
    .or(z.literal("")),

  certifications: z
    .string()
    .trim()
    .optional(),

  // Step 3: Pricing
  hourlyRate: z
    .string()
    .trim()
    .min(1, "Hourly rate is required"),

  // Step 4: Plan
  plan: z
    .enum(["basic", "plus", "pro"])
    .default("basic"),
});


// More concise - creates optional version of all fields
export const updateServiceSchema = createServiceSchema.partial();