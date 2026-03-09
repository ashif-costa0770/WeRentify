import api from "@/lib/api";

export const createBooking = (data) => api.post("/bookings", data);

export const getMyBookings = () => api.get("/bookings/my");

export const getBookingsForMyResources = () => api.get("/bookings/resource");

export const getBookingById = (id) => api.get(`/bookings/${id}`);

export const updateBookingStatus = (id, data) =>
  api.patch(`/bookings/${id}/status`, data);

export const getBookedServiceSlots = (serviceId, date) =>
  api.get(`/bookings/service/${serviceId}/slots`, { params: { date } });
