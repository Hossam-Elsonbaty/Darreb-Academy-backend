import express from "express";
import { handlePayment } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

router.post("/create-checkout-session",protect,handlePayment)
export default router;