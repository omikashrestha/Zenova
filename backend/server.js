import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import checkinRoutes from "./routes/checkin.js";
import insightsRoutes from "./routes/insights.js";
import coachRoutes from "./routes/coach.js";
import mindRoutes from "./routes/mind.js";
import auth from "./middleware/auth.js";
import { savePhysical, saveMental, saveEmotional, saveSleep, saveCalm } from "./controllers/coachController.js";

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
app.use("/api/coach", coachRoutes);
app.use("/api", mindRoutes);

// Backward compatibility legacy routes
app.post("/api/physical", auth, savePhysical);
app.post("/api/mental", auth, saveMental);
app.post("/api/emotional", auth, saveEmotional);
app.post("/api/sleep", auth, saveSleep);
app.post("/api/calm", auth, saveCalm);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Zenova API running on http://localhost:${PORT}`);
});