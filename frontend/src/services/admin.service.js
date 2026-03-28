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

/* ADMIN SETTINGS — multipart: logo file + JSON-string contact/social (see backend parseToJson) */
function buildSettingsFormData({ contact, social, logoFile }) {
  const formData = new FormData();
  if (contact && Object.keys(contact).length > 0) {
    formData.append("contact", JSON.stringify(contact));
  }
  if (social && Object.keys(social).length > 0) {
    formData.append("social", JSON.stringify(social));
  }
  if (logoFile instanceof File) {
    formData.append("logo", logoFile);
  }
  return formData;
}

/** @param {FormData | { contact?: object, social?: object, logoFile?: File }} payload */
export const updateSettings = (payload) => {
  const formData =
    typeof FormData !== "undefined" && payload instanceof FormData
      ? payload
      : buildSettingsFormData(payload);
  return api.put("/admin/settings", formData);
};