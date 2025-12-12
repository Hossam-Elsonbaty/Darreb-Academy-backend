// // middlewares/upload.js
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "courses",
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//   },
// });

// export const upload = multer({ storage });
import multer from "multer";
const storage = multer.memoryStorage(); // Store file in memory
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max size 2MB
  fileFilter: fileFilter
});
export {upload}
