import { errorResponse, successResponse } from "../../utils/response.js";
import slugify from "slugify";
import Blog from "../../models/admin/blog.model.js";
import { deleteFromCloudinary, uploadBufferToCloudinary } from "../../config/cloudinary.js";

//! Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const slug = slugify(title, { lower: true });

    // 🔎 Check duplicate
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return errorResponse(res, 400, "Blog with this title already exists");
    }

    // 📸 Upload thumbnail
    let thumbnail = null;
    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "blogs/thumbnails",
        "image",
      );
      thumbnail = {
        public_id: uploaded.public_id,
        url: uploaded.url,
      };
    }

    // 💾 Create blog
    const blog = await Blog.create({
      title,
      slug,
      content,
      thumbnail,
      status,
    });

    return successResponse(res, 201, "Blog created successfully", blog);
  } catch (error) {
    console.log("Error in creating blog", error.message);
    return errorResponse(res, 500, "Failed to create blog", error.message);
  }
};

//! Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" }).sort({
      createdAt: -1,
    });
    if (!blogs || blogs.length === 0) {
      return errorResponse(res, 404, "No blogs found");
    }
    return successResponse(res, 200, "All blogs fetched successfully", {
      blogs,
      total: blogs.length,
    });
  } catch (error) {
    console.log("Error in getting all blogs", error.message);
    return errorResponse(res, 500, "Failed to get all blogs", error.message);
  }
};

//! Get blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: "published" });

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    return successResponse(res, 200, "Blog fetched successfully", blog);
  } catch (error) {
    console.log("Error in getting blog by slug", error.message);
    return errorResponse(res, 500, "Failed to get blog by slug", error.message);
  }
};

//! Update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }
    
    if (title) {
      const slug = slugify(title, { lower: true });
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        return errorResponse(res, 400, "Blog with this title already exists");
      }
      blog.title = title;
      blog.slug = slug;
    }
    if (content) {
      blog.content = content;
    }
    if (status) {
      blog.status = status;
    }

    //📸 Upload thumbnail
    if (req.file) {
      if (blog.thumbnail?.public_id) {
        await deleteFromCloudinary(blog.thumbnail.public_id, "image");
      }
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "blogs/thumbnails",
        "image",
      );
      blog.thumbnail = {
        public_id: uploaded.public_id,
        url: uploaded.url,
      };
    }
    await blog.save();
    return successResponse(res, 200, "Blog updated successfully", blog);
  } catch (error) {
    console.log("Error in updating blog", error.message);
    return errorResponse(res, 500, "Failed to update blog", error.message);
  }
};

//! Delete blog
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if(!blog) {
            return errorResponse(res, 404, "Blog not found");
        }
        if(blog.thumbnail?.public_id) {
            await deleteFromCloudinary(blog.thumbnail.public_id, "image");
        }

        await Blog.findByIdAndDelete(id);
        return successResponse(res, 200, "Blog deleted successfully");
    } catch (error) {
        console.log("Error in deleting blog", error.message);
        return errorResponse(res, 500, "Failed to delete blog", error.message);
        
    }
}
