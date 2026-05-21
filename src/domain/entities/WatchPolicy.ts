export interface WatchPolicyBucket {
  readonly allowedMs: number;
  readonly cooldownMs: number;
}

export interface WatchPolicy {
  readonly shorts: WatchPolicyBucket;
  readonly youtube: WatchPolicyBucket;
}
