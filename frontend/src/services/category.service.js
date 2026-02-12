import api from "@/lib/api";

// CREATE CATEGORY
export const createCategory = (data) =>
  api.post("/category", data);

// GET ALL CATEGORIES
export const getAllCategory = (type) =>
    api.get("/category", {
      params: { type },
    });

// GET SINGLE CATEGORY
export const getSingleCategory = (id) =>
  api.get(`/category/${id}`);

// UPDATE CATEGORY
export const updateCategory = (id, data) =>
  api.put(`/category/${id}`, data);

// DELETE CATEGORY
export const deleteCategory = (id) =>
  api.delete(`/category/${id}`);