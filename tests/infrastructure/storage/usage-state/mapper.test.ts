import { describe, expect, it } from "vitest";
import {
  mapPersistedUsageState,
  mapUsageStateToPersisted,
} from "@/infrastructure/storage/usage-state/mapper";

describe("usage state mapper", () => {
  it("maps valid persisted state", () => {
    expect(
      mapPersistedUsageState({
        usedMs: 100,
        lastTickAtMs: 200,
        blockedUntilMs: 300,
      }),
    ).toEqual({
      usedMs: 100,
      lastTickAtMs: 200,
      blockedUntilMs: 300,
    });
  });

  it("falls back safely for corrupted data", () => {
    expect(
      mapPersistedUsageState({
        usedMs: 100,
        lastTickAtMs: "bad",
        blockedUntilMs: null,
      }),
    ).toEqual({
      usedMs: 0,
      lastTickAtMs: null,
      blockedUntilMs: null,
    });
  });

  it("maps state to persisted dto", () => {
    expect(
      mapUsageStateToPersisted({
        usedMs: 100,
        lastTickAtMs: 200,
        blockedUntilMs: null,
      }),
    ).toEqual({
      usedMs: 100,
      lastTickAtMs: 200,
      blockedUntilMs: null,
    });
  });
});
