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
  api.post(`/posts/${postId}/like`, {},
    {
      headers: {
         "x-user-id": "65d9c91f9b1c2e0012abcd34", // ✅ valid ObjectId
      },
    });

// SAVE
export const savePost = (postId) =>
  api.post(`/posts/${postId}/save`);