import express from "express" ;
const router = express.Router();
import {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
} from"../controllers/review.controller.js";
import { protect } from "../middleware/auth.js";

router.post("/", protect, createReview);
router.get("/course/:courseId", getCourseReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
