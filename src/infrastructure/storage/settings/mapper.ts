import type { PersistedSettingsDto } from "@/app/interfaces/storage/settings/dto";
import { config } from "@/config";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export function mapPersistedSettings(value: unknown): WatchPolicy {
  if (!isRecord(value)) {
    return createInitialSettings();
  }

  const allowedMs = value["allowedMs"];
  const cooldownMs = value["cooldownMs"];

  if (!isFiniteNonNegativeNumber(allowedMs) || !isFiniteNonNegativeNumber(cooldownMs)) {
    return createInitialSettings();
  }

  return {
    allowedMs,
    cooldownMs,
  };
}

export function mapSettingsToPersisted(settings: WatchPolicy): PersistedSettingsDto {
  return {
    allowedMs: settings.allowedMs,
    cooldownMs: settings.cooldownMs,
  };
}

function createInitialSettings(): WatchPolicy {
  return {
    allowedMs: config.application.policy.initialAllowedDuration.value,
    cooldownMs: config.application.policy.initialCooldownDuration.value,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= DurationMs.zero().value;
}
