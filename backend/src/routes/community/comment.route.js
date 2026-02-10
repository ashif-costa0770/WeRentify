import express from "express";
import {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
  toggleLike,
  toggleSave
} from "../../controllers/community/comment.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
const router = express.Router();

//Comments routes
router.post('/:postId/comments', protect, createComment);
router.get("/:postId/comments",  getAllComments);
router.put("/:postId/comments/:commentId", protect, updateComment);
router.delete("/:postId/comments/:commentId", protect, deleteComment);

//Likes routes
router.post("/:postId/like", protect, toggleLike);

//Saves routes
router.post("/:postId/save", protect, toggleSave);


export default router;
