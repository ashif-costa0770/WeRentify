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