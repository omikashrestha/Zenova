import jwt from "jsonwebtoken";
import { readDB } from "../utils/dataStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "zenova_demo_secret";

export default function auth(req, res, next) {
  try {
    const db = readDB();
    const token = (req.headers.authorization || "").replace("Bearer ", "");

    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.users.find((x) => x.id === payload.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    req.db = db;

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
