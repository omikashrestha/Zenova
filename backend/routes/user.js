import express from "express";
import auth from "../middleware/auth.js";
import { getProfile, saveOnboarding } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.put("/onboarding", auth, saveOnboarding);

export default router;
