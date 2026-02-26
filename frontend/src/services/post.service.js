import api from "@/lib/api";

// CREATE POST - Do NOT set Content-Type; axios auto-sets multipart boundary for FormData
export const createPost = (data) => api.post("/posts", data);

// UPDATE POST (uses same multipart payload as create)
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);

// DELETE POST
export const deletePost = (id) => api.delete(`/posts/${id}`);

// GET ALL POSTS
export const getPosts = () => api.get("/posts");

// GET POSTS BY USER
export const getPostsByUser = () => api.get("/posts/user");

// GET SINGLE POST
export const getPostById = (id) => api.get(`/posts/${id}`);

// LIKE
export const likePost = (postId) => api.post(`/posts/${postId}/like`, {});

// SAVE
export const savePost = (postId) => api.post(`/posts/${postId}/save`);
