import express from "express";
import auth from "../middleware/auth.js";
import {
  savePhysical,
  saveMental,
  saveEmotional,
} from "../controllers/coachController.js";

const router = express.Router();

router.post("/physical", auth, savePhysical);
router.post("/mental", auth, saveMental);
router.post("/emotional", auth, saveEmotional);

export default router;