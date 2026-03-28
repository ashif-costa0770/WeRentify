import Settings from "../../models/admin/settings.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { deleteFromCloudinary, uploadBufferToCloudinary } from "../../config/cloudinary.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    if (!settings || settings.length === 0) {
      return errorResponse(res, 404, "Settings not found");
    }
    return successResponse(res, 200, "Settings fetched successfully", settings);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch settings", error.message);
    
  }
}

export const updateSettings = async (req, res) => {
  try {
    const { contact, social } = req.body;
    let updateData = {};
    let logo = null;

    // Contact
    if (contact) {
      if (contact.phone !== undefined)
        updateData["contact.phone"] = contact.phone;

      if (contact.email !== undefined)
        updateData["contact.email"] = contact.email;

      if (contact.address !== undefined)
        updateData["contact.address"] = contact.address;
    }
    //Social
    if (social) {
      if (social.facebook !== undefined)
        updateData["social.facebook"] = social.facebook;

      if (social.instagram !== undefined)
        updateData["social.instagram"] = social.instagram;

      if (social.twitter !== undefined)
        updateData["social.twitter"] = social.twitter;

      if (social.linkedin !== undefined)
        updateData["social.linkedin"] = social.linkedin;
    }

    if (req.file) {
      const existing = await Settings.find();
      const prev = existing?.[0];
      if (prev?.logo?.public_id) {
        await deleteFromCloudinary(prev.logo.public_id, "image");
      }
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "settings/logo",
        "image",
      );
      logo = {
        public_id: uploaded.public_id,
        url: uploaded.url,
      };
    }

    // Logo
    if (logo) {
      updateData["logo"] = logo;
    }

    const settings = await Settings.findOneAndUpdate(
      {}, // find all settings
      { $set: updateData },
      {
        new: true,
        upsert: true, // if no settings found, create a new one
      },
    );
    return successResponse(res, 200, "Settings updated successfully", settings);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update settings", error.message);
  }
};
