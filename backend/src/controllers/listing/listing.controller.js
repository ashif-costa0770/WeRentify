import Listing from "../../models/listing/listing.model.js";
import { geocodeAddress } from "../../utils/geocode.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "../../config/cloudinary.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../utils/response.js";

//! Helper: upload multiple files to Cloudinary
const uploadFiles = async (files = [], folder, resourceType) => {
  return Promise.all(
    files.map((file) =>
      uploadBufferToCloudinary(file.buffer, folder, resourceType),
    ),
  );
};

//! Create listing
export const createListing = async (req, res) => {
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

    // Require minimum 3 photos
    if (!req.files?.photos || req.files.photos.length < 3) {
      return errorResponse(res, 400, "At least 3 photos are required");
    }

    // Upload media in parallel
    const [photos, videos] = await Promise.all([
      uploadFiles(req.files.photos, "rental-items/photos", "image"),
      uploadFiles(req.files.videos || [], "rental-items/videos", "video"),
    ]);

    // Geocoding (safe)
    let coordinates;
    if (pickupLocation) {
      try {
        const geo = await geocodeAddress(pickupLocation);
        if (geo) {
          coordinates = {
            type: "Point",
            coordinates: [geo.longitude, geo.latitude],
            formattedAddress: geo.formattedAddress,
          };
        }
      } catch (err) {
        console.warn("Geocoding failed:", err.message);
      }
    }

    const listing = await Listing.create({
      itemName,
      category,
      description,
      pickupLocation,
      hourlyRate,
      dailyRate,
      weeklyRate,
      deliveryFee,
      photos,
      videos,
      coordinates,
      isAvailable: isAvailable === "true" || isAvailable === true,
      offerDelivery: offerDelivery === "true" || offerDelivery === true,
      features: Array.isArray(features) ? features : features ? [features] : [],
      rentalRules: Array.isArray(rentalRules)
        ? rentalRules
        : rentalRules
          ? [rentalRules]
          : [],
      owner: req.user._id,
      rating: 0,
      status: "active",
      views: 0,
      bookings: 0,
      reviewCount: 0,
    });

    return successResponse(res, 201, "Listing created successfully", listing);
  } catch (error) {
    console.error("Create listing error:", error);
    return errorResponse(res, 500, "Failed to create listing", error.message);
  }
};

//! Get all listings with filters
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

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Base query
    const query = {
      status: "active",
    };

    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";
    if (offerDelivery !== undefined)
      query.offerDelivery = offerDelivery === "true";

    // Price filter (dailyRate)
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

    const [listings, totalCount] = await Promise.all([
      Listing.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Listing.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    return paginatedResponse(
      res,
      200,
      "Listings retrieved successfully",
      listings,
      {
        page: Number(page),
        limit: Number(limit),
        totalPages,
        totalItems: totalCount,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
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

//! Get single listing by ID
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findOne({
      _id: id,
      status: "active",
    });

    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    // Increment views (non-blocking)
    Listing.findByIdAndUpdate(id, { $inc: { views: 1 } }).catch(() => {});

    return successResponse(res, 200, "Listing retrieved successfully", listing);
  } catch (error) {
    console.error("Get listing error:", error);
    return errorResponse(res, 500, "Failed to retrieve listing", error.message);
  }
};

//! Update listing
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    const updateData = { ...req.body };

    if (req.files?.photos?.length) {
      const newPhotos = await uploadFiles(
        req.files.photos,
        "rental-items/photos",
        "image",
      );
      updateData.photos = [...listing.photos, ...newPhotos];
    }

    if (req.files?.videos?.length) {
      const newVideos = await uploadFiles(
        req.files.videos,
        "rental-items/videos",
        "video",
      );
      updateData.videos = [...listing.videos, ...newVideos];
    }

    if (updateData.isAvailable !== undefined) {
      updateData.isAvailable =
        updateData.isAvailable === "true" || updateData.isAvailable === true;
    }

    if (updateData.offerDelivery !== undefined) {
      updateData.offerDelivery =
        updateData.offerDelivery === "true" ||
        updateData.offerDelivery === true;
    }

    const updated = await Listing.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, "Listing updated successfully", updated);
  } catch (error) {
    console.error("Update listing error:", error);
    return errorResponse(res, 500, "Failed to update listing", error.message);
  }
};

//! Delete listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return errorResponse(res, 404, "Listing not found");

    if (listing.photos?.length) {
      await deleteMultipleFromCloudinary(
        listing.photos.map((p) => p.public_id),
        "image",
      );
    }

    if (listing.videos?.length) {
      await deleteMultipleFromCloudinary(
        listing.videos.map((v) => v.public_id),
        "video",
      );
    }

    await listing.deleteOne();
    return successResponse(res, 200, "Listing deleted successfully");
  } catch (error) {
    console.error("Delete listing error:", error);
    return errorResponse(res, 500, "Failed to delete listing", error.message);
  }
};

//! Delete photo
export const deletePhoto = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) return errorResponse(res, 404, "Listing not found");
    if (listing.photos.length <= 3)
      return errorResponse(res, 400, "Minimum 3 photos required");

    listing.photos = listing.photos.filter((p) => p.public_id !== publicId);
    await deleteFromCloudinary(publicId, "image");
    await listing.save();

    return successResponse(res, 200, "Photo deleted successfully", listing);
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete photo", error.message);
  }
};

//! Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) return errorResponse(res, 404, "Listing not found");

    listing.videos = listing.videos.filter((v) => v.public_id !== publicId);
    await deleteFromCloudinary(publicId, "video");
    await listing.save();

    return successResponse(res, 200, "Video deleted successfully", listing);
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete video", error.message);
  }
};

//!   Get listings by category
export const getListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const {
      page = 1,
      limit = 12,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Base query
    const query = {
      category,
      isAvailable: true,
      status: "active",
    };

    // Optional search
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [listings, totalCount] = await Promise.all([
      Listing.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Listing.countDocuments(query),
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
