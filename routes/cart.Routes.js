import express from "express";
import { clearCart, removeFromCart,addToCart, getCart } from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

router.get("/",protect, getCart);
router.post("/",protect, addToCart);
router.delete("/:id",protect, removeFromCart);
router.delete("/",protect, clearCart);

export default router;
