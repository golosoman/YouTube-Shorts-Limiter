import type { WatchLimitPolicy } from "@/app/interfaces/services/watch-limit-policy/interface";
import { BlockReason, type PolicyDecision } from "@/domain/entities/PolicyDecision";
import type { UsageState } from "@/domain/entities/UsageState";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export class WatchLimitPolicyService implements WatchLimitPolicy {
  evaluateWatchingShorts(state: UsageState, policy: WatchPolicy, nowMs: number): PolicyDecision {
    if (state.blockedUntilMs !== null && nowMs < state.blockedUntilMs) {
      return {
        kind: "block",
        reason: BlockReason.CooldownActive,
        nextState: state,
      };
    }

    const elapsedMs =
      state.lastTickAtMs === null
        ? DurationMs.zero().value
        : Math.max(DurationMs.zero().value, nowMs - state.lastTickAtMs);

    const nextUsedMs = state.usedMs + elapsedMs;

    if (nextUsedMs >= policy.allowedMs) {
      return {
        kind: "block",
        reason: BlockReason.LimitExceeded,
        nextState: {
          usedMs: DurationMs.zero().value,
          lastTickAtMs: null,
          blockedUntilMs: nowMs + policy.cooldownMs,
        },
      };
    }

    return {
      kind: "allow",
      nextState: {
        usedMs: nextUsedMs,
        lastTickAtMs: nowMs,
        blockedUntilMs: state.blockedUntilMs,
      },
    };
  }

  evaluateNotWatchingShorts(state: UsageState): UsageState {
    return {
      usedMs: state.usedMs,
      lastTickAtMs: null,
      blockedUntilMs: state.blockedUntilMs,
    };
  }
}
