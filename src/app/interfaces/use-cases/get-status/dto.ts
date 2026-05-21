import type { WatchScope } from "@/domain/entities/WatchScope";

export const ActiveBlockKind = {
  None: "none",
  Shorts: "shorts",
  YouTube: "youtube",
} as const;

export type ActiveBlockKind = (typeof ActiveBlockKind)[keyof typeof ActiveBlockKind];

export interface ScopeStatusOutputDto {
  readonly scope: WatchScope;
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

export type ActiveBlockOutputDto =
  | {
      readonly kind: typeof ActiveBlockKind.None;
    }
  | {
      readonly kind: typeof ActiveBlockKind.Shorts | typeof ActiveBlockKind.YouTube;
      readonly scope: WatchScope;
      readonly blockedUntilMs: number | null;
      readonly cooldownRemainingMs: number;
    };

export interface GetStatusOutputDto {
  readonly shorts: ScopeStatusOutputDto;
  readonly youtube: ScopeStatusOutputDto;
  readonly activeBlock: ActiveBlockOutputDto;
}
