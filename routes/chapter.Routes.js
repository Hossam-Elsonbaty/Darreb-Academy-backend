import express from "express";
import { authorize, protect } from "../middleware/auth.js";
const router = express.Router();
import {
  getAllChapters,
  createChapter,
  getChapterById,
  updateChapter,
  deleteChapter,
  getCourseChapters,
} from '../controllers/chapters.controller.js'

router.post("/create-chapter", protect, authorize("instructor", "admin"), createChapter);
router.get("/:id", getChapterById);
router.get("/", getAllChapters);
router.get("/:courseId/chapters", getCourseChapters);
router.put("/:id", protect, authorize("instructor", "admin"), updateChapter);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteChapter);

export default router;
