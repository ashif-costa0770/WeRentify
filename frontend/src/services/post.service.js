import api from "@/lib/api";

// CREATE POST
export const createPost = (data) =>
  api.post("/posts", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// GET ALL POSTS
export const getPosts = () =>
  api.get("/posts");

// LIKE
export const likePost = (postId) =>
  api.post(`/posts/${postId}/like`, {});

// SAVE
export const savePost = (postId) =>
  api.post(`/posts/${postId}/save`);