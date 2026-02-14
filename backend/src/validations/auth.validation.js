import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email("Invalid email format").trim().toLowerCase(),
    password: z.string().min(4, "Password must be at least 4 characters"),

    confirmPassword: z.string().min(4, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Invalid email format").trim().toLowerCase(),

  password: z.string().min(1, "Password is required"),
});
