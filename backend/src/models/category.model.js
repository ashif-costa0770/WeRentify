import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["item", "service"],
      required: true,
    },
    icon: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

//!Note-> categorySchema.pre("save", function (next) this only trigger when .save is called.

// Auto-generate slug from name
categorySchema.pre("save", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// on update slug auto updated
categorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.name) {
    update.slug = update.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
