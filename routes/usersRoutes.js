import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/users.controller.js";
const router = express.Router();

router.post("/create-user", protect, authorize("admin"),createUser);
router.get("/get-all-users", protect, authorize("admin"),getAllUsers);
router.get("/:id", protect, authorize("admin"),getUserById);
router.put("/update-user/:id", protect, authorize("admin"),updateUser)
router.delete("delete-user/:id", protect, authorize("admin"),deleteUser);

export default router;
