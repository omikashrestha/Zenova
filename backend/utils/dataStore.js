import fs from "fs";

const DB = "./zenova-db.json";

const seed = {
  users: [],
  checkins: [],
  physical: [],
  mental: [],
  emotional: [],
  sleep: [],
  calm: [],
  emotions: [],
  journals: [],
};

export const readDB = () => {
  let data = structuredClone(seed);
  if (fs.existsSync(DB)) {
    try {
      const existing = JSON.parse(fs.readFileSync(DB, "utf8"));
      data = { ...data, ...existing };
    } catch (e) {
      console.error("Error reading DB, using seed", e);
    }
  }
  return data;
};

export const writeDB = (db) => {
  fs.writeFileSync(DB, JSON.stringify(db, null, 2));
};

export const today = () => new Date().toISOString().slice(0, 10);

export const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const now = () => new Date().toISOString();
