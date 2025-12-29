import express from "express";
import { getAllCourses,createCourse,deleteCourse,getCourse,updateCourse } from "../controllers/course.controller.js"; 
import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/imageUpload.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourse);
router.put("/:id",protect,authorize( "instructor"), updateCourse);
router.delete("/:id", protect, deleteCourse);
router.post('/create-course',protect,authorize( "instructor"), createCourse);
// router.post(
//   "/create-course",
//   protect,
//   authorize("admin", "instructor"),
//   upload.single("thumbnail"),
//   createCourse
// );


export default router;
