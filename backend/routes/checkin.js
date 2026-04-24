import express from "express";
import auth from "../middleware/auth.js";
import { saveCheckin, getHistory } from "../controllers/checkinController.js";

const router = express.Router();

router.post("/", auth, saveCheckin);
router.get("/history", auth, getHistory);

export default router;