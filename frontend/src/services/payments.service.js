import api from "@/lib/api";

export const createPayment = (amount) => {
  return api.post("/payments/create-intent", { amount });
};

export const createPlanCheckoutSession = (planId) => {
  return api.post("/payments/create-checkout-session", { planId });
};

export const verifySession = (sessionId) => {
  return api.get(`/payments/verify-session/${sessionId}`);
};

export const createServiceBookingCheckoutSession = (payload) => {
  return api.post("/payments/service-booking/create-checkout-session", payload);
};

export const verifyServiceBookingSession = (sessionId) => {
  return api.get(`/payments/service-booking/verify-session/${sessionId}`);
};

export const createListingBookingCheckoutSession = (payload) => {
  return api.post("/payments/listing-booking/create-checkout-session", payload);
};

export const verifyListingBookingSession = (sessionId) => {
  return api.get(`/payments/listing-booking/verify-session/${sessionId}`);
};