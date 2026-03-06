import Service from "../../models/service/service.model.js";
import stripe from "../../config/stripe.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "../../config/cloudinary.js";

const parseTimeToMinutes = (value) => {
  const [hours, minutes] = String(value || "").split(":").map(Number);
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
    const services = await Service.find({ status: "active" })
      .populate("owner")
      .populate("category")
      .sort({ createdAt: -1 });

    if (!services) {
      return errorResponse(res, 404, "No services found");
    }
    return successResponse(res, 200, "All Services fetched successfully", {
      services,
    });
  } catch (error) {
    console.log("Error in fetching all servies", error.message);
  }
};


//! Get single service
export const getSingleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("owner")
      .populate("category");
    if (!service) {
      return errorResponse(res, 404, "No service found");
    }
    return successResponse(res, 200, "Service fetched successfully", {
      service,
    });
  } catch (error) {
    console.log("Error in fetching single servie", error.message);
  }
};

//! Get all listings by user
export const getServicesByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const services = await Service.find({
      owner: userId,
      status: "active",
    }).populate("owner" , "email firstname lastname avatar _id");

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
    return errorResponse(res, 500, "Failed to retrieve user services", error.message);
  }
};

//!Update service
export const updateService = async (req, res) => {
  try {
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
