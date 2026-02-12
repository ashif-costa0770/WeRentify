import api from "@/lib/api";

// CREATE SERVICE
export const createService = (data) =>
  api.post("/services", data);

// GET ALL SERVICES
export const getServices = () =>
  api.get("/services");
