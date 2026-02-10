import api from "@/lib/api";

// CREATE COMMENT
export const createComment = (postId, data) =>
  api.post(`/posts/${postId}/comments`, data);

// GET COMMENTS
export const getComments = (postId, params) =>
  api.get(`/posts/${postId}/comments`, { params });

// UPDATE COMMENT
export const updateComment = (postId, commentId, data) =>
  api.put(`/posts/${postId}/comments/${commentId}`, data);

// DELETE COMMENT
export const deleteComment = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);
