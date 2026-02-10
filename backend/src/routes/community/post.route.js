import express from "express";
import {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
} from "../../controllers/community/post.controller.js";
import {
  uploadListingMedia,
  handleMulterError,
} from "../../middlewares/upload.middleware.js";
import validate from "../../middlewares/validate.js";
import {
  createPostSchema,
  updatePostSchema,
  postByIdSchema,
} from "../../validations/post.validation.js";
import { protect } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.post(
  "/",
  protect,
  validate(createPostSchema),
  uploadListingMedia,
  handleMulterError,
  createPost,
);
router.get("/", getAllPost);
router.get("/:id", validate(postByIdSchema), getSinglePost);
router.put(
  "/:id",
  protect,
  validate(updatePostSchema),
  uploadListingMedia,
  handleMulterError,
  updatePost,
);
router.delete("/:id",protect, validate(postByIdSchema), deletePost);

export default router;
