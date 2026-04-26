import { randomUUID } from "crypto";
import { writeDB, now } from "../utils/dataStore.js";

export function saveEmotion(req, res) {
  const doc = {
    id: randomUUID(),
    userId: req.user.id,
    ...req.body,
    createdAt: now(),
  };
  req.db.emotions.push(doc);
  writeDB(req.db);
  return res.json({ data: doc });
}

export function saveJournal(req, res) {
  const doc = {
    id: randomUUID(),
    userId: req.user.id,
    ...req.body,
    createdAt: now(),
  };
  req.db.journals.push(doc);
  writeDB(req.db);
  return res.json({ data: doc });
}

export function getJournals(req, res) {
  const history = req.db.journals
    .filter((x) => x.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ history });
}

export function getEmotions(req, res) {
  const history = req.db.emotions
    .filter((x) => x.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ history });
}
