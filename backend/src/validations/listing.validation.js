import { z } from "zod";

/* ---------- Reusable Helpers ---------- */

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const stringArray = z
  .union([z.string(), z.array(z.string())])
  .transform((val) => (Array.isArray(val) ? val : [val]));

/* ---------- Media Schemas ---------- */

const photoSchema = z.object({
  public_id: z.string().min(1),
  url: z.url(),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
});

const videoSchema = z.object({
  public_id: z.string().min(1),
  url: z.url(),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  duration: z.number().optional(),
});

/* ---------- GeoJSON Schema ---------- */

const coordinatesSchema = z.object({
  type: z.literal("Point").default("Point"),
  coordinates: z.array(z.number()).length(2, "Coordinates must be [lng, lat]"),
  formattedAddress: z.string().optional(),
});

/* ---------- Main Listing Schema ---------- */

export const createListingSchema = z.object({
  /* Step 1: Media */
  photos: z.array(photoSchema).optional(),
  videos: z.array(videoSchema).optional(),

  /* Step 2: Item Details */
  itemName: z.string().trim().max(100),
  category: objectId,
  description: z.string().trim().max(5000),
  pickupLocation: z.string().trim(),

  coordinates: coordinatesSchema.optional(),

  features: stringArray.optional(),

  rentalRules: stringArray.optional(),

  cancellationPolicy: z.string().optional(),

  /* Step 3: Pricing */
  hourlyRate: z.coerce.number().min(0).nullable().optional(), //coerce automatically convert string to number
  dailyRate: z.coerce.number().min(0),
  weeklyRate: z.coerce.number().min(0).nullable().optional(),

  /* Step 4 */
  isAvailable: z.boolean().optional(),
  offerDelivery: z.boolean().optional(),
  deliveryFee: z.coerce.number().min(0).nullable().optional(),

  /* Step 5 */
  stripeConnected: z.boolean().optional(),
  stripeAccountId: z.string().nullable().optional(),

  /* Marketplace */
  owner: objectId,

  views: z.coerce.number().optional(),
  bookings: z.coerce.number().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewCount: z.coerce.number().optional(),

  status: z
    .enum(["active", "inactive", "rented", "under_maintenance"])
    .optional(),
});

// More concise - creates optional version of all fields
export const updateListingSchema = createListingSchema.partial();


export const ListingByIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
});