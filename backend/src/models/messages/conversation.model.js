import mongoose from "mongoose";

const buildParticipantsKey = (participants = []) =>
  participants
    .map((participant) => participant.toString())
    .sort()
    .join(":");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    participantsKey: {
      type: String,
      required: true,
    },

    refModel: {
      type: String,
      enum: ["Listing", "Post", "Service"],
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

conversationSchema.pre("validate", function setParticipantsKey(next) {
  if (!Array.isArray(this.participants) || this.participants.length !== 2) {
    return next(new Error("Conversation must have exactly 2 participants"));
  }

  this.participantsKey = buildParticipantsKey(this.participants);
  next();
});

/* Prevent duplicate conversations */
conversationSchema.index(
  { participantsKey: 1, refModel: 1, refId: 1 },
  { unique: true }
);
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ refModel: 1, refId: 1 });
conversationSchema.index(
  { refId: 1, updatedAt: -1 },
  { partialFilterExpression: { refModel: "Service" } }
);

conversationSchema.statics.buildParticipantsKey = buildParticipantsKey;

export default mongoose.model("Conversation", conversationSchema);
