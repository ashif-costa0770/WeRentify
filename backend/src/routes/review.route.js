import express from "express";

import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
// import validate from "../middlewares/validate.js";
// import { createReviewSchema } from "../validations/review.validation.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/", getAllReviews);
router.patch("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);
export default router;