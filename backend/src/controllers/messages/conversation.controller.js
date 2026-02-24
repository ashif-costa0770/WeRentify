import Conversation from "../../models/messages/conversation.model.js";
import Listing from "../../models/listing/listing.model.js";
import Post from "../../models/community/post.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const createOrGetConversation = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { refId, refModel } = req.body;

    let receiverId;

    /* Resolve receiver */
    if (refModel === "Listing") {
      const listing = await Listing.findById(refId);
      if (!listing)
        return errorResponse(res, 404, "Listing not found");

      receiverId = listing.owner;
    }

    if (refModel === "Post") {
      const post = await Post.findById(refId);
      if (!post)
        return errorResponse(res, 404, "Post not found");

      receiverId = post.author;
    }

    if (!receiverId)
      return errorResponse(res, 400, "Invalid reference");

    if (senderId.equals(receiverId))
      return errorResponse(res, 400, "Cannot message yourself");

    const participants = [senderId, receiverId].sort();

    let conversation = await Conversation.findOne({
      participants,
      refId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        refId,
        refModel,
        unreadCounts: {
          [senderId]: 0,
          [receiverId]: 0,
        },
      });
    }

    return successResponse(
      res,
      200,
      "Conversation fetched successfully",
      conversation
    );
  } catch (error) {
    return errorResponse(res, 500, "Conversation failed", error.message);
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 }) // ✅ newest activity first
      .populate("participants", "firstname avatar email"); // adjust fields as needed

    return successResponse(
      res,
      200,
      "Conversations fetched successfully",
      conversations
    );
  } catch (error) {
    return errorResponse(res, 500, "Fetch conversations failed", error.message);
  }
};