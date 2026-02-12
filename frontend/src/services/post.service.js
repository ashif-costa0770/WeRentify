import api from "@/lib/api";

// CREATE POST - Do NOT set Content-Type; axios auto-sets multipart boundary for FormData
export const createPost = (data) => api.post("/posts", data);

// GET ALL POSTS
export const getPosts = () =>
  api.get("/posts");

// LIKE
export const likePost = (postId) =>
  api.post(`/posts/${postId}/like`, {});

// SAVE
export const savePost = (postId) =>
  api.post(`/posts/${postId}/save`);