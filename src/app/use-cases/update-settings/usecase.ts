import type { SettingsValidator } from "@/app/interfaces/services/settings-validator/interface";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import type { UpdateSettingsInputDto } from "@/app/interfaces/use-cases/update-settings/dto";
import { UpdateSettingsError } from "@/app/interfaces/use-cases/update-settings/error";
import type { UpdateSettings } from "@/app/interfaces/use-cases/update-settings/interface";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export class UpdateSettingsUseCase implements UpdateSettings {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly settingsValidator: SettingsValidator,
  ) {}

  async execute(input: UpdateSettingsInputDto): Promise<void> {
    try {
      const settings = this.settingsValidator.validate({
        shorts: {
          allowedMs: DurationMs.fromMinutes(input.shortsAllowedMinutes).value,
          cooldownMs: DurationMs.fromMinutes(input.shortsCooldownMinutes).value,
        },
        youtube: {
          allowedMs: DurationMs.fromMinutes(input.youtubeAllowedMinutes).value,
          cooldownMs: DurationMs.fromMinutes(input.youtubeCooldownMinutes).value,
        },
      });

      await this.settingsRepository.save(settings);
    } catch (error) {
      throw new UpdateSettingsError(error);
    }
  }
}
