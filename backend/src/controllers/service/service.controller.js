import Service from "../../models/service/service.model.js";
import stripe from "../../config/stripe.js";
import mongoose from "mongoose";
import { successResponse, errorResponse } from "../../utils/response.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "../../config/cloudinary.js";

const parseTimeToMinutes = (value) => {
  const [hours, minutes] = String(value || "")
    .split(":")
    .map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const buildHourlySlots = (startTime, endTime) => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || end <= start) return [];

  const slots = [];
  for (let cursor = start; cursor + 60 <= end; cursor += 60) {
    slots.push(formatMinutesToTime(cursor));
  }
  return slots;
};

//! Create Service
export const createService = async (req, res) => {
  try {
    if (req.user?.mode !== "host") {
      return errorResponse(res, 403, "Switch to host mode to add services");
    }
    //  📸 Validate Photos (Minimum 3 Required)
    if (!req.files?.photos || req.files.photos.length < 3) {
      return errorResponse(res, 400, "Minimum 3 photos are required");
    }

    if (req.files.photos.length > 6) {
      return errorResponse(res, 400, "Maximum 6 photos allowed");
    }

    // 📸 Upload Photos
    const photoUploadPromises = req.files.photos.map((photo) =>
      uploadBufferToCloudinary(photo.buffer, "services/photos", "image"),
    );

    const uploadedPhotos = await Promise.all(photoUploadPromises);

    // 🎥 Upload Videos (Optional)
    let uploadedVideos = [];
    const serviceId = new mongoose.Types.ObjectId();

    if (req.files?.videos) {
      // Limit max video
      if (req.files.videos.length > 2) {
        return errorResponse(res, 400, "Maximum 2 videos allowed");
      }

      const videoUploadPromises = req.files.videos.map((video) =>
        uploadBufferToCloudinary(video.buffer, "services/videos", "video"),
      );

      uploadedVideos = await Promise.all(videoUploadPromises);
    }

    // 1️⃣ Create Product in Stripe
    const product = await stripe.products.create({
      name: req.body.businessName,
      images: [uploadedPhotos[0].url],
      metadata: {
        serviceId: serviceId.toString(),
        providerId: req.user._id.toString(),
      },
    });

    // 2️⃣ Create Price in Stripe (amount in smallest unit)
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(Number(req.body.hourlyRate) * 100),
      currency: "usd",
    });

    const workingDays = Array.isArray(req.body.workingDays)
      ? req.body.workingDays
      : [];
    const hourlySlots = buildHourlySlots(req.body.startTime, req.body.endTime);

    const availableSlots = workingDays.map((day) => ({
      day,
      slots: hourlySlots,
    }));

    // 📝 Create Service
    const service = await Service.create({
      ...req.body,
      _id: serviceId.toString(),
      stripePriceId: stripePrice.id,
      stripeProductId: product.id,
      photos: uploadedPhotos,
      videos: uploadedVideos, // optional
      availableSlots,
      owner: req.user._id,
    });

    return successResponse(res, 201, "Service created successfully", {
      service,
    });
  } catch (error) {
    console.log("Error in creating service", error);
    return errorResponse(res, 500, "Failed to create service", error.message);
  }
};

//! Get all services
export const getAllServices = async (req, res) => {
  try {
    const { location } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 12, 1),
      50,
    );
    const skip = (page - 1) * limit;

    const query = { status: "active" };
    if (
      req.query.category &&
      mongoose.Types.ObjectId.isValid(req.query.category)
    ) {
      query.category = req.query.category;
    }

    const filter = {
      status: "active",
      isFeatured: { $ne: true },
    };

    // Add location filter if user searched
    if (location && location.trim() !== "") {
      filter.location = {
        $regex: location.trim(),
        $options: "i", // case-insensitive
      };
    }

    const [services, totalItems] = await Promise.all([
      Service.find(filter)
        .slice("photos", 1)
        .populate("owner", "firstname lastname avatar")
        .populate("category", "name icon")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(filter),
    ]);

    if (!services.length) {
      return errorResponse(res, 404, "No services found");
    }

    const payload = {
      services,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };

    return successResponse(
      res,
      200,
      "All Services fetched successfully",
      payload,
    );
  } catch (error) {
    console.log("Error in fetching all servies", error.message);
    return errorResponse(res, 500, "Failed to fetch services", error.message);
  }
};

//! Get all featured services
export const getAllFeaturedServices = async (req, res) => {
  try {

    const {location} = req.query;
    const filter = {
      isFeatured: true,
      featuredUntil: { $gt: new Date() },
      status: "active",
    }

    if(location && location.trim() !== ""){
      filter.location = {
        $regex: location.trim(), //enable partial matching
        $options: "i", //enable case-insensitive matching
      }
    }
    const services = await Service.find(filter)
      .populate("owner", "email firstname lastname avatar _id")
      .populate("category", "name")
      .sort({ featuredUntil: -1 })
      .lean();

      if (!services.length) {
        return errorResponse(res, 404, "No featured services found");
      }

    return successResponse(
      res,
      200,
      "Featured services fetched successfully",
      services,
    );
  } catch (error) {
    console.log("Error in fetching featured services", error.message);
    return errorResponse(
      res,
      500,
      "Failed to fetch featured services",
      error.message,
    );
  }
};

//! Get single service
export const getSingleService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .populate("owner", "firstname lastname avatar")
      .populate("category", "name icon")
      .lean();
    if (!service) {
      return errorResponse(res, 404, "No service found");
    }

    return successResponse(res, 200, "Service fetched successfully", {
      service,
    });
  } catch (error) {
    console.log("Error in fetching single servie", error.message);
    return errorResponse(res, 500, "Failed to fetch service", error.message);
  }
};

//! Get all listings by user
export const getServicesByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const services = await Service.find({
      owner: userId,
      status: "active",
    })
      .select(
        "businessName serviceType category owner location hourlyRate rating reviewCount views bookings plan serviceMode createdAt photos",
      )
      .slice("photos", 1)
      .populate("owner", "email firstname lastname avatar _id")
      .lean();

    if (services.length === 0) {
      return errorResponse(res, 404, "User has no services");
    }

    return successResponse(
      res,
      200,
      "User services fetched successfully",
      services,
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to retrieve user services",
      error.message,
    );
  }
};

//!Update service
export const updateService = async (req, res) => {
  try {
    if (req.user?.mode !== "host") {
      return errorResponse(res, 403, "Switch to host mode to update services");
    }
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }

    // 🔐 Only owner can update
    if (service.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized to update this service");
    }

    // 📸 HANDLE NEW PHOTOS (Optional)

    let updatedPhotos = [...service.photos];

    if (req.files?.photos) {
      if (req.files.photos.length + updatedPhotos.length > 6) {
        return errorResponse(res, 400, "Total photos cannot exceed 6");
      }

      const photoUploadPromises = req.files.photos.map((photo) =>
        uploadBufferToCloudinary(photo.buffer, "services/photos", "image"),
      );

      const newPhotos = await Promise.all(photoUploadPromises);

      updatedPhotos = [...updatedPhotos, ...newPhotos];
    }

    // ===============================
    // 🎥 HANDLE NEW VIDEOS (Optional)
    // ===============================

    let updatedVideos = [...service.videos];

    if (req.files?.videos) {
      if (req.files.videos.length + updatedVideos.length > 2) {
        return errorResponse(res, 400, "Total videos cannot exceed 2");
      }

      const videoUploadPromises = req.files.videos.map((video) =>
        uploadBufferToCloudinary(video.buffer, "services/videos", "video"),
      );

      const newVideos = await Promise.all(videoUploadPromises);

      updatedVideos = [...updatedVideos, ...newVideos];
    }
    //! if hourly rate is changing, create new stripe price
    if (
      req.body.hourlyRate !== undefined &&
      req.body.hourlyRate !== service.hourlyRate
    ) {
      const priceInSmallestUnit = Math.round(Number(req.body.hourlyRate) * 100);
      const stripePrice = await stripe.prices.create({
        product: service.stripeProductId,
        unit_amount: priceInSmallestUnit,
        currency: "usd",
      });
      service.stripePriceId = stripePrice.id;
      service.hourlyRate = req.body.hourlyRate;
    }

    //! if service name is changing, update service name in stripe
    if (
      req.body.businessName !== undefined &&
      req.body.businessName !== service.businessName
    ) {
      await stripe.products.update(service.stripeProductId, {
        name: req.body.businessName,
      });
      service.businessName = req.body.businessName;
    }
    //! if photos are changing, update photos in stripe
    if (updatedPhotos.length > 0) {
      await stripe.products.update(service.stripeProductId, {
        images: [updatedPhotos[0].url], // only one image sent to Stripe
      });
      service.photos = updatedPhotos;
    }

    // ===============================
    // 📝 UPDATE SERVICE DATA
    // ===============================

    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        ...req.body,
        photos: updatedPhotos,
        videos: updatedVideos,
      },
      { new: true, runValidators: true },
    );

    return successResponse(res, 200, "Service updated successfully", {
      service: updatedService,
    });
  } catch (error) {
    console.log("Error updating service:", error);
    return errorResponse(res, 500, "Failed to update service", error.message);
  }
};

//! Delete Service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }

    // 🔐 Only owner can delte
    if (service.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized to delete this service");
    }
    if (service.photos?.length) {
      await deleteMultipleFromCloudinary(
        service.photos.map((p) => p.public_id),
        "image",
      );
    }
    if (service.videos?.length) {
      await deleteMultipleFromCloudinary(
        service.videos.map((v) => v.public_id),
        "video",
      );
    }
    // we can't delete the stripe product if it has used
    //! deactivate stripe product
    if (service.stripeProductId) {
      await stripe.products.update(service.stripeProductId, {
        active: false,
      });
    }
    //! deactivate stripe price
    if (service.stripePriceId) {
      await stripe.prices.update(service.stripePriceId, {
        active: false,
      });
    }

    await Service.findByIdAndDelete(id);
    return successResponse(res, 200, "Service deleted successfully", {
      service,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete service", error.message);
  }
};



//! Delte phote from cloudinary + DB
export const deleteServicePhoto = async (req, res) => {
  try {
    const { id, publicId } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }

    // 🔐 Owner check
    if (service.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized to delete");
    }

    // 🔍 Check photo exists
    const photoExists = service.photos.find((p) => p.public_id === publicId);

    if (!photoExists) {
      return errorResponse(res, 404, "Photo not found");
    }

    // 🚫 Minimum 3 photos required
    if (service.photos.length <= 3) {
      return errorResponse(res, 400, "Minimum 3 photos required");
    }

    // ☁️ Delete from Cloudinary FIRST
    await deleteFromCloudinary(publicId, "image");

    // 🗑 Remove from DB
    service.photos = service.photos.filter((p) => p.public_id !== publicId);

    await service.save();

    return successResponse(res, 200, "Photo deleted successfully", service);
  } catch (error) {
    console.error("Delete photo error:", error);
    return errorResponse(res, 500, "Failed to delete photo", error.message);
  }
};

//! Delete video from coudinary + db
export const deleteServiceVideo = async (req, res) => {
  try {
    const { id, publicId } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }

    // 🔐 Owner authorization check
    if (service.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized");
    }

    // 🔍 Check if video exists
    const videoExists = service.videos.find((v) => v.public_id === publicId);

    if (!videoExists) {
      return errorResponse(res, 404, "Video not found");
    }

    // ☁️ Delete from Cloudinary FIRST
    await deleteFromCloudinary(publicId, "video");

    // 🗑 Remove from DB
    service.videos = service.videos.filter((v) => v.public_id !== publicId);

    await service.save();

    return successResponse(res, 200, "Video deleted successfully", service);
  } catch (error) {
    console.error("Delete service video error:", error);
    return errorResponse(res, 500, "Failed to delete video", error.message);
  }
};

//! Get location suggestions for services
export const getLocationSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return successResponse(res, 200, "No query provided", {
        locations: [],
      });
    }

    const search = q.trim();

    const locations = await Service.distinct("location", {  // distinct returns unique values only.
      location: { $regex: search, $options: "i" },
      status: "active"
    });

    return successResponse(res, 200, "Location suggestions fetched for services", {
      locations: locations.slice(0, 5),
    });

  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch location suggestions", error.message);
  }
};