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

/* GET ALL LISTINGS (optional: { location } for location-based search) */
export const getListings = (params = {}) => {
  const query = new URLSearchParams();
  if (params.location && String(params.location).trim()) {
    query.set("location", String(params.location).trim());
  }
  const qs = query.toString();
  return api.get(qs ? `/listings?${qs}` : "/listings");
};

/* GET FEATURED LISTINGS (optional: { location } for location-based search) */
export const getFeaturedListings = (params = {}) => {
  const query = new URLSearchParams();
  if (params.location && String(params.location).trim()) {
    query.set("location", String(params.location).trim());
  }
  const qs = query.toString();
  return api.get(qs ? `/listings/featured?${qs}` : "/listings/featured");
};

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
