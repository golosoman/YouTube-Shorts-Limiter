import { describe, expect, it } from "vitest";
import { WatchLimitPolicyService } from "@/app/services/watch-limit-policy/service";
import { BlockReason } from "@/domain/entities/PolicyDecision";
import type { UsageState } from "@/domain/entities/UsageState";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";

describe("WatchLimitPolicyService", () => {
  const service = new WatchLimitPolicyService();
  const policy: WatchPolicy = { allowedMs: 1_000, cooldownMs: 5_000 };

  it("does not add elapsed time on the first tick", () => {
    const decision = service.evaluateWatchingShorts(
      { usedMs: 100, lastTickAtMs: null, blockedUntilMs: null },
      policy,
      1_000,
    );

    expect(decision.kind).toBe("allow");
    expect(decision.nextState).toEqual({
      usedMs: 100,
      lastTickAtMs: 1_000,
      blockedUntilMs: null,
    });
  });

  it("adds elapsed time when the previous tick exists", () => {
    const decision = service.evaluateWatchingShorts(
      { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
      policy,
      1_500,
    );

    expect(decision.nextState.usedMs).toBe(600);
  });

  it("clamps negative elapsed time to zero", () => {
    const decision = service.evaluateWatchingShorts(
      { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
      policy,
      500,
    );

    expect(decision.nextState.usedMs).toBe(100);
  });

  it("blocks when used time reaches the allowed duration", () => {
    const decision = service.evaluateWatchingShorts(
      { usedMs: 900, lastTickAtMs: 1_000, blockedUntilMs: null },
      policy,
      1_100,
    );

    expect(decision).toEqual({
      kind: "block",
      reason: BlockReason.LimitExceeded,
      nextState: {
        usedMs: 0,
        lastTickAtMs: null,
        blockedUntilMs: 6_100,
      },
    });
  });

  it("blocks during cooldown", () => {
    const state: UsageState = { usedMs: 300, lastTickAtMs: null, blockedUntilMs: 2_000 };
    const decision = service.evaluateWatchingShorts(state, policy, 1_000);

    expect(decision).toEqual({
      kind: "block",
      reason: BlockReason.CooldownActive,
      nextState: state,
    });
  });

  it("clears lastTickAtMs when not watching Shorts and preserves usage", () => {
    expect(
      service.evaluateNotWatchingShorts({
        usedMs: 300,
        lastTickAtMs: 1_000,
        blockedUntilMs: 2_000,
      }),
    ).toEqual({
      usedMs: 300,
      lastTickAtMs: null,
      blockedUntilMs: 2_000,
    });
  });
});
