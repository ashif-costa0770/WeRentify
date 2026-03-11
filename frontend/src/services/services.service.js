import api from "@/lib/api";

// CREATE SERVICE
export const createService = (data) =>
  api.post("/services", data);

// GET ALL SERVICES
export const getServices = () =>
  api.get("/services");

// GET ALL FEATURED SERVICES
export const getFeaturedServices = () =>
  api.get("/services/featured");

// GET SINGLE SERVICE
export const getServiceById = (id) =>
  api.get(`/services/${id}`);

// Get services by user
export const getServicesByUser = () =>
  api.get("/services/user");

//  UPDATE SERVICE
export const updateService = (id, data) =>
  api.put(`/services/${id}`, data);

// DELETE SERVICE
export const deleteService = (id) =>
  api.delete(`/services/${id}`);
