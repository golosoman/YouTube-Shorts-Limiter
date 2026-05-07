import { describe, expect, it } from "vitest";
import { InvalidSettingsError } from "@/app/interfaces/services/settings-validator/error";
import { SettingsValidatorService } from "@/app/services/settings-validator/service";
import { config } from "@/config";

describe("SettingsValidatorService", () => {
  const service = new SettingsValidatorService();

  it("accepts valid settings", () => {
    const settings = {
      allowedMs: config.validation.settings.allowedDuration.min.value,
      cooldownMs: config.validation.settings.cooldownDuration.min.value,
    };

    expect(service.validate(settings)).toEqual(settings);
  });

  it("rejects non-finite values", () => {
    expect(() =>
      service.validate({
        allowedMs: Number.POSITIVE_INFINITY,
        cooldownMs: config.validation.settings.cooldownDuration.min.value,
      }),
    ).toThrow(InvalidSettingsError);
  });

  it("rejects values below min", () => {
    expect(() =>
      service.validate({
        allowedMs: config.validation.settings.allowedDuration.min.value - 1,
        cooldownMs: config.validation.settings.cooldownDuration.min.value,
      }),
    ).toThrow(InvalidSettingsError);
  });

  it("rejects values above max", () => {
    expect(() =>
      service.validate({
        allowedMs: config.validation.settings.allowedDuration.max.value + 1,
        cooldownMs: config.validation.settings.cooldownDuration.min.value,
      }),
    ).toThrow(InvalidSettingsError);
  });
});
