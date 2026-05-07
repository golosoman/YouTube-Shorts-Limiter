export const StorageKey = {
  UsageState: "shorts-limiter.usage-state",
  Settings: "shorts-limiter.settings",
} as const;

export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey];

export const storageConfig = {
  keys: {
    usageState: StorageKey.UsageState,
    settings: StorageKey.Settings,
  },
} as const;
