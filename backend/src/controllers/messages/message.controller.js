import Message from "../../models/messages/message.model.js";
import Conversation from "../../models/messages/conversation.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { io } from "../../server.js"; // ✅ IMPORTANT

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId, text } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) return errorResponse(res, 404, "Conversation not found");

    const isParticipant = conversation.participants.some((id) =>
      id.equals(senderId),
    );

    if (!isParticipant) return errorResponse(res, 403, "Unauthorized");

    const receiverId = conversation.participants.find(
      (id) => !id.equals(senderId),
    );

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text,
    });

    /* Update conversation metadata */
    conversation.lastMessage = {
      text,
      sender: senderId,
      createdAt: new Date(),
    };

    conversation.unreadCounts.set(
      receiverId.toString(),
      (conversation.unreadCounts.get(receiverId.toString()) || 0) + 1,
    );

    await conversation.save();

    /* ✅ REAL-TIME EMIT */
    io.to(receiverId.toString()).emit("new_message", message);

    return successResponse(res, 200, "Message sent", message);
  } catch (error) {
    return errorResponse(res, 500, "Send message failed", error.message);
  }
};

//!Get conversation messages
export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) return errorResponse(res, 404, "Conversation not found");

    /* ✅ Authorization Check (VERY IMPORTANT) */
    const isParticipant = conversation.participants.some((id) =>
      id.equals(userId),
    );

    if (!isParticipant) return errorResponse(res, 403, "Unauthorized access");

    const messages = await Message.find({
      conversation: conversationId,
    }).sort({ createdAt: 1 }); // ✅ oldest → newest

    return successResponse(res, 200, "Messages fetched successfully", messages);
  } catch (error) {
    return errorResponse(res, 500, "Fetch messages failed", error.message);
  }
};

//!mark Messages Seen
export const markMessagesSeen = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.body;

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        seen: false,
      },
      { seen: true },
    );

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) return errorResponse(res, 404, "Conversation not found");

    conversation.unreadCounts.set(userId.toString(), 0);
    await conversation.save();

    return successResponse(res, 200, "Messages marked as seen");
  } catch (error) {
    return errorResponse(res, 500, "Seen update failed", error.message);
  }
};
