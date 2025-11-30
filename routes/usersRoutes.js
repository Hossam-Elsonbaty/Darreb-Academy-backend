import express from "express";
import { deleteUser, getAllUses, getUserById, updateUser } from "../controllers/users.controller.js";
const router = express.Router();

router.get("/", getAllUses);
router.get("/:id", getUserById);
router.put("/:id", updateUser)
router.delete("/:id", deleteUser);

export default router;
