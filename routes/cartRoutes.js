import express from "express";
import { clearCart, removeFromCart } from "../controllers/cart.controller.js";
const router = express.Router();

router.delete("/:id", removeFromCart);
router.delete("/", clearCart);

export default router;
