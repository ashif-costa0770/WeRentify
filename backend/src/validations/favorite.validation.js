import { z } from "zod";
import mongoose from "mongoose";

// helper to validate ObjectId
const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createFavoriteSchema = z.object({
  productId: objectIdSchema,

  productType: z.enum(["Listing", "Service"], {
    errorMap: () => ({
      message: "productType must be either 'Listing' or 'Service'",
    }),
  }),
});