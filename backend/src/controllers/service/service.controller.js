import Service from "../../models/service/service.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import {  uploadBufferToCloudinary, deleteFromCloudinary} from "../../config/cloudinary.js";

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
    // 📝 Create Service
    const service = await Service.create({
      ...req.body,
      photos: uploadedPhotos,
      videos: uploadedVideos, // optional
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

//! Get all listings
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("owner", "name email")
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

//! Get single listings
export const getSingleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "owner",
      "name email",
    );

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
