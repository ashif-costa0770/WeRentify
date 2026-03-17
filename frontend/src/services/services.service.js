import api from "@/lib/api";

// CREATE SERVICE
export const createService = (data) =>
  api.post("/services", data);

// GET ALL SERVICES
export const getServices = ( params = {}) =>{
  const query = new URLSearchParams();
  if(params.location && String(params.location).trim()){
    query.set("location", String(params.location).trim());
  }  
  const qs = query.toString();
  return api.get(qs ? `/services?${qs}` : "/services");
}

// GET ALL FEATURED SERVICES
export const getFeaturedServices = ( params = {}) =>{
  const query = new URLSearchParams();
  if(params.location && String(params.location).trim()){
    query.set("location", String(params.location).trim());
  }
  const qs = query.toString();
  return api.get(qs ? `/services/featured?${qs}`: "/services/featured")
}

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

// GET LOCATION SUGGESTIONS FOR SERVICES
export const getLocationSuggestions = (q) =>
  api.get(`/services/location-suggestions?q=${q}`);
