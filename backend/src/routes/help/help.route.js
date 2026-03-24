import express from "express";
import {
  createFaqItem,
  createHelpCategory,
  deleteFaqItem,
  deleteHelpCategory,
  getFaqsByCategorySlug,
  getHelpCategories,
  searchFaqs,
  updateFaqItem,
  updateHelpCategory,
} from "../../controllers/help/help.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";
import validate from "../../middlewares/validate.js";
import {
  createFaqItemSchema,
  createHelpCategorySchema,
  updateFaqItemSchema,
  updateHelpCategorySchema,
} from "../../validations/help.validation.js";

const router = express.Router();

router.get("/categories", getHelpCategories);
router.get("/categories/:slug/faqs", getFaqsByCategorySlug);
router.get("/search", searchFaqs);

router.post(
  "/categories",
  protect,
  verifyAdmin,
  validate(createHelpCategorySchema),
  createHelpCategory,
);
router.patch(
  "/categories/:id",
  protect,
  verifyAdmin,
  validate(updateHelpCategorySchema),
  updateHelpCategory,
);
router.delete("/categories/:id", protect, verifyAdmin, deleteHelpCategory);

router.post("/faqs", protect, verifyAdmin, validate(createFaqItemSchema), createFaqItem);
router.patch("/faqs/:id", protect, verifyAdmin, validate(updateFaqItemSchema), updateFaqItem);
router.delete("/faqs/:id", protect, verifyAdmin, deleteFaqItem);

export default router;
