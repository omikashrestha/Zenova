import { randomUUID } from "crypto";
import { writeDB, today, now } from "../utils/dataStore.js";
import { weatherMap, upsert } from "../utils/wellnessEngine.js";

export function saveCheckin(req, res) {
  const mood = req.body.mood;

  if (!weatherMap[mood]) {
    return res.status(400).json({ message: "Invalid mood" });
  }

  const previous = req.db.checkins
    .filter((x) => x.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2);

  const recoveryMode =
    mood === "Stressed" &&
    previous.length === 2 &&
    previous.every((x) => x.mood === "Stressed");

  upsert(req.db.checkins, { userId: req.user.id, date: today() }, { mood }, now, randomUUID);
  upsert(req.db.emotional, { userId: req.user.id, date: today() }, { mood }, now, randomUUID);

  writeDB(req.db);

  return res.json({
    weather: weatherMap[mood],
    suggestion: weatherMap[mood].suggestion,
    recoveryMode,
  });
}

export function getHistory(req, res) {
  const history = req.db.checkins
    .filter((x) => x.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  return res.json({ history });
}