import { describe, expect, it } from "vitest";
import {
  mapPersistedUsageState,
  mapUsageStateToPersisted,
} from "@/infrastructure/storage/usage-state/mapper";

describe("usage state mapper", () => {
  it("maps valid nested persisted state", () => {
    expect(
      mapPersistedUsageState({
        shorts: { usedMs: 100, lastTickAtMs: 200, blockedUntilMs: 300 },
        youtube: { usedMs: 400, lastTickAtMs: 500, blockedUntilMs: 600 },
      }),
    ).toEqual({
      shorts: { usedMs: 100, lastTickAtMs: 200, blockedUntilMs: 300 },
      youtube: { usedMs: 400, lastTickAtMs: 500, blockedUntilMs: 600 },
    });
  });

  it("migrates old flat state to Shorts and initial YouTube state", () => {
    expect(
      mapPersistedUsageState({
        usedMs: 100,
        lastTickAtMs: 200,
        blockedUntilMs: 300,
      }),
    ).toEqual({
      shorts: { usedMs: 100, lastTickAtMs: 200, blockedUntilMs: 300 },
      youtube: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
    });
  });

  it("falls back safely for corrupted data", () => {
    expect(
      mapPersistedUsageState({
        shorts: { usedMs: 100, lastTickAtMs: "bad", blockedUntilMs: null },
      }),
    ).toEqual({
      shorts: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
      youtube: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
    });
  });

  it("maps state to persisted dto", () => {
    expect(
      mapUsageStateToPersisted({
        shorts: { usedMs: 100, lastTickAtMs: 200, blockedUntilMs: null },
        youtube: { usedMs: 300, lastTickAtMs: 400, blockedUntilMs: 500 },
      }),
    ).toEqual({
      shorts: { usedMs: 100, lastTickAtMs: 200, blockedUntilMs: null },
      youtube: { usedMs: 300, lastTickAtMs: 400, blockedUntilMs: 500 },
    });
  });
});
