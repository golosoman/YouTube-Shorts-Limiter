export interface UsageBucketState {
  readonly usedMs: number;
  readonly lastTickAtMs: number | null;
  readonly blockedUntilMs: number | null;
}

export interface UsageState {
  readonly shorts: UsageBucketState;
  readonly youtube: UsageBucketState;
}
