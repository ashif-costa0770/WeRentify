import Post from "../../models/community/post.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { uploadBufferToCloudinary } from "../../config/cloudinary.js";

//! Create Post
export const createPost = async (req, res) => {
  try {
    let uploadedPhotos = [];
    if (req.files?.photos) {
      if (req.files.photos.length > 3) {
        return errorResponse(res, 400, "Maximum 3 photos allowed");
      }
      const uploadPromises = req.files.photos.map((photo) =>
        uploadBufferToCloudinary(photo.buffer, "rental-items/photos", "image"),
      );

      uploadedPhotos = await Promise.all(uploadPromises);
    }

    const post = await Post.create({
      ...req.body,
      photos: uploadedPhotos,
    });

    return successResponse(res, 201, "Post created successfully", post);
  } catch (error) {
    console.log("Error in creating post", error);
    return errorResponse(res, 500, "Failed to create post", error.message);
  }
};

//! Get all post
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    if (!posts) {
      return errorResponse(res, 404, "No post found");
    }
    return successResponse(res, 200, "All post fetched successfully", posts);
  } catch (error) {
    console.log("Error in fetching all post", error);
    return errorResponse(res, 500, "Failed to fetch all post", error.message);
  }
};

//! Get single Post
export const getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, "No post found");
    }
    return successResponse(res, 200, "Post fetched successfully", post);
  } catch (error) {
    console.log("Error in fetching single post", error);
    return errorResponse(
      res,
      500,
      "Failed to fetch single post",
      error.message,
    );
  }
};

//! Update Post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return errorResponse(res, 404, "Post not found");
    }

    // Handle photo uploads if new photos are provided
    let updatedPhotos = existingPost.photos || [];
    if (req.files?.photos) {
      if (req.files.photos.length > 3) {
        return errorResponse(res, 400, "Maximum 3 photos allowed");
      }

      const uploadPromises = req.files.photos.map((photo) =>
        uploadBufferToCloudinary(photo.buffer, "rental-items/photos", "image"),
      );

      updatedPhotos = await Promise.all(uploadPromises);
    }

    // Update only the fields that are provided
    const updatedData = {
      ...req.body,
      photos: updatedPhotos,
    };

    const updatedPost = await Post.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, "Post updated successfully", updatedPost);
  } catch (error) {
    console.log("Error in updating post", error);
    return errorResponse(res, 500, "Failed to update post", error.message);
  }
};

//! Delete Post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return errorResponse(res, 404, "No post found");
    }
    return successResponse(res, 200, "Post deleted successfully", post);
  } catch (error) {
    console.log("Error in deleting post", error);
    return errorResponse(res, 500, "Failed to delete post", error.message);
  }
};
