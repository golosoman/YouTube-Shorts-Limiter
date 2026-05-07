export interface PersistedUsageStateDto {
  readonly usedMs: number;
  readonly lastTickAtMs: number | null;
  readonly blockedUntilMs: number | null;
}
