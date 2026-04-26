import express from "express";
import auth from "../middleware/auth.js";
import { getProfile, saveOnboarding, getProfileSummary, updatePreferences } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.get("/profile-summary", auth, getProfileSummary);
router.put("/onboarding", auth, saveOnboarding);
router.put("/preferences", auth, updatePreferences);

export default router;

