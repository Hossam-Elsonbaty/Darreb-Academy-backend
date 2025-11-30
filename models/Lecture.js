import { Schema } from "mongoose";
import mongoose from "mongoose";

const lectureSchema = new Schema(
  {
    title: { type: String, required: true },
    title_ar: { type: String, required: true },
    videoUrl: { type: String },
    duration: { type: Number },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Lecture", lectureSchema);
