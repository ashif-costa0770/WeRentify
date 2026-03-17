import express from "express";
import {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
  getPostsByUser,
  getPostLocationSuggestions,
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
router.get("/location-suggestions", getPostLocationSuggestions);
router.get("/:id", getSinglePost);
router.put(
  "/:id",
  protect,    
  uploadListingMedia,
  handleMulterError,
  validate(updatePostSchema),  
  updatePost,
);
// Delete uses param-based validation instead of body validation middleware
router.delete(
  "/:id",
  protect,
  (req, res, next) => {
    const parsed = postByIdSchema.safeParse({ id: req.params.id });
    if (!parsed.success) {
      const message = parsed.error?.issues?.[0]?.message || "Invalid post ID";
      return res.status(400).json({ success: false, message });
    }
    return next();
  },
  deletePost,
);

export default router;
