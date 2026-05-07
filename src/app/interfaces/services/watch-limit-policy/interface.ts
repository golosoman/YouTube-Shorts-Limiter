import type { PolicyDecision } from "@/domain/entities/PolicyDecision";
import type { UsageState } from "@/domain/entities/UsageState";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";

export interface WatchLimitPolicy {
  evaluateWatchingShorts(state: UsageState, policy: WatchPolicy, nowMs: number): PolicyDecision;
  evaluateNotWatchingShorts(state: UsageState): UsageState;
}
