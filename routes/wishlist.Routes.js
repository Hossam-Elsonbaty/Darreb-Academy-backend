import express from"express";
const router = express.Router();
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from"../controllers/wishlist.controller.js";
import { protect } from"../middleware/auth.js";

router.get("/", protect, getWishlist);
router.post("/", protect, addToWishlist);
router.delete("/:courseId", protect, removeFromWishlist);

export default router;
