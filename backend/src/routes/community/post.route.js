import express from "express";
import {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
  getPostsByUser,
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
  uploadListingMedia,
  handleMulterError,
  validate(createPostSchema),
  createPost,
);
router.get("/", getAllPost);
router.get("/user", protect,  getPostsByUser);
router.get("/:id", getSinglePost);
router.put(
  "/:id",
  protect,    
  uploadListingMedia,
  handleMulterError,
  validate(updatePostSchema),  
  updatePost,
);
router.delete("/:id",protect, validate(postByIdSchema), deletePost);

export default router;
