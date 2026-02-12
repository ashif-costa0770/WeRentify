import express from "express";
import { createCategory, deleteCategory, getAllCategory, getSingleCategory, updateCategory } from "../controllers/category.controller.js";
const router = express.Router();
import { protect, admin } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.js";
import {createCategorySchema, updateCategorySchema} from "../validations/category.validation.js"
import {
    uploadCategoryIcon,
    handleMulterError,
  } from "../middlewares/upload.middleware.js";

router.post("/",protect,uploadCategoryIcon, handleMulterError, validate(createCategorySchema), createCategory);
router.get("/", getAllCategory);
router.get("/:id", getSingleCategory);
router.put("/:id", protect,uploadCategoryIcon, handleMulterError,validate(createCategorySchema), updateCategory);
router.delete("/:id", protect,uploadCategoryIcon, handleMulterError, deleteCategory);

export default router;
