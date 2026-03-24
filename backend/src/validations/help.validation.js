import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(140, "Slug cannot exceed 140 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphenated");

const optionalBooleanFromString = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  });

const optionalNumberFromString = z
  .union([z.number(), z.string()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const parsed = Number(val);
    return Number.isNaN(parsed) ? val : parsed;
  });

export const createHelpCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(120, "Category name cannot exceed 120 characters"),
  slug: slugSchema,
  description: z.string().trim().max(400, "Description too long").optional(),
  icon: z.string().trim().max(80, "Icon value too long").optional(),
  order: optionalNumberFromString.refine(
    (val) => val === undefined || (Number.isInteger(val) && val >= 0),
    "Order must be a non-negative integer",
  ),
  isActive: optionalBooleanFromString,
});

export const updateHelpCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(120, "Category name cannot exceed 120 characters")
    .optional(),
  slug: slugSchema.optional(),
  description: z.string().trim().max(400, "Description too long").optional(),
  icon: z.string().trim().max(80, "Icon value too long").optional(),
  order: optionalNumberFromString.refine(
    (val) => val === undefined || (Number.isInteger(val) && val >= 0),
    "Order must be a non-negative integer",
  ),
  isActive: optionalBooleanFromString,
});

export const createFaqItemSchema = z.object({
  category: objectIdSchema,
  question: z
    .string()
    .trim()
    .min(5, "Question must be at least 5 characters")
    .max(300, "Question cannot exceed 300 characters"),
  answer: z
    .string()
    .trim()
    .min(5, "Answer must be at least 5 characters")
    .max(5000, "Answer cannot exceed 5000 characters"),
  order: optionalNumberFromString.refine(
    (val) => val === undefined || (Number.isInteger(val) && val >= 0),
    "Order must be a non-negative integer",
  ),
  isActive: optionalBooleanFromString,
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
});

export const updateFaqItemSchema = z.object({
  category: objectIdSchema.optional(),
  question: z
    .string()
    .trim()
    .min(5, "Question must be at least 5 characters")
    .max(300, "Question cannot exceed 300 characters")
    .optional(),
  answer: z
    .string()
    .trim()
    .min(5, "Answer must be at least 5 characters")
    .max(5000, "Answer cannot exceed 5000 characters")
    .optional(),
  order: optionalNumberFromString.refine(
    (val) => val === undefined || (Number.isInteger(val) && val >= 0),
    "Order must be a non-negative integer",
  ),
  isActive: optionalBooleanFromString,
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
});
