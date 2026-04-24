import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { readDB, writeDB, now } from "../utils/dataStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "zenova_demo_secret";

const makeToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  ageGroup: user.ageGroup,
  occupation: user.occupation,
  onboardingComplete: Boolean(user.onboardingComplete),
  createdAt: user.createdAt,
});

export async function signup(req, res) {
  const db = readDB();
  let { name, email, password } = req.body;

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "Invalid input" });
  }

  email = email.toLowerCase();

  if (db.users.some((user) => user.email === email)) {
    return res.status(409).json({ message: "This email is already in use." });
  }

  const user = {
    id: randomUUID(),
    name,
    email,
    password: await bcrypt.hash(password, 10),
    onboardingComplete: false,
    createdAt: now(),
  };

  db.users.push(user);
  writeDB(db);

  return res.json({
    token: makeToken(user),
    user: publicUser(user),
  });
}

export async function login(req, res) {
  const db = readDB();
  let { email, password } = req.body;

  const user = db.users.find(
    (x) => x.email === (email || "").toLowerCase()
  );

  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  return res.json({
    token: makeToken(user),
    user: publicUser(user),
  });
}

export { publicUser };