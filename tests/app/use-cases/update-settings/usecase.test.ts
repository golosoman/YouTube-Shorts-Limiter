import { describe, expect, it } from "vitest";
import type { SettingsValidator } from "@/app/interfaces/services/settings-validator/interface";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import { UpdateSettingsError } from "@/app/interfaces/use-cases/update-settings/error";
import { UpdateSettingsUseCase } from "@/app/use-cases/update-settings/usecase";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";
import { DurationMs } from "@/domain/value-objects/DurationMs";

describe("UpdateSettingsUseCase", () => {
  it("converts minutes to milliseconds, validates, and saves settings", async () => {
    const repository = new FakeSettingsRepository();
    const validator = new FakeSettingsValidator();
    const useCase = new UpdateSettingsUseCase(repository, validator);

    await useCase.execute({
      shortsAllowedMinutes: 2,
      shortsCooldownMinutes: 3,
      youtubeAllowedMinutes: 4,
      youtubeCooldownMinutes: 5,
    });

    const expectedSettings = {
      shorts: {
        allowedMs: DurationMs.fromMinutes(2).value,
        cooldownMs: DurationMs.fromMinutes(3).value,
      },
      youtube: {
        allowedMs: DurationMs.fromMinutes(4).value,
        cooldownMs: DurationMs.fromMinutes(5).value,
      },
    };
    expect(validator.validated).toEqual(expectedSettings);
    expect(repository.saved).toEqual(expectedSettings);
  });

  it("wraps validation errors", async () => {
    const repository = new FakeSettingsRepository();
    const validator = new ThrowingSettingsValidator();
    const useCase = new UpdateSettingsUseCase(repository, validator);

    await expect(
      useCase.execute({
        shortsAllowedMinutes: 2,
        shortsCooldownMinutes: 3,
        youtubeAllowedMinutes: 4,
        youtubeCooldownMinutes: 5,
      }),
    ).rejects.toBeInstanceOf(UpdateSettingsError);
  });

  it("wraps repository errors", async () => {
    const repository = new ThrowingSettingsRepository();
    const validator = new FakeSettingsValidator();
    const useCase = new UpdateSettingsUseCase(repository, validator);

    await expect(
      useCase.execute({
        shortsAllowedMinutes: 2,
        shortsCooldownMinutes: 3,
        youtubeAllowedMinutes: 4,
        youtubeCooldownMinutes: 5,
      }),
    ).rejects.toBeInstanceOf(UpdateSettingsError);
  });
});

class FakeSettingsRepository implements SettingsRepository {
  saved: WatchPolicy | null = null;

  get(): Promise<WatchPolicy> {
    return Promise.resolve(createEmptySettings());
  }

  save(settings: WatchPolicy): Promise<void> {
    this.saved = settings;
    return Promise.resolve();
  }
}

class ThrowingSettingsRepository extends FakeSettingsRepository {
  override save(_settings: WatchPolicy): Promise<void> {
    void _settings;
    return Promise.reject(new Error("write failed"));
  }
}

class FakeSettingsValidator implements SettingsValidator {
  validated: WatchPolicy | null = null;

  validate(settings: WatchPolicy): WatchPolicy {
    this.validated = settings;
    return settings;
  }
}

class ThrowingSettingsValidator implements SettingsValidator {
  validate(_settings: WatchPolicy): WatchPolicy {
    void _settings;
    throw new Error("invalid settings");
  }
}

function createEmptySettings(): WatchPolicy {
  return {
    shorts: { allowedMs: 0, cooldownMs: 0 },
    youtube: { allowedMs: 0, cooldownMs: 0 },
  };
}
