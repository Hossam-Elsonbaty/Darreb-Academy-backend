import { Schema } from "mongoose";
import mongoose from "mongoose";

const orderSchema = new Schema(
  {
    orderId: { type: String, unique: true, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        course: { type: Schema.Types.ObjectId, ref: "Course" },
        title: String,
        price: Number,
      },
    ],
    paymentMethod: { type: String, default: "Stripe" },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
