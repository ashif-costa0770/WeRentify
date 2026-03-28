import express from "express";
import { adminReply, getMessages, sendMessage } from "../controllers/contact.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import validate from "../middlewares/validate.js";
import { adminReplySchema, contactSchema } from "../validations/contact.validation.js";
const router = express.Router();

router.post("/", validate(contactSchema), sendMessage);
router.get("/", verifyAdmin, getMessages);
router.post("/:messageId/reply", verifyAdmin, validate(adminReplySchema), adminReply);
export default router;