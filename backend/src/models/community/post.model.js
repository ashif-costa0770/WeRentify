import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      required: true,
      enum: ["service", "item"],
      default: "service",
    },
    category: {
      type: String,
      trim: true,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      //   required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    dateNeeded: {
      type: Date,
      required: true,
    },
    budget: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    distance: {
      type: Number,
      default: 0,
    },
    photos: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
        width: Number,
        height: Number,
        format: String,
      },
    ],
  },
  { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);
export default Post;
