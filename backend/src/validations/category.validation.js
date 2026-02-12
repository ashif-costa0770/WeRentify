// validations/category.validation.js
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters"),

  type: z.enum(["item", "service"], {
    errorMap: () => ({ message: "Type must be either 'item' or 'service'" }),
  }),

  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }),

  // 👇 icon handled by multer (file), not required in body
  icon: z.any().optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters")
    .optional(),

  type: z.enum(["item", "service"]).optional(),

  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }),

  // 👇 icon optional (multer file)
  icon: z.any().optional(),
});