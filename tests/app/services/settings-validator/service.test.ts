import { describe, expect, it } from "vitest";
import { InvalidSettingsError } from "@/app/interfaces/services/settings-validator/error";
import { SettingsValidatorService } from "@/app/services/settings-validator/service";
import { config } from "@/config";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";

describe("SettingsValidatorService", () => {
  const service = new SettingsValidatorService();

  it("accepts valid settings", () => {
    const settings = createValidSettings();

    expect(service.validate(settings)).toEqual(settings);
  });

  it("rejects non-finite values", () => {
    expect(() =>
      service.validate({
        ...createValidSettings(),
        youtube: {
          ...createValidSettings().youtube,
          allowedMs: Number.POSITIVE_INFINITY,
        },
      }),
    ).toThrow(InvalidSettingsError);
  });

  it("rejects values below min", () => {
    expect(() =>
      service.validate({
        ...createValidSettings(),
        shorts: {
          ...createValidSettings().shorts,
          allowedMs: config.validation.settings.shorts.allowedDuration.min.value - 1,
        },
      }),
    ).toThrow(InvalidSettingsError);
  });

  it("rejects values above max", () => {
    expect(() =>
      service.validate({
        ...createValidSettings(),
        youtube: {
          ...createValidSettings().youtube,
          allowedMs: config.validation.settings.youtube.allowedDuration.max.value + 1,
        },
      }),
    ).toThrow(InvalidSettingsError);
  });
});

function createValidSettings(): WatchPolicy {
  return {
    shorts: {
      allowedMs: config.validation.settings.shorts.allowedDuration.min.value,
      cooldownMs: config.validation.settings.shorts.cooldownDuration.min.value,
    },
    youtube: {
      allowedMs: config.validation.settings.youtube.allowedDuration.min.value,
      cooldownMs: config.validation.settings.youtube.cooldownDuration.min.value,
    },
  };
}
