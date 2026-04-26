import express from "express";
import auth from "../middleware/auth.js";
import {
  savePhysical,
  saveMental,
  saveEmotional,
  saveSleep,
  saveCalm,
} from "../controllers/coachController.js";

const router = express.Router();

router.post("/physical", auth, savePhysical);
router.post("/mental", auth, saveMental);
router.post("/emotional", auth, saveEmotional);
router.post("/sleep", auth, saveSleep);
router.post("/calm", auth, saveCalm);

export default router;