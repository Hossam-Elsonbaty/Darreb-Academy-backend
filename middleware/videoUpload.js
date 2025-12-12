import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "video/mkv", "video/mov"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid video type"), false);
  }
};

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // Max 500MB
  fileFilter,
});
