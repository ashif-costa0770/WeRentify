import api from "@/lib/api";

export const createReview = (data) => api.post("/reviews", data);

export const getAllReviews = (targetId, targetModel) => api.get(`/reviews`, { params: { targetId, targetModel } });

export const updateReview = (reviewId, data) => api.patch(`/reviews/${reviewId}`, data);

export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);
