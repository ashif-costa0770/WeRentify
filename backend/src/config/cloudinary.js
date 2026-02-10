import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";


// 🔹 Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer (from multer memoryStorage)
 * @param {String} folder - Cloudinary folder name
 * @param {String} resourceType - image | video
 */
export const uploadBufferToCloudinary = (
  buffer,
  folder = "rental-items",
  resourceType = "image"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation:
          resourceType === "image"
            ? [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }]
            : undefined,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new Error("Failed to upload file to Cloudinary"));
        }

        resolve({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete single file from Cloudinary
 */
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};

/**
 * Delete multiple files from Cloudinary
 */
export const deleteMultipleFromCloudinary = async (
  publicIds,
  resourceType = "image"
) => {
  try {
    return await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary bulk delete error:", error);
    throw new Error("Failed to delete files from Cloudinary");
  }
};

export { cloudinary };