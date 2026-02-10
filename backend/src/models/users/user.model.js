import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 1. Core Authentication (Mobile First)
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      unique: true,
      index: true,
    },
    countryCode: {
      type: String,
      required: [true, "Country code is required"],
      trim: true,
    },

    // 2. Verification (Placeholder for now)
    isVerified: {
      type: Boolean,
      default: false,
    },

    // 3. Profile (Optional - filled later)
    name: {
      type: String,
      trim: true,
      default: "User",
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Optional + Unique
      lowercase: true,
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

// Compound index for uniqueness if needed, though mobileNumber is unique
userSchema.index({ mobileNumber: 1 });

const User = mongoose.model("User", userSchema);

export default User;
