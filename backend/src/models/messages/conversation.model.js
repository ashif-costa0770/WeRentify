import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    refModel: {
      type: String,
      enum: ["Listing", "Post"],
      required: true,
    },

    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "refModel",
    },

    lastMessage: {
      text: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
    },

    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

/* Prevent duplicate conversations */
conversationSchema.index(
  { participants: 1, refId: 1 },
  { unique: true }
);

export default mongoose.model("Conversation", conversationSchema);