import express from "express";
import auth from "../middleware/auth.js";
import { getWeeklyInsights } from "../controllers/insightsController.js";

const router = express.Router();

router.get("/weekly", auth, getWeeklyInsights);

export default router;