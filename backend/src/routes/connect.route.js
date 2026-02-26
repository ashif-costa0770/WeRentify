import express from "express";
import { createAccountLink, getConnectStatus } from "../controllers/connect.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/account-link", protect, createAccountLink);
router.get("/status", protect, getConnectStatus);

export default router;
