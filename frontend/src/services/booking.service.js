import api from "@/lib/api";

export const createBooking = (data) => api.post("/bookings", data);

export const getMyBookings = () => api.get("/bookings/my");

export const getBookingsForMyResources = () => api.get("/bookings/resource");

export const getBookedServiceSlots = (serviceId, date) =>
  api.get(`/bookings/service/${serviceId}/slots`, { params: { date } });
