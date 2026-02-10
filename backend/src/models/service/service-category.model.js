import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);
export default ServiceCategory;