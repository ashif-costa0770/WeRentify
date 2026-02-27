import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["inr", "usd"],
      default: "usd",
    },

    stripePriceId: {
      type: String,
      required: true,
    },

    stripeProductId: {
      type: String,
      required: true,
    },

    platformFeePercent: {
      type: Number,
      required: true, // 5, 3, 1
      min: 0,
    },

    features: {
      type: [String],
      required: true,
      min: 1,
    },

    popular: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;