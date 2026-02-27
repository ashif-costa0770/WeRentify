import { z } from "zod";

/* --------------------------
   Role Enum
--------------------------- */
export const adminRoleEnum = z.enum(["super_admin", "admin"]);

/* --------------------------
   Create Admin Schema
   (Used for seed or super_admin creating new admin)
--------------------------- */
export const createAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .optional(),

  email: z
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),

  role: adminRoleEnum.optional(),
});

/* --------------------------
   Admin Login Schema
--------------------------- */
export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format"),

  password: z
    .string()
    .min(1, "Password is required"),
});

/* --------------------------
   Update Admin Schema
--------------------------- */
export const updateAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .optional(),

  role: adminRoleEnum.optional(),

  isActive: z.boolean().optional(),
});