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
        allowedMs: DurationMs.fromMinutes(input.allowedMinutes).value,
        cooldownMs: DurationMs.fromMinutes(input.cooldownMinutes).value,
      });

      await this.settingsRepository.save(settings);
    } catch (error) {
      throw new UpdateSettingsError(error);
    }
  }
}
