import { Schema } from "mongoose";
import mongoose from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    name_ar: { type: String, required: true },
    description: { type: String },
    description_ar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
