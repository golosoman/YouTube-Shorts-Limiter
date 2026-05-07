export interface GetStatusResultDto {
  readonly usedMs: number;
  readonly allowedMs: number;
  readonly cooldownMs: number;
  readonly allowedMinutes: number;
  readonly cooldownMinutes: number;
  readonly remainingMs: number;
  readonly isBlocked: boolean;
  readonly blockedUntilMs: number | null;
  readonly cooldownRemainingMs: number;
}
