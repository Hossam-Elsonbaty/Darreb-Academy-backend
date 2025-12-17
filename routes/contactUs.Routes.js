import express from "express";
import {
  getContactEmails,addContactEmail,sendEmail
} from "../controllers/contactUs.controller.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-email",addContactEmail);
router.post("/send-email",protect, authorize("admin"), sendEmail);
router.get("/", getContactEmails);

export default router;