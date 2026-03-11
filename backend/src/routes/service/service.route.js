import express from "express";
import {
  createService,
  deleteService,
  deleteServicePhoto,
  deleteServiceVideo,
  getAllServices,
  getAllFeaturedServices,
  getServicesByUser,
  getSingleService,
  updateService,
} from "../../controllers/service/service.controller.js";
const router = express.Router();
import {
  uploadListingMedia,
  handleMulterError,
} from "../../middlewares/upload.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { createServiceSchema, updateServiceSchema  } from "../../validations/service.validation.js";
import validate from "../../middlewares/validate.js";

router.post(
  "/",
  protect,
  uploadListingMedia,
  handleMulterError,
  validate(createServiceSchema),
  createService,
);

router.get("/", getAllServices);
router.get("/featured", getAllFeaturedServices);
router.get("/user", protect, getServicesByUser);
router.get("/:id", getSingleService);
router.put(
  "/:id",
  protect,
  uploadListingMedia,
  handleMulterError,
  validate(updateServiceSchema),
  updateService,
);
router.delete("/:id", protect, deleteService)

//Delete phots and video from cloudinary + db
router.delete("/:id/photos/:publicId(*)",
  protect,
  deleteServicePhoto
);

router.delete("/:id/videos/:publicId(*)",
  protect,
  deleteServiceVideo
);

export default router;
