import { Schema } from "mongoose";
import mongoose from "mongoose";

const trackSchema = new Schema(
  {
    name: { type: String, required: true },
    name_ar: { type: String },
    description: { type: String },
    description_ar: { type: String },
    courses: [
      {
        course: { type: Schema.Types.ObjectId, ref: "Course" },
        order: { type: Number, default: 0 },
      },
    ],
    thumbnail: { type: String },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Track", trackSchema);
