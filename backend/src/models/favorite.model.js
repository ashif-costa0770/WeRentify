import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "productType",
    },

    productType: {
      type: String,
      required: true,
      enum: ["Listing", "Service"], // 🔥 MUST match model names
    },
  },
  { timestamps: true }
);

// Prevent duplicates
favoriteSchema.index({ user: 1, productId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);