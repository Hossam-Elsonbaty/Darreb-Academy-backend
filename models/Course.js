import { Schema } from "mongoose";
import mongoose from "mongoose";

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    title_ar: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    description_ar: { type: String, required: true },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    thumbnail: { type: String, required: true },
    chapters: [
      {
        chapter: { type: Schema.Types.ObjectId, ref: "Chapter" },
        order: { type: Number, default: 0 },
      },
    ],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },
    duration: { type: Number },
    isPublished: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    totalEnrollments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
