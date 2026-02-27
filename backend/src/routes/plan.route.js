import express from "express";
import {
  createPlan,
  deactivatePlan,
  getAllPlans,
  updatePlan,
} from "../controllers/plan.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.js";
import { createPlanSchema, updatePlanSchema } from "../validations/plan.validation.js";

const router = express.Router();

// router.get("/", getPlans);
// router.get("/:id", getPlanById);

router.post("/", protect, validate(createPlanSchema), createPlan);
router.get("/", getAllPlans);
router.put("/:planId", protect, validate(updatePlanSchema), updatePlan);
router.patch("/:planId/deactivate", protect,  deactivatePlan);

export default router;
