import { getCurrentLocation } from "../controllers/geocode.controller.js";
import express from "express";

const router = express.Router();

router.get("/reverse", getCurrentLocation);

export default router;