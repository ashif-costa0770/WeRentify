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
    .email("Invalid email format")
    .trim()
    .toLowerCase()
    .optional(),

  role: adminRoleEnum.optional(),

  isActive: z.boolean().optional(),
});

// Update admin credentials schema
export const updateAdminCredentialsSchema = z
  .object({
    email: z
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .optional(),

    currentPassword: z.string().trim().min(1, "Current password is required"),

    newPassword: z.string().trim().min(6, "Password must be at least 6 characters").optional(),

    confirmPassword: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      // If newPassword is provided → confirmPassword must exist
      if (data.newPassword) {
        return !!data.confirmPassword;
      }
      return true;
    },
    {
      message: "Confirm password is required",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => {
      // If both exist → must match
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => {
      // Prevent same password
      if (data.newPassword) {
        return data.newPassword !== data.currentPassword;
      }
      return true;
    },
    {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => data.email || data.newPassword,
    {
      message: "Provide at least email or new password to update",
    }
  );


export const updateSettingsSchema = z.object({
  contact: z
    .object({
      phone: z.string().trim().min(5, "Phone too short").optional(),
      email: z.email("Invalid email").trim().toLowerCase().optional(),
      address: z.string().trim().optional(),
    })
    .optional(),

  social: z
    .object({
      facebook: z.string().trim().url("Invalid Facebook URL").optional(),
      instagram: z.string().trim().url("Invalid Instagram URL").optional(),
      twitter: z.string().trim().url("Invalid Twitter URL").optional(),
      linkedin: z.string().trim().url("Invalid LinkedIn URL").optional(),
    })
    .optional(),
});