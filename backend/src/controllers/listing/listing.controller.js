import mongoose from "mongoose";
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
import User from "../../models/users/user.model.js";
import stripe from "../../config/stripe.js";

//! Create listing
export const createListing = async (req, res) => {
  try {
    const { pickupLocation } = req.body;

    if (!req.files?.photos || req.files.photos.length < 3) {
      return errorResponse(res, 400, "At least 3 photos are required");
    }
    if (req.files.photos.length > 6) {
      return errorResponse(res, 400, "Maximum 6 photos allowed");
    }

    // 📸 Upload Photos
    const photoUploadPromises = req.files.photos.map((photo) =>
      uploadBufferToCloudinary(photo.buffer, "items/photos", "image"),
    );

    const uploadedPhotos = await Promise.all(photoUploadPromises);

    // 🎥 Upload Videos (Optional)
    let uploadedVideos = [];
    const listingId = new mongoose.Types.ObjectId();

    if (req.files?.videos) {
      // Limit max video
      if (req.files.videos.length > 2) {
        return errorResponse(res, 400, "Maximum 2 videos allowed");
      }

      const videoUploadPromises = req.files.videos.map((video) =>
        uploadBufferToCloudinary(video.buffer, "items/videos", "video"),
      );

      uploadedVideos = await Promise.all(videoUploadPromises);
    }

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

    // 1️⃣ Create Product in Stripe
    const product = await stripe.products.create({
      name: req.body.itemName,
      images: [uploadedPhotos[0].url],
      metadata: {
        listingId: listingId.toString(),
        ownerId: req.user._id.toString(),
      },
    });

    // 2️⃣ Create Price in Stripe (amount in smallest unit)
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(Number(req.body.dailyRate) * 100),
      currency: "usd",
    });

    const listing = await Listing.create({
      ...req.body,
      _id: listingId.toString(),
      stripePriceId: stripePrice.id,
      stripeProductId: product.id,
      coordinates, // ✅ THIS is for storing calculated coordinates
      photos: uploadedPhotos,
      videos: uploadedVideos, // optional
      owner: req.user._id,
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
    const listings = await Listing.find({  isFeatured: { $ne: true }, status: "active" })
      .populate("owner","email firstname lastname avatar _id")
      .populate("category","name")
      .sort({ createdAt: -1 })
      .lean();

    if (!listings) {
      return errorResponse(res, 404, "No listings found");
    }
    return successResponse(res, 200, "All listings fetched successfully", {
      listings,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch listings", error.message);
  }
};

//! Get all featured listings
export const getAllFeaturedListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      isFeatured: true,
      featuredUntil: { $gt: new Date() },
      status: "active",
    })
      .populate("owner","email firstname lastname avatar _id")
      .populate("category","name")
      .sort({ createdAt: -1 })
      .lean();

    if (!listings) {
      return errorResponse(res, 404, "No featured listings found");
    }

    return successResponse(res, 200, "Featured listings fetched successfully", listings);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch featured listings", error.message);
  }
};

//! Get single listing by ID
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findOne({ _id: id, status: "active" })
      .populate("owner","email firstname lastname avatar _id")
      .populate("category","name")
      .lean();

    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    // Increment views (non-blocking)
    Listing.findByIdAndUpdate(id, { $inc: { views: 1 } }).catch(() => {});

    return successResponse(
      res,
      200,
      "Single Listing retrieved successfully",
      listing,
    );
  } catch (error) {
    return errorResponse(res, 500, "Failed to retrieve listing", error.message);
  }
};

//! Get all listings by user
export const getListingByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const listings = await Listing.find({
      owner: userId,
      status: "active",
    }).populate("owner", "email firstname lastname avatar _id").lean();

    if (listings.length === 0) {
      return errorResponse(res, 404, "User has no listings");
    }

    return successResponse(
      res,
      200,
      "User listings fetched successfully",
      listings,
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to retrieve user listings",
      error.message,
    );
  }
};

//! Update listing
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { pickupLocation, isAvailable, offerDelivery } = req.body;
    const listing = await Listing.findById(id);

    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }
    // 🔐 Only owner can update
    if (listing.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized to update this service");
    }

    // 📸 HANDLE NEW PHOTOS (Optional)
    let updatedPhotos = [...listing.photos];

    if (req.files?.photos) {
      if (req.files.photos.length + updatedPhotos.length > 6) {
        return errorResponse(res, 400, "Total photos cannot exceed 6");
      }

      const photoUploadPromises = req.files.photos.map((photo) =>
        uploadBufferToCloudinary(photo.buffer, "item/photos", "image"),
      );

      const newPhotos = await Promise.all(photoUploadPromises);
      updatedPhotos = [...updatedPhotos, ...newPhotos];
    }

    // 🎥 HANDLE NEW VIDEOS (Optional)
    let updatedVideos = [...listing.videos];

    if (req.files?.videos) {
      if (req.files.videos.length + updatedVideos.length > 2) {
        return errorResponse(res, 400, "Total videos cannot exceed 2");
      }

      const videoUploadPromises = req.files.videos.map((video) =>
        uploadBufferToCloudinary(video.buffer, "item/videos", "video"),
      );

      const newVideos = await Promise.all(videoUploadPromises);
      updatedVideos = [...updatedVideos, ...newVideos];
    }

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

    if (isAvailable !== undefined) {
      isAvailable = isAvailable === "true" || isAvailable === true;
    }
    if (offerDelivery !== undefined) {
      offerDelivery = offerDelivery === "true" || offerDelivery === true;
    }

     //! if hourly rate is changing, create new stripe price
     if (req.body.hourlyRate !== undefined && req.body.hourlyRate !== listing.hourlyRate){
      const priceInSmallestUnit = Math.round(Number(req.body.hourlyRate)*100);
      const stripePrice = await stripe.prices.create({
        product: listing.stripeProductId,
        unit_amount: priceInSmallestUnit,        
        currency: "usd",
      });
      listing.stripePriceId = stripePrice.id;
      listing.hourlyRate = req.body.hourlyRate;
    }

    
    //! if item name is changing, update item name in stripe
    if (req.body.itemName !== undefined && req.body.itemName !== listing.itemName){
      await stripe.products.update(listing.stripeProductId, {
        name: req.body.itemName,
      });
      listing.itemName = req.body.itemName;
    }
    //! if photos are changing, update photos in stripe
    if (updatedPhotos.length > 0) {
      await stripe.products.update(listing.stripeProductId, {
        images: [updatedPhotos[0].url], // only one image sent to Stripe
      });
      listing.photos = updatedPhotos;
    }

    const updated = await Listing.findByIdAndUpdate(
      id,
      {
        ...req.body,
        isAvailable,
        offerDelivery,
        coordinates,
        photos: updatedPhotos,
        videos: updatedVideos,
      },
      { new: true, runValidators: true },
    );
    return successResponse(res, 200, "Listing updated successfully", updated);
  } catch (error) {
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
    //! deactivate stripe product
    if(listing.stripeProductId){
      await stripe.products.update(listing.stripeProductId, {
        active: false
      })
    }
    //! deactivate stripe price
    if(listing.stripePriceId){
      await stripe.prices.update(listing.stripePriceId, {
        active: false
      })
    }
    await Listing.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, "Listing deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete listing", error.message);
  }
};

//! Delte phote from cloudinary + DB
export const deleteListingPhoto = async (req, res) => {
  try {
    const { id, publicId } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return errorResponse(res, 404, "listing not found");
    }

    // 🔐 Owner check
    if (listing.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized to delete");
    }

    // 🔍 Check photo exists
    const photoExists = listing.photos.find((p) => p.public_id === publicId);

    if (!photoExists) {
      return errorResponse(res, 404, "Photo not found");
    }

    // 🚫 Minimum 3 photos required
    if (listing.photos.length <= 3) {
      return errorResponse(res, 400, "Minimum 3 photos required");
    }

    // ☁️ Delete from Cloudinary FIRST
    await deleteFromCloudinary(publicId, "image");

    // 🗑 Remove from DB
    listing.photos = listing.photos.filter((p) => p.public_id !== publicId);

    await listing.save();

    return successResponse(res, 200, "Photo deleted successfully", listing);
  } catch (error) {
    console.error("Delete photo error:", error);
    return errorResponse(res, 500, "Failed to delete photo", error.message);
  }
};

//! Delete video from coudinary + db
export const deleteListingVideo = async (req, res) => {
  try {
    const { id, publicId } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return errorResponse(res, 404, "listing not found");
    }

    // 🔐 Owner authorization check
    if (listing.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized");
    }

    // 🔍 Check if video exists
    const videoExists = listing.videos.find((v) => v.public_id === publicId);

    if (!videoExists) {
      return errorResponse(res, 404, "Video not found");
    }

    // ☁️ Delete from Cloudinary FIRST
    await deleteFromCloudinary(publicId, "video");

    // 🗑 Remove from DB
    listing.videos = listing.videos.filter((v) => v.public_id !== publicId);

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
