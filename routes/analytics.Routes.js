// routes/analytics.routes.js
import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/analytics",authorize("admin"), getAnalytics);

export default router;
