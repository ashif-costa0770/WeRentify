import Post from "../../models/community/post.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { uploadBufferToCloudinary } from "../../config/cloudinary.js";

//! Create Post
export const createPost = async (req, res) => {
  try {

    if (!req.user) {
      return errorResponse(res, 401, "Login required to create a post");
    }
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
      budget: req.body.budget ?? "",
      photos: uploadedPhotos,
      author: req.user._id,
    });

    return successResponse(res, 201, "Post created successfully", {
      post,
      author: req.user,
    });
  } catch (error) {
    console.log("Error in creating post", error);
    return errorResponse(res, 500, "Failed to create post", error.message);
  }
};

//! Get all post
export const getAllPost = async (req, res) => {
  try {
    const { location } = req.query;
    const filter = {}

    if (location && location.trim() !== ""){
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      }
    }
    const posts = await Post.find(filter).populate("author").sort({ createdAt: -1 });
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
    const post = await Post.findById(req.params.id).populate("author", "name email");
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

//! Get posts by user
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).populate("author" , "email firstname lastname avatar _id").sort({ createdAt: -1 });
    if (posts.length === 0) {
      return errorResponse(res, 404, "User has no posts");
    }
    return successResponse(res, 200, " User posts fetched successfully", posts);
  } catch (error) {
    console.log("Error in fetching user posts", error);
    return errorResponse(
      res,
      500,
      "Failed to fetch user posts",
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

    if (existingPost.author.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "You are not authorized to update this post");
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
      author: req.user._id,
    };

    const updatedPost = await Post.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, "Post updated successfully", {
      post: updatedPost,
      author: req.user,
    });
  } catch (error) {
    console.log("Error in updating post", error);
    return errorResponse(res, 500, "Failed to update post", error.message);
  }
};

//! Delete Post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 404, "No post found");
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return errorResponse(
        res,
        403,
        "You are not authorized to delete this post",
      );
    }

    await post.deleteOne();

    return successResponse(res, 200, "Post deleted successfully", post);
  } catch (error) {
    console.log("Error in deleting post", error);
    return errorResponse(res, 500, "Failed to delete post", error.message);
  }
};

//! Get location suggestions for posts
export const getPostLocationSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return successResponse(res, 200, "No query provided", {
        locations: [],
      });
    }

    const search = q.trim();

    const locations = await Post.distinct("location", {  // distinct returns unique values only.
      location: { $regex: search, $options: "i" },
    });

    return successResponse(res, 200, "Location suggestions fetched for posts", {
      locations: locations.slice(0, 5),
    });

  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch location suggestions", error.message);
  }
};
