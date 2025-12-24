import express from "express";
import { register, login, getProfile,getMyPurchasedCourses } from "../controllers/auth.controller.js"; 
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.get("/my-courses", protect,getMyPurchasedCourses);

export default router;
