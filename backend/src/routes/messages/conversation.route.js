import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { createOrGetConversation, getUserConversations } from "../../controllers/messages/conversation.controller.js";

const router = express.Router();

/* Create OR fetch existing conversation */
router.post("/", protect, createOrGetConversation);

/* ✅ Inbox API */
router.get("/", protect, getUserConversations);

export default router;