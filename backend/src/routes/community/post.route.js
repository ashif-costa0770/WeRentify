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
const router = express.Router();

router.post(
  "/",
  validate(createPostSchema),
  uploadListingMedia,
  handleMulterError,
  createPost,
);
router.get("/", getAllPost);
router.get("/:id", validate(postByIdSchema), getSinglePost);
router.put(
  "/:id",
  validate(updatePostSchema),
  uploadListingMedia,
  handleMulterError,
  updatePost,
);
router.delete("/:id", validate(postByIdSchema), deletePost);

export default router;
