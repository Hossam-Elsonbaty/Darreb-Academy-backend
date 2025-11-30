import { Schema } from "mongoose";
import mongoose from "mongoose";
const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
      },
    ],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
