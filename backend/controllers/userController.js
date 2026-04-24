import { writeDB } from "../utils/dataStore.js";
import { publicUser } from "./authController.js";

export function getProfile(req, res) {
  return res.json({
    user: {
      ...publicUser(req.user),
      totalCheckins: req.db.checkins.filter(
        (x) => x.userId === req.user.id
      ).length,
      totalTrackedModules:
        req.db.physical.filter((x) => x.userId === req.user.id).length +
        req.db.mental.filter((x) => x.userId === req.user.id).length +
        req.db.emotional.filter((x) => x.userId === req.user.id).length,
    },
  });
}

export function saveOnboarding(req, res) {
  Object.assign(req.user, {
    ageGroup: req.body.ageGroup,
    occupation: req.body.occupation,
    onboardingComplete: true,
  });

  writeDB(req.db);

  return res.json({
    user: publicUser(req.user),
  });
}