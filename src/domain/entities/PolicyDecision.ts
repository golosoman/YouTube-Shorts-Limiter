import type { UsageState } from "./UsageState";

export const BlockReason = {
  CooldownActive: "cooldown-active",
  LimitExceeded: "limit-exceeded",
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
      readonly nextState: UsageState;
    };
