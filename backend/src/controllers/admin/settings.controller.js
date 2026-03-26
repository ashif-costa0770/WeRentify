import Settings from "../../models/admin/settings.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { uploadBufferToCloudinary } from "../../config/cloudinary.js";

export const createSettings = async (req, res) => {
  try {
    const { contact, social } = req.body;

    // 1. Check if settings already exist
    const existing = await Settings.findOne();

    if (existing) {
      return errorResponse(res, 400, "Settings already exist. Use update instead.");
    }

    // 2. Upload logo
    let logoData = null;
    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, "settings/logo", "image");
      logoData = {
        public_id: uploaded.public_id,
        url: uploaded.url,
      };
    }

    // 3. Create settings
    const settings = await Settings.create({
        contact: {
            phone: contact.phone ?? "",
            email: contact.email ?? "",
            address: contact.address ?? "",
        },
        social: {
            facebook: social.facebook ?? "",
            instagram: social.instagram ?? "",
            twitter: social.twitter ?? "",
            linkedin: social.linkedin ?? "",
        },
        logo: logoData,
    })

    return successResponse(res, 201, "Settings created successfully", settings);
  } catch (error) {
    return errorResponse(res, 500, "Failed to create settings", error.message);
  }
}