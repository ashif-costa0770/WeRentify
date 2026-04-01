import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      public_id: String,
      url: String,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true },
);

blogSchema.index({ title: "text", content: "text" });
blogSchema.index({ status: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ thumbnail: 1 });
const Blog = mongoose.model("Blog", blogSchema);
export default Blog;