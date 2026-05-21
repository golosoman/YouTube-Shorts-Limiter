import { describe, expect, it } from "vitest";
import { WatchLimitPolicyService } from "@/app/services/watch-limit-policy/service";
import { BlockReason } from "@/domain/entities/PolicyDecision";
import type { UsageState } from "@/domain/entities/UsageState";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";
import { WatchScope } from "@/domain/entities/WatchScope";

describe("WatchLimitPolicyService", () => {
  const service = new WatchLimitPolicyService();
  const policy: WatchPolicy = {
    shorts: { allowedMs: 1_000, cooldownMs: 5_000 },
    youtube: { allowedMs: 2_000, cooldownMs: 10_000 },
  };

  it("does not add elapsed time on the first tick", () => {
    const decision = service.evaluate(
      {
        ...createUsageState(),
        youtube: { usedMs: 100, lastTickAtMs: null, blockedUntilMs: null },
      },
      policy,
      1_000,
      [WatchScope.YouTube],
    );

    expect(decision.kind).toBe("allow");
    expect(decision.nextState.youtube).toEqual({
      usedMs: 100,
      lastTickAtMs: 1_000,
      blockedUntilMs: null,
    });
  });

  it("updates only YouTube for ordinary YouTube watching", () => {
    const decision = service.evaluate(
      {
        shorts: { usedMs: 50, lastTickAtMs: 500, blockedUntilMs: null },
        youtube: { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
      },
      policy,
      1_500,
      [WatchScope.YouTube],
    );

    expect(decision.nextState).toEqual({
      shorts: { usedMs: 50, lastTickAtMs: null, blockedUntilMs: null },
      youtube: { usedMs: 600, lastTickAtMs: 1_500, blockedUntilMs: null },
    });
  });

  it("updates Shorts and YouTube for Shorts watching", () => {
    const decision = service.evaluate(
      {
        shorts: { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
        youtube: { usedMs: 200, lastTickAtMs: 1_000, blockedUntilMs: null },
      },
      policy,
      1_500,
      [WatchScope.Shorts, WatchScope.YouTube],
    );

    expect(decision.nextState).toEqual({
      shorts: { usedMs: 600, lastTickAtMs: 1_500, blockedUntilMs: null },
      youtube: { usedMs: 700, lastTickAtMs: 1_500, blockedUntilMs: null },
    });
  });

  it("clamps negative elapsed time to zero", () => {
    const decision = service.evaluate(
      {
        ...createUsageState(),
        youtube: { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
      },
      policy,
      500,
      [WatchScope.YouTube],
    );

    expect(decision.nextState.youtube.usedMs).toBe(100);
  });

  it("blocks Shorts only when Shorts are cooling down", () => {
    const decision = service.evaluate(
      {
        ...createUsageState(),
        shorts: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: 2_000 },
      },
      policy,
      1_000,
      [WatchScope.Shorts, WatchScope.YouTube],
    );

    expect(decision.kind).toBe("block");
    expect(decision.kind === "block" ? decision.reason : null).toBe(
      BlockReason.ShortsCooldownActive,
    );
  });

  it("blocks ordinary YouTube and Shorts when YouTube is cooling down", () => {
    const ordinaryDecision = service.evaluate(
      {
        ...createUsageState(),
        youtube: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: 2_000 },
      },
      policy,
      1_000,
      [WatchScope.YouTube],
    );
    const shortsDecision = service.evaluate(
      {
        ...createUsageState(),
        youtube: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: 2_000 },
      },
      policy,
      1_000,
      [WatchScope.Shorts, WatchScope.YouTube],
    );

    expect(ordinaryDecision.kind === "block" ? ordinaryDecision.reason : null).toBe(
      BlockReason.YouTubeCooldownActive,
    );
    expect(shortsDecision.kind === "block" ? shortsDecision.reason : null).toBe(
      BlockReason.YouTubeCooldownActive,
    );
  });

  it("sets blockedUntilMs when a limit is exceeded", () => {
    const decision = service.evaluate(
      {
        ...createUsageState(),
        youtube: { usedMs: 1_900, lastTickAtMs: 1_000, blockedUntilMs: null },
      },
      policy,
      1_100,
      [WatchScope.YouTube],
    );

    expect(decision).toEqual({
      kind: "block",
      reason: BlockReason.YouTubeLimitExceeded,
      reasons: [BlockReason.YouTubeLimitExceeded],
      nextState: {
        shorts: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
        youtube: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: 11_100 },
      },
    });
  });

  it("clears lastTickAtMs when not watching without losing usage or cooldown", () => {
    const decision = service.evaluate(
      {
        shorts: { usedMs: 300, lastTickAtMs: 1_000, blockedUntilMs: 2_000 },
        youtube: { usedMs: 400, lastTickAtMs: 1_000, blockedUntilMs: 3_000 },
      },
      policy,
      4_000,
      [],
    );

    expect(decision.nextState).toEqual({
      shorts: { usedMs: 300, lastTickAtMs: null, blockedUntilMs: 2_000 },
      youtube: { usedMs: 400, lastTickAtMs: null, blockedUntilMs: 3_000 },
    });
  });
});

function createUsageState(): UsageState {
  return {
    shorts: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
    youtube: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
  };
}
