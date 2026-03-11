import express from "express";
const router = express.Router();
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getListingsByCategory,
  deleteListingPhoto,
  deleteListingVideo,
  getListingByUser,
  getAllFeaturedListings,
} from "../../controllers/listing/listing.controller.js";
import {
  uploadListingMedia,
  handleMulterError,
} from "../../middlewares/upload.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  createListingSchema,
  ListingByIdSchema,
  updateListingSchema,
} from "../../validations/listing.validation.js";
import validate from "../../middlewares/validate.js";

router.post(
  "/",
  protect,
  uploadListingMedia,
  handleMulterError,
  validate(createListingSchema),
  createListing,
);
router.get("/", getAllListings);
router.get("/featured", getAllFeaturedListings);
router.get("/user", protect, getListingByUser);
router.get("/:id", getListingById);
router.put(
  "/:id",
  protect,
  uploadListingMedia,
  handleMulterError,
  validate(updateListingSchema),
  updateListing,
);
router.delete("/:id", deleteListing);

router.get("/category/:category", getListingsByCategory);
router.delete("/:id/photos/:publicId(*)", protect, deleteListingPhoto);
router.delete("/:id/videos/:publicId(*)", protect, deleteListingVideo);

export default router;
