import express from "express";
import { createCategory } from "../controllers/category.controller.js";
const router = express.Router();
// import { protect } from "../../middlewares/auth.middleware.js";
// import validate from "../../middlewares/validate.js";

router.post("/", createCategory);

export default router;
