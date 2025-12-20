// routes/analytics.routes.js
import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/analytics", getAnalytics);

export default router;
