import Comment from "../../models/community/comment.model.js";
import Post from "../../models/community/post.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

//! create comment
export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  const comment = await Comment.create({
    post: postId,
    user: req.user?._id,
    text,
  });

  // Increment comment count
  await Post.findByIdAndUpdate(postId, {
    $inc: { commentsCount: 1 },
  });

  return successResponse(res, 201, "Comment added successfully", comment);
};

//! Get all comments with pagination (Loads comments in chunks)
export const getAllComments = async (req, res) => {
  const { postId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "-password");

  const total = await Comment.countDocuments({ post: postId });

  return successResponse(res, 200, "Comments fetched successfully", {
    comments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

//! update comment
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return errorResponse(res, 400, "Comment text is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return errorResponse(res, 404, "Comment not found");
  }

  //   🔐 Future auth logic (keep commented)
  if (req.user && comment.user?.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, "Not authorized");
  }

  comment.text = text.trim();
  await comment.save();

  return successResponse(res, 200, "Comment updated successfully", comment);
};

//! delete comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return errorResponse(res, 404, "Comment not found");
  }

  // 🔐 Future auth logic
  if (req.user && comment.user?.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, "Not authorized");
  }

  await Comment.findByIdAndDelete(commentId);

  // decrement comment count
  await Post.findByIdAndUpdate(comment.post, {
    $inc: { commentsCount: -1 },
  });

  return successResponse(res, 200, "Comment deleted successfully");
};

//!-----------------Likes---------------------(In frontend use likes.length for likesCount)
export const toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?._id;

  if (!req.user) {
    return errorResponse(res, 401, "Login required to like a post");
  }

  const post = await Post.findById(postId);
  if (!post) {
    return errorResponse(res, 404, "Post not found");
  }

  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    post.likes.pull(userId); // unlike
  } else {
    post.likes.push(userId); // like
  }

  await post.save();
  const updatedPost = await Post.findById(postId).populate("author", "-password");
  return successResponse(
    res,
    200,
    alreadyLiked ? "Post unliked" : "Post liked",
    updatedPost,
  );
};

//!-----------------Saves---------------------(In frontend use saves.length for savesCount)
export const toggleSave = async (req, res) => {
  const { postId } = req.params;

  const userId = req.user?._id;

  if (!req.user) {
    return errorResponse(res, 401, "Login required to save a post");
  }

  const post = await Post.findById(postId);
  if (!post) {
    return errorResponse(res, 404, "Post not found");
  }

  const alreadySaved = post.saves.includes(userId);

  if (alreadySaved) {
    post.saves.pull(userId); // unsave
  } else {
    post.saves.push(userId); // save
  }

  await post.save();
  const updatedPost = await Post.findById(postId).populate("author", "-password");

  return successResponse(
    res,
    200,
    alreadySaved ? "Post unsaved" : "Post saved",
    updatedPost,
  );
};
