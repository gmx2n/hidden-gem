export const SCENERY_LABELS = { 1: "Boring", 2: "Decent", 3: "Nice", 4: "Beautiful", 5: "Breathtaking" };
export const CROWDS_LABELS = { 1: "Empty", 2: "Some People", 3: "Crowded" };
export const BEST_TIME_LABELS = { 1: "Sunrise", 2: "Morning", 3: "Afternoon", 4: "Sunset", 5: "Midnight" };

export function translateRating(avg, labels) {
  if (avg === null || avg === undefined || Number.isNaN(avg)) return "—";

  const lower = Math.floor(avg);
  const upper = Math.ceil(avg);
  const fraction = avg - lower;

  if (lower === upper || fraction <= 0.2) {
    return labels[lower] ?? labels[Math.round(avg)] ?? "—";
  }
  if (fraction >= 0.8) {
    return labels[upper] ?? labels[Math.round(avg)] ?? "—";
  }

  const lowerLabel = labels[lower];
  const upperLabel = labels[upper];
  if (lowerLabel && upperLabel) {
    return `${lowerLabel} / ${upperLabel}`;
  }
  return labels[Math.round(avg)] ?? "—";
}

export function average(nums) {
  const valid = nums.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}