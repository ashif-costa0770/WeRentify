import api from "@/lib/api";

export const createPayment = (amount) => {
  return api.post("/payments/create-intent", { amount });
};