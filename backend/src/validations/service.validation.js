import { z } from "zod";
import mongoose from "mongoose";

// Helper: ObjectId validation
const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid ObjectId format" }
);

const weekDayEnum = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const workingDaysSchema = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}, z.array(weekDayEnum).min(1, "Select at least one working day"));

const updateWorkingDaysSchema = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}, z.array(weekDayEnum).optional());

const serviceSchemaBase = z.object({
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

  // Step 4: Availability
  serviceMode: z.enum(["onsite", "shop"]),
  workingDays: workingDaysSchema,
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:mm format"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:mm format"),

  // Step 5: Plan
  plan: z
    .enum(["basic", "plus", "pro"])
    .default("basic"),
});

export const createServiceSchema = serviceSchemaBase.refine((data) => data.startTime < data.endTime, {
  message: "End time must be later than start time",
  path: ["endTime"],
});


export const updateServiceSchema = serviceSchemaBase
  .omit({ workingDays: true })
  .extend({
    workingDays: updateWorkingDaysSchema,
  })
  .partial()
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be later than start time",
      });
    }
  });