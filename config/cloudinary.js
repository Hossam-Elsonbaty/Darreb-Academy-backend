import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};
const uploadVideoToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        resource_type: "video",
        folder: "lectures"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
};
export{cloudinary,uploadToCloudinary,uploadVideoToCloudinary} 
