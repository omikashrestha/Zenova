import express from "express";
import auth from "../middleware/auth.js";
import { saveEmotion, saveJournal, getJournals, getEmotions } from "../controllers/mindController.js";

const router = express.Router();

router.post("/emotion", auth, saveEmotion);
router.get("/emotion", auth, getEmotions);
router.post("/journal", auth, saveJournal);
router.get("/journals", auth, getJournals);

export default router;
