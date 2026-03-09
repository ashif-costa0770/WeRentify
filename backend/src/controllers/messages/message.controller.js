import mongoose from "mongoose";
import Message from "../../models/messages/message.model.js";
import Conversation from "../../models/messages/conversation.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { io } from "../../server.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const hasParticipant = (participants = [], userId) =>
  participants.some((id) => String(id) === String(userId));

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId, text } = req.body;

    if (!isValidObjectId(conversationId)) {
      return errorResponse(res, 400, "Invalid conversationId");
    }

    const conversation = await Conversation.findById(conversationId)
      .select("participants")
      .lean();

    if (!conversation) return errorResponse(res, 404, "Conversation not found");

    const isParticipant = hasParticipant(conversation.participants, senderId);
    if (!isParticipant) return errorResponse(res, 403, "Unauthorized");

    const receiverId = conversation.participants.find(
      (id) => String(id) !== String(senderId),
    );

    if (!receiverId) {
      return errorResponse(res, 400, "Invalid conversation participants");
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text,
    });

    await Conversation.updateOne(
      { _id: conversationId },
      {
        $set: {
          lastMessage: {
            text,
            sender: senderId,
            createdAt: new Date(),
          },
        },
        $inc: {
          [`unreadCounts.${receiverId.toString()}`]: 1,
        },
      },
    );

    io.to(receiverId.toString()).emit("new_message", message);

    return successResponse(res, 200, "Message sent", message);
  } catch (error) {
    return errorResponse(res, 500, "Send message failed", error.message);
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    if (!isValidObjectId(conversationId)) {
      return errorResponse(res, 400, "Invalid conversationId");
    }

    const conversation = await Conversation.findById(conversationId)
      .select("participants")
      .lean();

    if (!conversation) return errorResponse(res, 404, "Conversation not found");

    const isParticipant = hasParticipant(conversation.participants, userId);
    if (!isParticipant) return errorResponse(res, 403, "Unauthorized access");

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 30, 1),
      100,
    );
    const messageQuery = { conversation: conversationId };
    const cursor = req.query.cursor;

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (Number.isNaN(cursorDate.getTime())) {
        return errorResponse(
          res,
          400,
          "Invalid cursor. Provide ISO date in cursor query param.",
        );
      }

      messageQuery.createdAt = { $lt: cursorDate };

      const messages = await Message.find(messageQuery)
        .select("conversation sender receiver text seen createdAt")
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      const hasMore = messages.length > limit;
      const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;
      const nextCursor = hasMore
        ? paginatedMessages[paginatedMessages.length - 1]?.createdAt?.toISOString()
        : null;

      paginatedMessages.reverse();

      return successResponse(res, 200, "Messages fetched successfully", {
        messages: paginatedMessages,
        pagination: {
          limit,
          hasMore,
          nextCursor,
        },
      });
    }

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;
    const [messages, totalItems] = await Promise.all([
      Message.find(messageQuery)
        .select("conversation sender receiver text seen createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(messageQuery),
    ]);

    messages.reverse();

    return successResponse(res, 200, "Messages fetched successfully", {
      messages,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, "Fetch messages failed", error.message);
  }
};

export const markMessagesSeen = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.body;

    if (!isValidObjectId(conversationId)) {
      return errorResponse(res, 400, "Invalid conversationId");
    }

    const conversation = await Conversation.findById(conversationId)
      .select("participants")
      .lean();

    if (!conversation) return errorResponse(res, 404, "Conversation not found");

    const isParticipant = hasParticipant(conversation.participants, userId);
    if (!isParticipant) return errorResponse(res, 403, "Unauthorized access");

    await Promise.all([
      Message.updateMany(
        {
          conversation: conversationId,
          receiver: userId,
          seen: false,
        },
        { seen: true },
      ),
      Conversation.updateOne(
        { _id: conversationId },
        { $set: { [`unreadCounts.${userId.toString()}`]: 0 } },
      ),
    ]);

    return successResponse(res, 200, "Messages marked as seen");
  } catch (error) {
    return errorResponse(res, 500, "Seen update failed", error.message);
  }
};
