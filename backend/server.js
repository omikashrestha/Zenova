import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import checkinRoutes from "./routes/checkin.js";
import insightsRoutes from "./routes/insights.js";
import coachRoutes from "./routes/coach.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Zenova API",
    status: "running",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/insights", insightsRoutes);

/**
 * New structured coach routes:
 * /api/coach/physical
 * /api/coach/mental
 * /api/coach/emotional
 */
app.use("/api/coach", coachRoutes);

/**
 * Backward compatibility for your existing frontend:
 * These keep old endpoints working:
 * /api/physical
 * /api/mental
 * /api/emotional
 */
app.use("/api/physical", (req, res, next) => {
  req.url = "/";
  coachRoutes(req, res, next);
});

app.use("/api/mental", (req, res, next) => {
  req.url = "/";
  coachRoutes(req, res, next);
});

app.use("/api/emotional", (req, res, next) => {
  req.url = "/";
  coachRoutes(req, res, next);
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Zenova API running on http://localhost:${PORT}`);
});