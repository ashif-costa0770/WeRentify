import mongoose from "mongoose";

const helpCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minlength: 2,
      maxlength: 140,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 400,
    },
    icon: {
      type: String,
      trim: true,
      default: "HelpCircle",
      maxlength: 80,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

helpCategorySchema.index({ isActive: 1, order: 1, name: 1 });

const HelpCategory = mongoose.model("HelpCategory", helpCategorySchema);

export default HelpCategory;
