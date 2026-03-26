import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    contact: {
      phone: { type: String },
      email: { type: String },
      address: { type: String },
    },

    social: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
    },

    logo: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
