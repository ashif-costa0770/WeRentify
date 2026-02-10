import z from 'zod'

const createPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  type: z.enum(["item", "service"]),                                                            
  description: z.string().trim().min(1, "Description is required"),
  category: z.string().trim().min(1, "Category is required"),
  location: z.string().trim().min(1, "Location is required"),
  budget: z.string().trim().optional(),
  likes: z.array(z.string()).optional(),
  commentsCount: z.number().optional(),
  saves: z.array(z.string()).optional(),
  distance: z.number().optional(),
  dateNeeded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  photos: z.any().optional()
});

const updatePostSchema = z.object({
  title: z.string().trim().min(3).optional(),
  type: z.enum(["item", "service"]).optional(),
  description: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  budget: z.string().trim().optional(),
  likes: z.array(z.string()).optional(),
  commentsCount: z.number().optional(),
  saves: z.array(z.string()).optional(),
  distance: z.number().optional(),
  dateNeeded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  photos: z.any().optional(),
});

const postByIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
});


export { createPostSchema, updatePostSchema, postByIdSchema };