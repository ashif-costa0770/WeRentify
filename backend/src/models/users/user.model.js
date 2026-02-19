import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 1. Core Authentication (Mobile First)
    name: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // ⭐ Only require if NOT Google user
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true, // important if you allow email signup too
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // 3. Profile (Optional - filled later)
    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      public_id: String,
      url: String,
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    // GeoJSON for map features
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },

    // 4. App Roles & State
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    mode: {
      type: String,
      enum: ["renter", "host"],
      default: "renter",
    },
    plan: {
      type: String,
      enum: ["basic", "pro"],
      default: "basic",
    },

    // 5. Reputation & Metrics
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    totalRentals: { type: Number, default: 0 },
    responseTime: { type: Number, default: null }, // In minutes

    // 6. Metadata
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);
export default User;
