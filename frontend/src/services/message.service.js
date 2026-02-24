import api from "@/lib/api";

/* ------------------------------------------ */
/* CONVERSATIONS */
/* ------------------------------------------ */

// Create OR fetch conversation (Listing / Post)
export const createOrGetConversation = (data) =>
  api.post("/conversations", data);

// Get inbox conversations
export const getConversations = () =>
  api.get("/conversations");

/* ------------------------------------------ */
/* MESSAGES */
/* ------------------------------------------ */

// Send message
export const sendMessage = (data) =>
  api.post("/messages", data);

// Get messages of conversation
export const getMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);

// Mark messages as seen
export const markMessagesSeen = (conversationId) =>
  api.patch("/messages/seen", { conversationId });