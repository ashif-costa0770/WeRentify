import express from "express";
const router = express.Router();
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  deletePhoto,
  deleteVideo,
  getListingsByCategory,
} from "../../controllers/listing/listing.controller.js";
import {
  uploadListingMedia,
  handleMulterError,
} from "../../middlewares/upload.middleware.js";
import {
  validateCreateListing,
  validateUpdateListing,
  validateListingId,
} from "../../middlewares/validation.middleware.js";

/**
 * @route   POST /api/listings
 * @desc    Create a new listing
 * @access  Public
 */
router.post(
  "/",
  uploadListingMedia,
  handleMulterError,
  validateCreateListing,
  createListing,
);

/**
 * @route   GET /api/listings
 * @desc    Get all listings with filters and pagination
 * @access  Public
 * @query   ?page=1&limit=12&category=tools&minPrice=10&maxPrice=100&search=drill
 */
router.get("/", getAllListings);

/**
 * @route   GET /api/listings/category/:category
 * @desc    Get listings by category
 * @access  Public
 */
router.get("/category/:category", getListingsByCategory);

/**
 * @route   GET /api/listings/:id
 * @desc    Get single listing by ID
 * @access  Public
 */
router.get("/:id", validateListingId, getListingById);

/**
 * @route   PUT /api/listings/:id
 * @desc    Update listing
 * @access  Public (will be Private - owner only)
 */
router.put(
  "/:id",
  validateListingId,
  uploadListingMedia,
  handleMulterError,
  validateUpdateListing,
  updateListing,
);

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete listing
 * @access  Public (will be Private - owner only)
 */
router.delete("/:id", validateListingId, deleteListing);

/**
 * @route   DELETE /api/listings/:id/photos/:publicId
 * @desc    Delete specific photo from listing
 * @access  Public (will be Private - owner only)
 */
router.delete("/:id/photos/:publicId", validateListingId, deletePhoto);

/**
 * @route   DELETE /api/listings/:id/videos/:publicId
 * @desc    Delete specific video from listing
 * @access  Public (will be Private - owner only)
 */
router.delete("/:id/videos/:publicId", validateListingId, deleteVideo);

export default router;
