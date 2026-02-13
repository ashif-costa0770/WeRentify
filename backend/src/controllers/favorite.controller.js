import Favorite from "../models/favorite.model.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const addToFavorites = async (req, res) => {
  try {
    const { productId, productType } = req.body;
    const userId = req.user.id;

    const favorite = await Favorite.create({
      user: userId,
      productId,
      productType,
    });
    return successResponse(res, 200, "Product added to favorite", favorite);
  } catch (error) {
    console.log("Error in add to favorite", error.message);
    return errorResponse(res, 500, "add to favorite failed", error.message);
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ user: userId }).populate(
      "productId",
    );

    return successResponse(res, 200, "fetched user favorites", favorites);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const userId = req.user.id;

    const deleted = await Favorite.findOneAndDelete({
      _id: favoriteId,
      user: userId, // 🔐 ensure owner
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }
    return successResponse(res, 200, "Removed from favorites");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
