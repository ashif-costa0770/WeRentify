import api from "@/lib/api";

// LOGIN WITH PHONE
export const loginWithPhone = (data) =>
  api.post("/auth/login", data);

// GET CURRENT USER
export const getMe = () =>
  api.get("/auth/me");

// LOGOUT
export const logout = () =>
  api.post("/auth/logout");