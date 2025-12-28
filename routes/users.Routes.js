import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { changeUserPassword, createUser, deleteUser, getAllUsers, getPurchasedCourseDetails, getUserById, updateUser, updateUserProfilePic } from "../controllers/users.controller.js";
import { getPurchasedCourses } from "../controllers/course.controller.js";
const router = express.Router();

router.post("/create-user", protect, authorize("admin"),createUser);
router.get("/get-all-users", protect, authorize("admin"),getAllUsers);
router.get("/:id", protect,getUserById);
router.put("/:id", protect,updateUser)
router.put("/update-pic/:id", protect,updateUserProfilePic)
router.put("/change-password/:id", protect,changeUserPassword)
router.delete("/:id", protect,deleteUser);
router.get("/purchased", protect,authorize("admin"), getPurchasedCourses);
router.get("/me/courses/:courseId", protect, getPurchasedCourseDetails);
export default router;
