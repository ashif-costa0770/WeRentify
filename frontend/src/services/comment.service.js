import api from "@/lib/api";

// CREATE COMMENT
export const createComment = (postId, data) =>
  api.post(`/posts/${postId}/comments`, data);

// GET COMMENTS
export const getComments = (postId, params) =>
  api.get(`/posts/${postId}/comments`, { params });

// UPDATE COMMENT
export const updateComment = (commentId, data) =>
  api.put(`/comments/${commentId}`, data);

// DELETE COMMENT
export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);