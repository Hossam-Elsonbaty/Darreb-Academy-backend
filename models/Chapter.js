import { Schema } from "mongoose";
import mongoose from "mongoose";

const chapterSchema = new Schema(
  {
    title: { type: String, required: true },
    title_ar: { type: String, required: true },
    lectures: [
      {
        lecture: { type: Schema.Types.ObjectId, ref: "Lecture" },
        order: { type: Number, default: 0 },
      },
    ],
    duration: { type: Number },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Chapter", chapterSchema);
