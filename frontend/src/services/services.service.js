import api from "@/lib/api";

// CREATE SERVICE
export const createService = (data) =>
  api.post("/services", data);

// GET ALL SERVICES
export const getServices = () =>
  api.get("/services");

//  UPDATE SERVICE
export const updateService = (id, data) =>
  api.post(`/services/${id}`, data);

// DELETE SERVICE
export const deleteService = (id) =>
  api.get(`/services/${id}`);
