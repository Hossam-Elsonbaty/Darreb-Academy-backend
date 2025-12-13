import { Schema } from "mongoose";
import mongoose from "mongoose";

const contactUsSchema = new Schema({
  name: String,
  email: String,
  message: String,
});
export default mongoose.model("ContactUs", contactUsSchema);