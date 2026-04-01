import express from "express";
import { createBlog, deleteBlog, getAllBlogs, getBlogBySlug, getBlogsForAdmin, toggleBlogStatus, updateBlog } from "../../controllers/admin/blog.controller.js";
import { uploadBlogThumbnail, handleMulterError } from "../../middlewares/upload.middleware.js";
import validate from "../../middlewares/validate.js";
import { createBlogSchema, updateBlogSchema } from "../../validations/blog.validation.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/", verifyAdmin, uploadBlogThumbnail, handleMulterError, validate(createBlogSchema), createBlog);
router.get("/", getAllBlogs);
router.get("/admin", verifyAdmin, getBlogsForAdmin);
router.get("/:slug", getBlogBySlug);
router.put("/:id", verifyAdmin, uploadBlogThumbnail, handleMulterError, validate(updateBlogSchema), updateBlog);
router.delete("/:id", verifyAdmin, deleteBlog);
router.patch("/:id/toggle-status", verifyAdmin, toggleBlogStatus);

export default router;
