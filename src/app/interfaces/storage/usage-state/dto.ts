export interface PersistedUsageBucketStateOutputDto {
  readonly usedMs: number;
  readonly lastTickAtMs: number | null;
  readonly blockedUntilMs: number | null;
}

export interface PersistedUsageStateOutputDto {
  readonly shorts: PersistedUsageBucketStateOutputDto;
  readonly youtube: PersistedUsageBucketStateOutputDto;
}
