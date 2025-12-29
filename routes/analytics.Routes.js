// routes/analytics.routes.js
import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/analytics",protect,authorize("admin"), getAnalytics);

export default router;
