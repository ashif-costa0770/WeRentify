import express from "express";
import {
    handleMulterError,
    uploadLogo,
  } from "../../middlewares/upload.middleware.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

import { getSettings, updateSettings } from "../../controllers/admin/settings.controller.js";
import validate from "../../middlewares/validate.js";
import { updateSettingsSchema } from "../../validations/admin.validation.js";
import { parseToJson } from "../../middlewares/parseToJson.js";
  const router = express.Router();


  router.get("/", verifyAdmin, getSettings);
  router.put("/", verifyAdmin, uploadLogo, handleMulterError, parseToJson, validate(updateSettingsSchema), updateSettings);

  export default router;