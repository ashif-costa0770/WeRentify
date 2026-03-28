import { z } from 'zod';

const contactSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100),

  email: z
    .email('Invalid email address')
    .trim()
    .toLowerCase(),

  message: z
    .string()
    .min(5, 'Message must be at least 5 characters')
    .max(1000),
});

const adminReplySchema = z.object({
    reply: z
      .string()
      .min(3, 'Reply must be at least 3 characters')
      .max(2000),
  });

export { contactSchema, adminReplySchema };