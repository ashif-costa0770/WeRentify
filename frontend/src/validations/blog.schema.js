import z from "zod";

const htmlToText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export const createBlogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z
    .string()
    .refine((val) => htmlToText(val).length >= 10, {
      message: "Content must be at least 10 characters (plain text)",
    }),
  status: z.enum(["draft", "published"]),
});