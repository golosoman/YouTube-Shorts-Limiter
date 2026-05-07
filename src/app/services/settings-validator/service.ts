import type { SettingsValidator } from "@/app/interfaces/services/settings-validator/interface";
import { InvalidSettingsError } from "@/app/interfaces/services/settings-validator/error";
import { config } from "@/config";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";

export class SettingsValidatorService implements SettingsValidator {
  validate(settings: WatchPolicy): WatchPolicy {
    this.assertDuration(
      settings.allowedMs,
      config.validation.settings.allowedDuration.min.value,
      config.validation.settings.allowedDuration.max.value,
      "Allowed duration is outside the supported range.",
    );
    this.assertDuration(
      settings.cooldownMs,
      config.validation.settings.cooldownDuration.min.value,
      config.validation.settings.cooldownDuration.max.value,
      "Cooldown duration is outside the supported range.",
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
