/** Return a stable UTC date key, e.g. 2026-11-18. */
export const dayKey = (date = new Date()) => new Date(date).toISOString().slice(0, 10);

export const startOfUtcDay = (date = new Date()) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/** Number of whole days between two dates (positive when `later` is newer). */
export const daysBetween = (earlier, later) => {
  const a = startOfUtcDay(earlier).getTime();
  const b = startOfUtcDay(later).getTime();
  return Math.round((b - a) / 86_400_000);
};

export const lastNDays = (count, end = new Date()) => {
  const days = [];
  const endDay = startOfUtcDay(end);
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(endDay);
    date.setUTCDate(date.getUTCDate() - i);
    days.push(date);
  }
  return days;
};
