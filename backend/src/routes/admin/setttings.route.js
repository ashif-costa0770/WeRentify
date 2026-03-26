import express from "express";
import {
    handleMulterError,
    uploadLogo,
  } from "../../middlewares/upload.middleware.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

import { createSettings } from "../../controllers/admin/settings.controller.js";

  const router = express.Router();

  router.post("/", verifyAdmin, uploadLogo, handleMulterError, createSettings);

  export default router;