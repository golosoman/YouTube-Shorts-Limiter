import type { UsageState } from "./UsageState";

export const BlockReason = {
  ShortsCooldownActive: "shorts-cooldown-active",
  ShortsLimitExceeded: "shorts-limit-exceeded",
  YouTubeCooldownActive: "youtube-cooldown-active",
  YouTubeLimitExceeded: "youtube-limit-exceeded",
} as const;

export type BlockReason = (typeof BlockReason)[keyof typeof BlockReason];

export type PolicyDecision =
  | {
      readonly kind: "allow";
      readonly nextState: UsageState;
    }
  | {
      readonly kind: "block";
      readonly reason: BlockReason;
      readonly reasons: readonly BlockReason[];
      readonly nextState: UsageState;
    };
