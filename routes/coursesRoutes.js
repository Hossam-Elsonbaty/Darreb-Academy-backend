import express from "express";
import { getAllCourses,createCourse,deleteCourse } from "../controllers/course.controller.js"; 
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllCourses);
router.post("/create-course",protect, createCourse);
router.delete("/:id", protect, deleteCourse);

export default router;
