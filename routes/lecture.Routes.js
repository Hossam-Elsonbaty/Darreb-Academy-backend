import express from "express";
import {
  createLecture,
  getLectureById,
  updateLecture,
  deleteLecture,
  getAllLectures,
} from "../controllers/lectures.controller.js";
import { uploadVideo } from "../middleware/videoUpload.js"; 
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.post("/create-lecture", protect, authorize("instructor"), uploadVideo.single("video"), createLecture);
// router.get("/:id", getLectureById);
router.get("/:chapterId", getAllLectures);
router.put("/:id", protect, authorize( "instructor"), uploadVideo.single("video"), updateLecture);
router.delete("/:id", protect, authorize( "instructor"), deleteLecture);

export default router;
