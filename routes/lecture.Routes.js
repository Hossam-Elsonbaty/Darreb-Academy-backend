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
router.post("/create-lecture", protect, authorize("admin", "instructor"), uploadVideo.single("video"), createLecture);
// router.get("/:id", getLectureById);
router.get("/:id", getAllLectures);
router.put("/:id", protect, authorize("admin", "instructor"), uploadVideo.single("video"), updateLecture);
router.delete("/:id", protect, authorize("admin", "instructor"), deleteLecture);

export default router;
