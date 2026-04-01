import api from "@/lib/api";

export const getBlogs = () => api.get("admin/blogs");

export const getBlogsForAdmin = () => api.get("admin/blogs/admin");

export const getBlogBySlug = (slug) => api.get(`admin/blogs/${slug}`);

export const createBlog = (data) => api.post("admin/blogs", data);

export const updateBlog = (id, data) => api.put(`admin/blogs/${id}`, data);

export const deleteBlog = (id) => api.delete(`admin/blogs/${id}`);

export const toggleBlogStatus = (id) => api.patch(`admin/blogs/${id}/toggle-status`);
