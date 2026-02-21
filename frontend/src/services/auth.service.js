import api from "@/lib/api";

/* STEP 1 */
export const verifyEmailAPI = (email) =>
  api.post("/auth/verify-email", { email });

/* STEP 2 */
export const verifyOtpAPI = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp });

/* RESEND OTP */
export const resendOtpAPI = (email) => api.post("/auth/resend-otp", { email });

/* STEP 3 */
export const registerAPI = (firstname, email, password, confirmPassword) =>
  api.post("/auth/register", {
    firstname,
    email,
    password,
    confirmPassword,
  });

/* LOGIN */
export const loginAPI = (email, password) =>
  api.post("/auth/login", { email, password });

// GET CURRENT USER
export const getMe = () =>
  api.get("/auth/me", { withCredentials: true});

// LOGOUT
export const logout = () => api.post("/auth/logout");


// Facebook Login
export const facebookAuth = (accessToken ) =>{
  return api.post("/auth/facebook", {accessToken })
}