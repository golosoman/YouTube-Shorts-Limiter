import { describe, expect, it } from "vitest";
import { config } from "@/config";
import {
  mapPersistedSettings,
  mapSettingsToPersisted,
} from "@/infrastructure/storage/settings/mapper";

describe("settings mapper", () => {
  it("maps valid nested persisted settings", () => {
    expect(
      mapPersistedSettings({
        shorts: { allowedMs: 100, cooldownMs: 200 },
        youtube: { allowedMs: 300, cooldownMs: 400 },
      }),
    ).toEqual({
      shorts: { allowedMs: 100, cooldownMs: 200 },
      youtube: { allowedMs: 300, cooldownMs: 400 },
    });
  });

  it("migrates old flat settings to Shorts and initial YouTube settings", () => {
    expect(mapPersistedSettings({ allowedMs: 100, cooldownMs: 200 })).toEqual({
      shorts: { allowedMs: 100, cooldownMs: 200 },
      youtube: {
        allowedMs: config.application.policy.initial.youtube.allowedDuration.value,
        cooldownMs: config.application.policy.initial.youtube.cooldownDuration.value,
      },
    });
  });

  it("falls back to initial settings for missing data", () => {
    expect(mapPersistedSettings(undefined)).toEqual({
      shorts: {
        allowedMs: config.application.policy.initial.shorts.allowedDuration.value,
        cooldownMs: config.application.policy.initial.shorts.cooldownDuration.value,
      },
      youtube: {
        allowedMs: config.application.policy.initial.youtube.allowedDuration.value,
        cooldownMs: config.application.policy.initial.youtube.cooldownDuration.value,
      },
    });
  });

  it("falls back safely for corrupted data", () => {
    expect(mapPersistedSettings({ shorts: { allowedMs: "bad", cooldownMs: 200 } })).toEqual({
      shorts: {
        allowedMs: config.application.policy.initial.shorts.allowedDuration.value,
        cooldownMs: config.application.policy.initial.shorts.cooldownDuration.value,
      },
      youtube: {
        allowedMs: config.application.policy.initial.youtube.allowedDuration.value,
        cooldownMs: config.application.policy.initial.youtube.cooldownDuration.value,
      },
    });
  });

  it("maps settings to persisted dto", () => {
    expect(
      mapSettingsToPersisted({
        shorts: { allowedMs: 100, cooldownMs: 200 },
        youtube: { allowedMs: 300, cooldownMs: 400 },
      }),
    ).toEqual({
      shorts: { allowedMs: 100, cooldownMs: 200 },
      youtube: { allowedMs: 300, cooldownMs: 400 },
    });
  });
});
