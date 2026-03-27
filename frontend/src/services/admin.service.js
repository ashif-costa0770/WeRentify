import api from "@/lib/api";

/* ADMIN PROFILE */
export const getAdminProfile = () => {
  return api.get("/admin/me");
};

/* UPDATE ADMIN CREDENTIALS */
export const updateAdminCredentials = ({
  email,
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  return api.put("/admin/credentials", {
    email,
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

/* ADMIN LOGOUT */
export const adminLogout = () => {
  return api.post("/admin/logout");
};

/* GET ADMIN SETTINGS */
export const getSettings = () => {
  return api.get("/admin/settings");
}

/* ADMIN SETTINGS */
export const updateSettings = (data) =>{
  return api.put("/admin/settings", data);
}