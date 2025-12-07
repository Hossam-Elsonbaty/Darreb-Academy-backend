import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/users.controller.js";
const router = express.Router();

router.post("/create-user", createUser);
router.get("/get-all-users", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser)
router.delete("/:id", deleteUser);

export default router;
