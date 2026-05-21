import type { PolicyDecision } from "@/domain/entities/PolicyDecision";
import type { UsageState } from "@/domain/entities/UsageState";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";
import type { WatchScope } from "@/domain/entities/WatchScope";

export interface WatchLimitPolicy {
  evaluate(
    state: UsageState,
    policy: WatchPolicy,
    nowMs: number,
    activeScopes: readonly WatchScope[],
  ): PolicyDecision;
}
