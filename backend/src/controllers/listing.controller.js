import Listing from "../models/listing.model.js";
import { geocodeAddress } from "../utils/geocode.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "../config/cloudinary.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/response.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";


// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createListing = async (req, res) => {
  // console.log("🚀 CREATE LISTING CALLED - Body keys:", Object.keys(req.body));
  // console.log("🚀 Files present:", req.files ? Object.keys(req.files) : "NO FILES");
  
  try {
    const {
      itemName,
      category,
      description,
      pickupLocation,
      hourlyRate,
      dailyRate,
      weeklyRate,
      isAvailable,
      offerDelivery,
      deliveryFee,
      features,
      rentalRules,
    } = req.body;

    // Validate that at least 3 photos are uploaded
    if (!req.files || !req.files.photos || req.files.photos.length < 3) {
      return errorResponse(res, 400, "At least 3 photos are required");
    }

    // Parallel Uploads for Photos
    const photoUploadPromises = req.files.photos.map(async (photo, index) => {
      const uniqueId = `${Date.now()}-${index}-${Math.random().toString(36).substring(7)}`;
      const tempPath = path.join(
        __dirname,
        "../../temp",
        `${uniqueId}-${photo.originalname}`
      );
      await fs.mkdir(path.dirname(tempPath), { recursive: true });
      await fs.writeFile(tempPath, photo.buffer);

      const result = await uploadToCloudinary(
        tempPath,
        "rental-items/photos",
        "image"
      );
      
      // Clean up temp file
      try {
        await fs.unlink(tempPath);
      } catch (err) {
        console.warn("Failed to delete temp file:", tempPath, err.message);
      }
      
      return result;
    });

    // Parallel Uploads for Videos
    const videoUploadPromises = (req.files.videos || []).map(async (video, index) => {
      const uniqueId = `${Date.now()}-${index}-${Math.random().toString(36).substring(7)}`;
      const tempPath = path.join(
        __dirname,
        "../../temp",
        `${uniqueId}-${video.originalname}`
      );
      await fs.mkdir(path.dirname(tempPath), { recursive: true });
      await fs.writeFile(tempPath, video.buffer);

      const result = await uploadToCloudinary(
        tempPath,
        "rental-items/videos",
        "video"
      );
      
      // Clean up temp file
      try {
        await fs.unlink(tempPath);
      } catch (err) {
        console.warn("Failed to delete temp file:", tempPath, err.message);
      }
      
      return result;
    });

    // Geocoding (safe & non-blocking)
let coordinates;
try {
  if (pickupLocation) {
    const geo = await geocodeAddress(pickupLocation);

    if (geo) {
      coordinates = {
        type: "Point",
        coordinates: [geo.longitude, geo.latitude],
        formattedAddress: geo.formattedAddress,
      };
      console.log("✅ Geocoding successful:", coordinates);
    } else {
      console.log("⚠️ Geocoding returned no result");
    }
  }
} catch (err) {
  console.warn("⚠️ Geocoding failed:", err.message);
}

    // Provide immediate feedback to user by awaiting all parallel tasks
    const [uploadedPhotos, uploadedVideos] = await Promise.all([
      Promise.all(photoUploadPromises),
      Promise.all(videoUploadPromises),
    ]);

    // Create listing object
    const listingData = {
      itemName,
      category,
      description,
      pickupLocation,
      dailyRate,
      photos: uploadedPhotos,
      videos: uploadedVideos,
      isAvailable: isAvailable === "true" || isAvailable === true,
      offerDelivery: offerDelivery === "true" || offerDelivery === true,
      features: features ? (Array.isArray(features) ? features : [features]) : [],
      rentalRules: rentalRules ? (Array.isArray(rentalRules) ? rentalRules : [rentalRules]) : [],
    };

    // Only add coordinates if geocoding was successful
    if (coordinates) {
      listingData.coordinates = coordinates;
    }

    if (hourlyRate) listingData.hourlyRate = hourlyRate;
    if (weeklyRate) listingData.weeklyRate = weeklyRate;
    if (deliveryFee) listingData.deliveryFee = deliveryFee;

    const listing = await Listing.create({
      ...listingData,
      rating: 0,
      status: "active",
      views: 0,
      bookings: 0,
      reviewCount: 0,
    });

    return successResponse(res, 201, "Listing created successfully", listing);
  } catch (error) {
    console.error("Create listing error (FULL):", JSON.stringify(error, null, 2));
    return errorResponse(
      res, 
      500, 
      "Failed to create listing", 
      error.errors || error.message
    );
  }
};

export const getAllListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      isAvailable,
      offerDelivery,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";
    if (offerDelivery !== undefined)
      query.offerDelivery = offerDelivery === "true";

    // Price range filter
    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Execute query
    const [listings, totalCount] = await Promise.all([
      Listing.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Listing.countDocuments(query),
    ]);

    // Pagination info
    const totalPages = Math.ceil(totalCount / Number(limit));
    const pagination = {
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalItems: totalCount,
      hasNextPage: Number(page) < totalPages,
      hasPrevPage: Number(page) > 1,
    };

    return paginatedResponse(
      res,
      200,
      "Listings retrieved successfully",
      listings,
      pagination,
    );
  } catch (error) {
    console.error("Get listings error:", error);
    return errorResponse(
      res,
      500,
      "Failed to retrieve listings",
      error.message,
    );
  }
};

/**
 * @desc    Get single listing by ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    // Increment view count
    await listing.incrementViews();

    return successResponse(res, 200, "Listing retrieved successfully", listing);
  } catch (error) {
    console.error("Get listing error:", error);
    return errorResponse(res, 500, "Failed to retrieve listing", error.message);
  }
};

/**
 * @desc    Update listing
 * @route   PUT /api/listings/:id
 * @access  Public (will be Private after auth - only owner)
 */
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find existing listing
    const listing = await Listing.findById(id);
    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    // Handle new photo uploads
    if (req.files && req.files.photos && req.files.photos.length > 0) {
      const uploadedPhotos = [];

      for (const photo of req.files.photos) {
        const tempPath = path.join(
          __dirname,
          "../../temp",
          `${Date.now()}-${photo.originalname}`,
        );
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        await fs.writeFile(tempPath, photo.buffer);

        const uploadResult = await uploadToCloudinary(
          tempPath,
          "rental-items/photos",
          "image",
        );
        uploadedPhotos.push(uploadResult);

        await fs.unlink(tempPath);
      }

      // Add new photos to existing ones
      updateData.photos = [...listing.photos, ...uploadedPhotos];
    }

    // Handle new video uploads
    if (req.files && req.files.videos && req.files.videos.length > 0) {
      const uploadedVideos = [];

      for (const video of req.files.videos) {
        const tempPath = path.join(
          __dirname,
          "../../temp",
          `${Date.now()}-${video.originalname}`,
        );
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        await fs.writeFile(tempPath, video.buffer);

        const uploadResult = await uploadToCloudinary(
          tempPath,
          "rental-items/videos",
          "video",
        );
        uploadedVideos.push(uploadResult);

        await fs.unlink(tempPath);
      }

      updateData.videos = [...listing.videos, ...uploadedVideos];
    }

    // Convert string booleans to actual booleans
    if (updateData.isAvailable !== undefined) {
      updateData.isAvailable =
        updateData.isAvailable === "true" || updateData.isAvailable === true;
    }
    if (updateData.offerDelivery !== undefined) {
      updateData.offerDelivery =
        updateData.offerDelivery === "true" ||
        updateData.offerDelivery === true;
    }

    // Update listing
    const updatedListing = await Listing.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return successResponse(
      res,
      200,
      "Listing updated successfully",
      updatedListing,
    );
  } catch (error) {
    console.error("Update listing error:", error);
    return errorResponse(res, 500, "Failed to update listing", error.message);
  }
};

/**
 * @desc    Delete listing
 * @route   DELETE /api/listings/:id
 * @access  Public (will be Private after auth - only owner)
 */
export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    // Delete photos from Cloudinary
    if (listing.photos && listing.photos.length > 0) {
      const photoIds = listing.photos.map((photo) => photo.public_id);
      await deleteMultipleFromCloudinary(photoIds, "image");
    }

    // Delete videos from Cloudinary
    if (listing.videos && listing.videos.length > 0) {
      const videoIds = listing.videos.map((video) => video.public_id);
      await deleteMultipleFromCloudinary(videoIds, "video");
    }

    // Delete listing from database
    await Listing.findByIdAndDelete(id);

    return successResponse(res, 200, "Listing deleted successfully");
  } catch (error) {
    console.error("Delete listing error:", error);
    return errorResponse(res, 500, "Failed to delete listing", error.message);
  }
};

/**
 * @desc    Delete specific photo from listing
 * @route   DELETE /api/listings/:id/photos/:publicId
 * @access  Public (will be Private after auth - only owner)
 */
export const deletePhoto = async (req, res) => {
  try {
    const { id, publicId } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    // Find and remove photo
    const photoIndex = listing.photos.findIndex(
      (p) => p.public_id === publicId,
    );
    if (photoIndex === -1) {
      return errorResponse(res, 404, "Photo not found");
    }

    // Check if removing this photo will leave less than 3 photos
    if (listing.photos.length <= 3) {
      return errorResponse(
        res,
        400,
        "Cannot delete photo. Minimum 3 photos required",
      );
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId, "image");

    // Remove from array
    listing.photos.splice(photoIndex, 1);
    await listing.save();

    return successResponse(res, 200, "Photo deleted successfully", listing);
  } catch (error) {
    console.error("Delete photo error:", error);
    return errorResponse(res, 500, "Failed to delete photo", error.message);
  }
};

/**
 * @desc    Delete specific video from listing
 * @route   DELETE /api/listings/:id/videos/:publicId
 * @access  Public (will be Private after auth - only owner)
 */
export const deleteVideo = async (req, res) => {
  try {
    const { id, publicId } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    // Find and remove video
    const videoIndex = listing.videos.findIndex(
      (v) => v.public_id === publicId,
    );
    if (videoIndex === -1) {
      return errorResponse(res, 404, "Video not found");
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId, "video");

    // Remove from array
    listing.videos.splice(videoIndex, 1);
    await listing.save();

    return successResponse(res, 200, "Video deleted successfully", listing);
  } catch (error) {
    console.error("Delete video error:", error);
    return errorResponse(res, 500, "Failed to delete video", error.message);
  }
};

/**
 * @desc    Get listings by category
 * @route   GET /api/listings/category/:category
 * @access  Public
 */
export const getListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, totalCount] = await Promise.all([
      Listing.find({ category, isAvailable: true, status: "active" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Listing.countDocuments({ category, isAvailable: true, status: "active" }),
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));
    const pagination = {
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalItems: totalCount,
      hasNextPage: Number(page) < totalPages,
      hasPrevPage: Number(page) > 1,
    };

    return paginatedResponse(
      res,
      200,
      "Listings retrieved successfully",
      listings,
      pagination,
    );
  } catch (error) {
    console.error("Get listings by category error:", error);
    return errorResponse(
      res,
      500,
      "Failed to retrieve listings",
      error.message,
    );
  }
};
