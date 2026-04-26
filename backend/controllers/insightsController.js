import { daysAgo, today } from "../utils/dataStore.js";

export function getWeeklyInsights(req, res) {
  const minDate = daysAgo(6);
  const userId = req.user.id;

  const checkins = req.db.checkins
    .filter((x) => x.userId === userId && x.date >= minDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const counts = {
    Good: 0,
    Neutral: 0,
    Stressed: 0,
  };

  checkins.forEach((entry) => {
    counts[entry.mood]++;
  });

  const total = checkins.length;

  let dominant = null;

  if (total) {
    dominant = ["Stressed", "Neutral", "Good"].sort(
      (a, b) => counts[b] - counts[a]
    )[0];
  }

  let summary = "No check-ins this week. Start your wellness journey today!";

  if (dominant === "Good") {
    summary = `You were mostly feeling good this week (${counts.Good} of ${total} check-ins). Keep it up! 🌟`;
  }

  if (dominant === "Neutral") {
    summary = `You had a balanced week — ${counts.Neutral} neutral days out of ${total}. Small improvements add up. 💪`;
  }

  if (dominant === "Stressed") {
    summary = `You were mostly stressed this week (${counts.Stressed} of ${total} check-ins). Remember to take regular breaks. 🌿`;
  }

  const getWeekly = (key) =>
    (req.db[key] || []).filter((x) => x.userId === userId && x.date >= minDate);

  const getToday = (key) =>
    (req.db[key] || []).find((x) => x.userId === userId && x.date === today()) || null;

  return res.json({
    counts,
    total,
    dominant,
    summary,
    history: checkins,
    physical: getWeekly("physical"),
    mental: getWeekly("mental"),
    emotional: getWeekly("emotional"),
    sleep: getWeekly("sleep"),
    today: {
      physical: getToday("physical"),
      mental: getToday("mental"),
      emotional: getToday("emotional"),
      sleep: getToday("sleep"),
      checkin: getToday("checkins"),
    },
  });
}