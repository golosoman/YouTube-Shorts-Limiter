export const WatchScope = {
  Shorts: "shorts",
  YouTube: "youtube",
} as const;

export type WatchScope = (typeof WatchScope)[keyof typeof WatchScope];
