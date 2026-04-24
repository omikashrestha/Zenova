export const weatherMap = {
  Good: {
    emoji: "☀️",
    label: "Sunny",
    description: "Your wellness sky is clear and bright!",
    suggestion: "Maintain your routine — you are doing great. Keep the momentum going.",
  },
  Neutral: {
    emoji: "⛅",
    label: "Cloudy",
    description: "A little overcast, but light is breaking through.",
    suggestion: "Try improving your routine — take a short walk or drink some water.",
  },
  Stressed: {
    emoji: "🌩️",
    label: "Stormy",
    description: "Rough weather inside. Let's find calm together.",
    suggestion: "Take a short break or try a breathing exercise: inhale for 4 seconds, exhale for 6 seconds.",
  },
};

export const upsert = (arr, match, data, now, randomUUID) => {
  const index = arr.findIndex((item) =>
    Object.keys(match).every((key) => item[key] === match[key])
  );

  if (index < 0) {
    const doc = {
      id: randomUUID(),
      ...match,
      ...data,
      createdAt: now(),
      updatedAt: now(),
    };

    arr.push(doc);
    return doc;
  }

  arr[index] = {
    ...arr[index],
    ...data,
    updatedAt: now(),
  };

  return arr[index];
};
