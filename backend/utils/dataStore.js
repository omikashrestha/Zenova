import fs from "fs";

const DB = "./zenova-db.json";

const seed = {
  users: [],
  checkins: [],
  physical: [],
  mental: [],
  emotional: [],
};

export const readDB = () => {
  if (fs.existsSync(DB)) {
    return JSON.parse(fs.readFileSync(DB, "utf8"));
  }

  return structuredClone(seed);
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
