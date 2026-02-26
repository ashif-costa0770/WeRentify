import api from "@/lib/api";


/* UPDATE User profile */
export const updateProfile = (data) =>
  api.put(`/user/profile`, data);

/* CHANGE PASSWORD FLOW */
export const sendPasswordOtp = () => api.post(`/user/send-otp`, {});

export const resendPasswordOtp = () => api.post(`/user/resend-otp`, {});

export const verifyPasswordOtp = (data) => api.post(`/user/verify-otp`, data);

export const changePassword = (data) => api.post(`/user/change-password`, data);

//Delete user account
export const deleteAccount = ()=> {
  return api.delete(`/user/delete-account`);
}

export const updatePlan = (data) => api.patch(`/user/plan`, data);