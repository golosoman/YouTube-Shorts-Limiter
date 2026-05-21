const PERCENT_MIN = 0;
const PERCENT_MAX = 100;

export function calculateProgressPercent(usedMs: number, allowedMs: number): number {
  if (allowedMs <= 0) {
    return PERCENT_MIN;
  }

  return Math.min(PERCENT_MAX, Math.max(PERCENT_MIN, (usedMs / allowedMs) * PERCENT_MAX));
}
