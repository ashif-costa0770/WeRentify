import api from "@/lib/api";

/* CREATE LISTING */
export const createListing = (fields = {}, media = {}) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          formData.append(key, item);
        }
      });
      return;
    }

    formData.append(key, value);
  });

  (media.photos || []).forEach((file) => {
    formData.append("photos", file);
  });

  (media.videos || []).forEach((file) => {
    formData.append("videos", file);
  });

  return api.post("/listings", formData);
};

/* GET ALL LISTINGS */
export const getListings = () => api.get("/listings");

/* GET FEATURED LISTINGS */
export const getFeaturedListings = () => api.get("/listings/featured");

// GET LISTINGS BY USER
export const getListingsByUser = () =>
  api.get("/listings/user");

/* GET SINGLE LISTING */
export const getListingById = (id) =>
  api.get(`/listings/${id}`);

/* UPDATE LISTING */
export const updateListing = (id, data) =>
  api.put(`/listings/${id}`, data);

/* DELETE LISTING */
export const deleteListing = (id) =>
  api.delete(`/listings/${id}`);

/* GET LISTINGS BY CATEGORY */
export const getListingsByCategory = (categoryId) =>
  api.get(`/listings/category/${categoryId}`);

/* DELETE LISTING PHOTO */
export const deleteListingPhoto = (id, publicId) =>
  api.delete(`/listings/${id}/photos/${publicId}`);

/* DELETE LISTING VIDEO */
export const deleteListingVideo = (id, publicId) =>
  api.delete(`/listings/${id}/videos/${publicId}`);
