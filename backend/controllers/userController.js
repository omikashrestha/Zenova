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

export function getProfileSummary(req, res) {
  const userId = req.user.id;
  const db = req.db;

  // Counts
  const counts = {
    checkins: db.checkins.filter(x => x.userId === userId).length,
    journals: db.journals.filter(x => x.userId === userId).length,
    calm: db.calm.filter(x => x.userId === userId).length,
    physical: db.physical.filter(x => x.userId === userId).length,
    water: db.physical.filter(x => x.userId === userId && x.hydration).length,
  };

  // Recent Activity (Last 10)
  // Collect all activities, tag them, sort by date/createdAt
  const activities = [
    ...db.checkins.filter(x => x.userId === userId).map(x => ({ type: 'Check-in', icon: 'Smile', time: x.updatedAt || x.createdAt, label: x.mood })),
    ...db.journals.filter(x => x.userId === userId).map(x => ({ type: 'Journal', icon: 'BookOpen', time: x.createdAt, label: x.title })),
    ...db.calm.filter(x => x.userId === userId).map(x => ({ type: 'Calm', icon: 'Wind', time: x.createdAt, label: 'Mindfulness session' })),
    ...db.physical.filter(x => x.userId === userId && x.movement).map(x => ({ type: 'Physical', icon: 'Dumbbell', time: x.updatedAt || x.createdAt, label: x.movement })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

  // Emotional Insight
  const lastEmotions = db.emotions.filter(x => x.userId === userId).slice(-5);
  let insight = "Continue checking in to see your emotional patterns.";
  if (lastEmotions.length > 0) {
    const dominant = lastEmotions.reduce((acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    }, {});
    const top = Object.keys(dominant).sort((a, b) => dominant[b] - dominant[a])[0];
    insight = `You've been feeling mostly ${top} lately. Reflecting on this can help you stay balanced.`;
  }

  // Journal Preview
  const journalPreview = db.journals
    .filter(x => x.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Consistency
  const daysActive = new Set([
    ...db.checkins.filter(x => x.userId === userId).map(x => (x.date || x.createdAt).slice(0, 10)),
    ...db.physical.filter(x => x.userId === userId).map(x => (x.date || x.createdAt).slice(0, 10)),
  ]).size;
  const consistencyMsg = daysActive > 0 
    ? `You've been active for ${daysActive} days! Every small step counts.`
    : "Start your first activity to begin your consistency journey.";

  return res.json({
    user: publicUser(req.user),
    counts,
    activities,
    insight,
    journalPreview,
    consistencyMsg
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

export function updatePreferences(req, res) {
  Object.assign(req.user, {
    preferences: {
      ...(req.user.preferences || {}),
      ...req.body
    }
  });

  writeDB(req.db);

  return res.json({
    user: publicUser(req.user),
  });
}