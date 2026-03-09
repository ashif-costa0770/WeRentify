import Conversation from "../../models/messages/conversation.model.js";
import Listing from "../../models/listing/listing.model.js";
import Post from "../../models/community/post.model.js";
import Service from "../../models/service/service.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const createOrGetConversation = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { refId, refModel } = req.body;

    let receiverId;

    /* Resolve receiver */
    if (refModel === "Listing") {
      const listing = await Listing.findById(refId).select("owner").lean();
      if (!listing)
        return errorResponse(res, 404, "Listing not found");

      receiverId = listing.owner;
    }

    if (refModel === "Post") {
      const post = await Post.findById(refId).select("author").lean();
      if (!post)
        return errorResponse(res, 404, "Post not found");

      receiverId = post.author;
    }

    if (refModel === "Service") {
      const service = await Service.findById(refId).select("owner").lean();
      if (!service) {
        return errorResponse(res, 404, "Service not found");
      }

      receiverId = service.owner;
    }

    if (!receiverId)
      return errorResponse(res, 400, "Invalid reference");

    if (senderId.equals(receiverId))
      return errorResponse(res, 400, "Cannot message yourself");

    const participants = [senderId, receiverId];
    const participantsKey = Conversation.buildParticipantsKey(participants);

    let conversation = await Conversation.findOne({
      participantsKey,
      refId,
      refModel,
    }).lean();

    if (!conversation) {
      try {
        conversation = await Conversation.create({
          participants,
          participantsKey,
          refId,
          refModel,
          unreadCounts: {
            [senderId]: 0,
            [receiverId]: 0,
          },
        });
      } catch (createError) {
        // Handle concurrent requests creating the same conversation.
        if (createError?.code !== 11000) throw createError;

        conversation = await Conversation.findOne({
          participantsKey,
          refId,
          refModel,
        }).lean();
      }
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
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
      50,
    );
    const skip = (page - 1) * limit;
    const query = { participants: userId };

    const [conversations, totalItems] = await Promise.all([
      Conversation.find(query)
        .select(
          "participants refModel refId lastMessage.text lastMessage.sender lastMessage.createdAt unreadCounts updatedAt",
        )
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants", "firstname lastname avatar")
        .lean(),
      Conversation.countDocuments(query),
    ]);

    const optimizedConversations = conversations.map((item) => ({
      ...item,
      lastMessage: item.lastMessage
        ? {
            ...item.lastMessage,
            text: item.lastMessage.text?.slice(0, 160) || "",
          }
        : null,
    }));

    return successResponse(
      res,
      200,
      "Conversations fetched successfully",
      {
        conversations: optimizedConversations,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      }
    );
  } catch (error) {
    return errorResponse(res, 500, "Fetch conversations failed", error.message);
  }
};
