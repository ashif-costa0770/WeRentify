import express from "express";
import { createBlog, deleteBlog, getAllBlogs, getBlogBySlug, updateBlog } from "../../controllers/admin/blog.controller.js";
import { uploadBlogThumbnail, handleMulterError } from "../../middlewares/upload.middleware.js";
import validate from "../../middlewares/validate.js";
import { createBlogSchema, updateBlogSchema } from "../../validations/blog.validation.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/", verifyAdmin, uploadBlogThumbnail, handleMulterError, validate(createBlogSchema), createBlog);
router.get("/", verifyAdmin, getAllBlogs);
router.get("/:slug", verifyAdmin, getBlogBySlug);
router.put("/:id", verifyAdmin, uploadBlogThumbnail, handleMulterError, validate(updateBlogSchema), updateBlog);
router.delete("/:id", verifyAdmin, deleteBlog);

export default router;
