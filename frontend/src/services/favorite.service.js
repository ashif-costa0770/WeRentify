
import api from "@/lib/api";

// Add
export const addFavorite = (data) =>
  api.post("/favorites", data);

// Remove
export const removeFavorite = (favoriteId) =>
  api.delete(`/favorites/${favoriteId}`);

// Get All
export const getFavorites = () =>
  api.get("/favorites");