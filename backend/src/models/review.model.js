import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },

    targetModel: {
      type: String,
      required: true,
      enum: ["Listing", "Service"],
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    reply: String,
    replyAt: Date,
  },
  { timestamps: true }
);

/* Indexes */

reviewSchema.index({ target: 1, targetModel: 1 });

reviewSchema.index({ target: 1, targetModel: 1, createdAt: -1 });

reviewSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);