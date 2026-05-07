import { describe, expect, it } from "vitest";
import { config } from "@/config";
import {
  mapPersistedSettings,
  mapSettingsToPersisted,
} from "@/infrastructure/storage/settings/mapper";

describe("settings mapper", () => {
  it("maps valid persisted settings", () => {
    expect(mapPersistedSettings({ allowedMs: 100, cooldownMs: 200 })).toEqual({
      allowedMs: 100,
      cooldownMs: 200,
    });
  });

  it("falls back to initial settings for missing data", () => {
    expect(mapPersistedSettings(undefined)).toEqual({
      allowedMs: config.application.policy.initialAllowedDuration.value,
      cooldownMs: config.application.policy.initialCooldownDuration.value,
    });
  });

  it("falls back safely for corrupted data", () => {
    expect(mapPersistedSettings({ allowedMs: "bad", cooldownMs: 200 })).toEqual({
      allowedMs: config.application.policy.initialAllowedDuration.value,
      cooldownMs: config.application.policy.initialCooldownDuration.value,
    });
  });

  it("maps settings to persisted dto", () => {
    expect(mapSettingsToPersisted({ allowedMs: 100, cooldownMs: 200 })).toEqual({
      allowedMs: 100,
      cooldownMs: 200,
    });
  });
});
