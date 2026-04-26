import { randomUUID } from "crypto";
import { writeDB, today, now } from "../utils/dataStore.js";
import { upsert } from "../utils/wellnessEngine.js";

const saveKey = (key) => (req, res) => {
  const doc = upsert(
    req.db[key],
    { userId: req.user.id, date: today() },
    req.body,
    now,
    randomUUID
  );

  writeDB(req.db);

  return res.json({ data: doc });
};

export const savePhysical = saveKey("physical");
export const saveMental = saveKey("mental");
export const saveEmotional = saveKey("emotional");
export const saveSleep = saveKey("sleep");
export const saveCalm = saveKey("calm");