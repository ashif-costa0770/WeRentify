import api from "@/lib/api";

export const getHelpCategories = (params = {}) => api.get("/help/categories", { params });

export const getFaqsByCategorySlug = (slug, params = {}) =>
  api.get(`/help/categories/${slug}/faqs`, { params });

export const searchHelpFaqs = (q) => api.get("/help/search", { params: { q } });

export const createHelpCategory = (data) => api.post("/help/categories", data);

export const updateHelpCategory = (id, data) => api.patch(`/help/categories/${id}`, data);

export const deleteHelpCategory = (id) => api.delete(`/help/categories/${id}`);

export const createHelpFaq = (data) => api.post("/help/faqs", data);

export const updateHelpFaq = (id, data) => api.patch(`/help/faqs/${id}`, data);

export const deleteHelpFaq = (id) => api.delete(`/help/faqs/${id}`);
