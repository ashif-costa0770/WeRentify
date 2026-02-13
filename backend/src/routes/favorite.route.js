import express from "express";
const router = express.Router();
import { protect, admin } from "../middlewares/auth.middleware.js";
import { addToFavorites, getUserFavorites, removeFavorite } from "../controllers/favorite.controller.js";
import validate from "../middlewares/validate.js";
import { createFavoriteSchema } from "../validations/favorite.validation.js";


router.post("/",protect, validate(createFavoriteSchema), addToFavorites);
router.get("/",protect, getUserFavorites);
router.delete("/:favoriteId",protect, removeFavorite);

export default router;
