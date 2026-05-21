import type { SettingsValidator } from "@/app/interfaces/services/settings-validator/interface";
import { InvalidSettingsError } from "@/app/interfaces/services/settings-validator/error";
import { config } from "@/config";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";

export class SettingsValidatorService implements SettingsValidator {
  validate(settings: WatchPolicy): WatchPolicy {
    this.assertDuration(
      settings.shorts.allowedMs,
      config.validation.settings.shorts.allowedDuration.min.value,
      config.validation.settings.shorts.allowedDuration.max.value,
      "Shorts allowed duration is outside the supported range.",
    );
    this.assertDuration(
      settings.shorts.cooldownMs,
      config.validation.settings.shorts.cooldownDuration.min.value,
      config.validation.settings.shorts.cooldownDuration.max.value,
      "Shorts cooldown duration is outside the supported range.",
    );
    this.assertDuration(
      settings.youtube.allowedMs,
      config.validation.settings.youtube.allowedDuration.min.value,
      config.validation.settings.youtube.allowedDuration.max.value,
      "YouTube allowed duration is outside the supported range.",
    );
    this.assertDuration(
      settings.youtube.cooldownMs,
      config.validation.settings.youtube.cooldownDuration.min.value,
      config.validation.settings.youtube.cooldownDuration.max.value,
      "YouTube cooldown duration is outside the supported range.",
    );

    return settings;
  }

  private assertDuration(value: number, min: number, max: number, message: string): void {
    if (!Number.isFinite(value)) {
      throw new InvalidSettingsError("Settings durations must be finite numbers.");
    }

    if (value < min || value > max) {
      throw new InvalidSettingsError(message);
    }
  }
}
