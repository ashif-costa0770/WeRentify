import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  sendMessage,
  markMessagesSeen,
  getConversationMessages,
} from "../../controllers/messages/message.controller.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.patch("/seen", protect, markMessagesSeen);
/* ✅ Chat Window API */
router.get("/:conversationId", protect, getConversationMessages);

export default router;