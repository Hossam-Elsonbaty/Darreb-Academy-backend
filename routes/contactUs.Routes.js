import express from "express";
import {
  getContactEmails,addContactEmail
} from "../controllers/contactUs.controller.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-email", protect, authorize("admin"), addContactEmail);
router.get("/", getContactEmails);

export default router;