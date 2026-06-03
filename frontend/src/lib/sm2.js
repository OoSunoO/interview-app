// SM-2 spaced repetition algorithm — pure functions, no Svelte dependency

export const RATINGS = {
  forgot: { label: "忘记了", quality: 1, color: "danger", short: "忘记" },
  hard: { label: "不太熟", quality: 2, color: "warning", short: "模糊" },
  good: { label: "答对了", quality: 4, color: "success", short: "记得" },
  easy: { label: "很简单", quality: 5, color: "accent", short: "轻松" },
};

export const QUICK_REVIEW_MAP = { forgot: "forgot", unsure: "hard", remembered: "good" };

export function getDefaultProgress() {
  return { ef: 2.5, interval: 0, repetitions: 0, next_review_at: null };
}

export function calculateSM2(quality, prev = {}) {
  const ef = Math.max(1.3, prev.ef ?? 2.5);
  const interval = prev.interval ?? 0;
  const repetitions = prev.repetitions ?? 0;

  let newEF = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);

  let newInterval;
  let newRepetitions;

  if (quality >= 3) {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) newInterval = 1;
    else if (newRepetitions === 2) newInterval = 6;
    else newInterval = Math.round(interval * newEF);
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  const now = new Date();
  const nextReview = new Date(now.getTime() + newInterval * 86400000);

  return {
    ef: Math.round(newEF * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions,
    next_review_at: nextReview.toISOString(),
  };
}

export function rateCard(rating, prevProgress) {
  const entry = RATINGS[rating];
  if (!entry) return { ...getDefaultProgress(), next_review_at: null };
  return calculateSM2(entry.quality, prevProgress);
}
