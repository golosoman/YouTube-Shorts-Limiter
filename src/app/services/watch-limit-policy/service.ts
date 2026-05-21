import type { WatchLimitPolicy } from "@/app/interfaces/services/watch-limit-policy/interface";
import { BlockReason, type PolicyDecision } from "@/domain/entities/PolicyDecision";
import type { UsageBucketState, UsageState } from "@/domain/entities/UsageState";
import type { WatchPolicy, WatchPolicyBucket } from "@/domain/entities/WatchPolicy";
import { WatchScope, type WatchScope as WatchScopeValue } from "@/domain/entities/WatchScope";
import { DurationMs } from "@/domain/value-objects/DurationMs";

interface BucketDecision {
  readonly bucket: UsageBucketState;
  readonly reason: BlockReason | null;
}

export class WatchLimitPolicyService implements WatchLimitPolicy {
  evaluate(
    state: UsageState,
    policy: WatchPolicy,
    nowMs: number,
    activeScopes: readonly WatchScopeValue[],
  ): PolicyDecision {
    const shortsDecision = this.evaluateBucket(
      state.shorts,
      policy.shorts,
      nowMs,
      activeScopes.includes(WatchScope.Shorts),
      WatchScope.Shorts,
    );
    const youtubeDecision = this.evaluateBucket(
      state.youtube,
      policy.youtube,
      nowMs,
      activeScopes.includes(WatchScope.YouTube),
      WatchScope.YouTube,
    );
    const reasons = [youtubeDecision.reason, shortsDecision.reason].filter(
      (reason): reason is BlockReason => reason !== null,
    );
    const nextState = {
      shorts: shortsDecision.bucket,
      youtube: youtubeDecision.bucket,
    };

    const primaryReason = reasons[0];

    if (primaryReason !== undefined) {
      return {
        kind: "block",
        reason: primaryReason,
        reasons,
        nextState,
      };
    }

    return {
      kind: "allow",
      nextState,
    };
  }

  private evaluateBucket(
    state: UsageBucketState,
    policy: WatchPolicyBucket,
    nowMs: number,
    isWatching: boolean,
    scope: WatchScopeValue,
  ): BucketDecision {
    if (!isWatching) {
      return {
        bucket: this.clearLastTick(state),
        reason: null,
      };
    }

    if (state.blockedUntilMs !== null && nowMs < state.blockedUntilMs) {
      return {
        bucket: state,
        reason: this.getCooldownReason(scope),
      };
    }

    const elapsedMs =
      state.lastTickAtMs === null
        ? DurationMs.zero().value
        : Math.max(DurationMs.zero().value, nowMs - state.lastTickAtMs);
    const nextUsedMs = state.usedMs + elapsedMs;

    if (nextUsedMs >= policy.allowedMs) {
      return {
        bucket: {
          usedMs: DurationMs.zero().value,
          lastTickAtMs: null,
          blockedUntilMs: nowMs + policy.cooldownMs,
        },
        reason: this.getLimitReason(scope),
      };
    }

    return {
      bucket: {
        usedMs: nextUsedMs,
        lastTickAtMs: nowMs,
        blockedUntilMs: state.blockedUntilMs,
      },
      reason: null,
    };
  }

  private clearLastTick(state: UsageBucketState): UsageBucketState {
    return {
      usedMs: state.usedMs,
      lastTickAtMs: null,
      blockedUntilMs: state.blockedUntilMs,
    };
  }

  private getCooldownReason(scope: WatchScopeValue): BlockReason {
    return scope === WatchScope.YouTube
      ? BlockReason.YouTubeCooldownActive
      : BlockReason.ShortsCooldownActive;
  }

  private getLimitReason(scope: WatchScopeValue): BlockReason {
    return scope === WatchScope.YouTube
      ? BlockReason.YouTubeLimitExceeded
      : BlockReason.ShortsLimitExceeded;
  }
}
