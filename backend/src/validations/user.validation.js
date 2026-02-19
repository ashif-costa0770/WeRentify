import { z } from "zod";

const optionalName = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .refine((val) => val === undefined || val.length >= 2, {
    message: "Must be at least 2 characters",
  })
  .optional();

export const updateProfileSchema = z.object({
  firstname: optionalName,
  lastname: optionalName,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
    .optional(),
});

export const sendOtpForPasswordSchema = z.object({});

export const verifyPasswordOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "OTP must be 4 to 8 digits"),
});

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
